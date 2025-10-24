<?php

namespace App\Controller;

use App\Entity\Order;
use App\Entity\OrderItem;
use App\Entity\Product;
use App\Service\PaymentService;
use App\Service\NotificationService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/payments')]
class PaymentController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private PaymentService $paymentService,
        private NotificationService $notificationService
    ) {}

    #[Route('/create-intent', name: 'api_payment_create_intent', methods: ['POST'])]
    public function createPaymentIntent(Request $request): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return new JsonResponse(['error' => 'Utilisateur non authentifié'], 401);
        }

        $data = json_decode($request->getContent(), true);

        if (!isset($data['items']) || !is_array($data['items']) || empty($data['items'])) {
            return new JsonResponse(['error' => 'Articles requis'], 400);
        }

        try {
            // Create order
            $order = new Order();
            $order->setBuyer($user);
            $order->setShippingAddress($data['shippingAddress'] ?? []);
            $order->setBillingAddress($data['billingAddress'] ?? $data['shippingAddress'] ?? []);
            $order->setPaymentMethod($data['paymentMethod'] ?? 'stripe');
            $order->setCurrency($data['currency'] ?? 'EUR');

            $subtotal = 0;
            $firstSeller = null;

            // Add order items
            foreach ($data['items'] as $item) {
                $product = $this->entityManager->getRepository(Product::class)->find($item['productId']);
                if (!$product) {
                    return new JsonResponse(['error' => "Produit {$item['productId']} introuvable"], 404);
                }

                if ($product->getStock() < $item['quantity']) {
                    return new JsonResponse(['error' => "Stock insuffisant pour {$product->getTitle()}"], 400);
                }

                $orderItem = new OrderItem();
                $orderItem->setProduct($product);
                $orderItem->setQuantity($item['quantity']);
                $orderItem->setUnitPrice($product->getPrice());
                $order->addOrderItem($orderItem);

                $subtotal += (float)$product->getPrice() * $item['quantity'];

                // Set seller (assuming all items from same seller for now)
                if (!$firstSeller) {
                    $firstSeller = $product->getOwner();
                    $order->setSeller($firstSeller);
                }
            }

            $order->setSubtotal((string)$subtotal);
            
            // Calculate shipping (free over 100€)
            $shippingCost = $subtotal >= 100 ? 0 : 9.99;
            $order->setShippingCost((string)$shippingCost);

            // Calculate tax (20% VAT for France)
            $taxRate = 0.20;
            $taxAmount = $subtotal * $taxRate;
            $order->setTaxAmount((string)$taxAmount);

            $this->entityManager->persist($order);
            $this->entityManager->flush();

            // Create payment intent
            $paymentIntent = $this->paymentService->createPaymentIntent(
                $order,
                $data['paymentMethod'] ?? 'stripe'
            );

            return new JsonResponse([
                'orderId' => $order->getId(),
                'orderNumber' => $order->getOrderNumber(),
                'clientSecret' => $paymentIntent['client_secret'] ?? null,
                'paymentIntentId' => $paymentIntent['id'] ?? null,
                'totalAmount' => $order->getTotalAmount(),
                'currency' => $order->getCurrency()
            ]);

        } catch (\Exception $e) {
            return new JsonResponse(['error' => $e->getMessage()], 500);
        }
    }

    #[Route('/confirm/{orderId}', name: 'api_payment_confirm', methods: ['POST'])]
    public function confirmPayment(int $orderId, Request $request): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return new JsonResponse(['error' => 'Utilisateur non authentifié'], 401);
        }

        $order = $this->entityManager->getRepository(Order::class)->find($orderId);
        if (!$order || $order->getBuyer() !== $user) {
            return new JsonResponse(['error' => 'Commande introuvable'], 404);
        }

        $data = json_decode($request->getContent(), true);

        try {
            // Confirm payment with payment service
            $result = $this->paymentService->confirmPayment(
                $order,
                $data['paymentIntentId'] ?? null
            );

            if ($result['status'] === 'succeeded') {
                $order->setPaymentStatus('paid');
                $order->setStatus('confirmed');
                
                // Update product stock
                foreach ($order->getOrderItems() as $orderItem) {
                    $product = $orderItem->getProduct();
                    $newStock = $product->getStock() - $orderItem->getQuantity();
                    $product->setStock($newStock);
                }

                $this->entityManager->flush();

                // Send notifications
                $this->notificationService->sendOrderConfirmation($order);
                $this->notificationService->sendNewOrderNotification($order);

                return new JsonResponse([
                    'message' => 'Paiement confirmé avec succès',
                    'order' => [
                        'id' => $order->getId(),
                        'orderNumber' => $order->getOrderNumber(),
                        'status' => $order->getStatus(),
                        'paymentStatus' => $order->getPaymentStatus(),
                        'totalAmount' => $order->getTotalAmount()
                    ]
                ]);
            } else {
                $order->setPaymentStatus('failed');
                $this->entityManager->flush();

                return new JsonResponse(['error' => 'Échec du paiement'], 400);
            }

        } catch (\Exception $e) {
            return new JsonResponse(['error' => $e->getMessage()], 500);
        }
    }

    #[Route('/webhook/stripe', name: 'api_payment_webhook_stripe', methods: ['POST'])]
    public function stripeWebhook(Request $request): JsonResponse
    {
        try {
            $payload = $request->getContent();
            $sigHeader = $request->headers->get('stripe-signature');

            $event = $this->paymentService->handleStripeWebhook($payload, $sigHeader);

            switch ($event['type']) {
                case 'payment_intent.succeeded':
                    $paymentIntent = $event['data']['object'];
                    $this->handlePaymentSuccess($paymentIntent);
                    break;

                case 'payment_intent.payment_failed':
                    $paymentIntent = $event['data']['object'];
                    $this->handlePaymentFailure($paymentIntent);
                    break;
            }

            return new JsonResponse(['status' => 'success']);

        } catch (\Exception $e) {
            return new JsonResponse(['error' => $e->getMessage()], 400);
        }
    }

    private function handlePaymentSuccess(array $paymentIntent): void
    {
        $order = $this->entityManager->getRepository(Order::class)
            ->findOneBy(['paymentIntentId' => $paymentIntent['id']]);

        if ($order) {
            $order->setPaymentStatus('paid');
            $order->setStatus('confirmed');
            $this->entityManager->flush();

            $this->notificationService->sendOrderConfirmation($order);
        }
    }

    private function handlePaymentFailure(array $paymentIntent): void
    {
        $order = $this->entityManager->getRepository(Order::class)
            ->findOneBy(['paymentIntentId' => $paymentIntent['id']]);

        if ($order) {
            $order->setPaymentStatus('failed');
            $this->entityManager->flush();

            $this->notificationService->sendPaymentFailureNotification($order);
        }
    }
}