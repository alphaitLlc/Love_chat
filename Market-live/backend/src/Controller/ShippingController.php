<?php

namespace App\Controller;

use App\Entity\Order;
use App\Entity\Shipping;
use App\Service\ShippingService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/shipping')]
class ShippingController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private ShippingService $shippingService
    ) {}

    #[Route('/calculate', name: 'api_shipping_calculate', methods: ['POST'])]
    public function calculateShipping(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $orderId = $data['orderId'] ?? null;
        $carrier = $data['carrier'] ?? 'colissimo';
        
        if (!$orderId) {
            return new JsonResponse(['error' => 'Order ID required'], 400);
        }
        
        $order = $this->entityManager->getRepository(Order::class)->find($orderId);
        if (!$order) {
            return new JsonResponse(['error' => 'Order not found'], 404);
        }
        
        // Check permissions
        $user = $this->getUser();
        if ($order->getBuyer() !== $user && $order->getSeller() !== $user && !$this->isGranted('ROLE_ADMIN')) {
            return new JsonResponse(['error' => 'Unauthorized'], 403);
        }
        
        try {
            $cost = $this->shippingService->calculateShippingCost($order, $carrier);
            
            return new JsonResponse([
                'carrier' => $carrier,
                'cost' => $cost,
                'currency' => 'EUR'
            ]);
            
        } catch (\Exception $e) {
            return new JsonResponse(['error' => $e->getMessage()], 500);
        }
    }

    #[Route('/carriers/{orderId}', name: 'api_shipping_carriers', methods: ['GET'])]
    public function getAvailableCarriers(int $orderId): JsonResponse
    {
        $order = $this->entityManager->getRepository(Order::class)->find($orderId);
        if (!$order) {
            return new JsonResponse(['error' => 'Order not found'], 404);
        }
        
        // Check permissions
        $user = $this->getUser();
        if ($order->getBuyer() !== $user && $order->getSeller() !== $user && !$this->isGranted('ROLE_ADMIN')) {
            return new JsonResponse(['error' => 'Unauthorized'], 403);
        }
        
        try {
            $carriers = $this->shippingService->getAvailableCarriers($order);
            
            return new JsonResponse(['carriers' => $carriers]);
            
        } catch (\Exception $e) {
            return new JsonResponse(['error' => $e->getMessage()], 500);
        }
    }

    #[Route('/create', name: 'api_shipping_create', methods: ['POST'])]
    public function createShipment(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $orderId = $data['orderId'] ?? null;
        $carrier = $data['carrier'] ?? 'colissimo';
        $options = $data['options'] ?? [];
        
        if (!$orderId) {
            return new JsonResponse(['error' => 'Order ID required'], 400);
        }
        
        $order = $this->entityManager->getRepository(Order::class)->find($orderId);
        if (!$order) {
            return new JsonResponse(['error' => 'Order not found'], 404);
        }
        
        // Only seller can create shipment
        $user = $this->getUser();
        if ($order->getSeller() !== $user && !$this->isGranted('ROLE_ADMIN')) {
            return new JsonResponse(['error' => 'Unauthorized'], 403);
        }
        
        // Check if shipment already exists
        if ($order->getShipping()) {
            return new JsonResponse(['error' => 'Shipment already exists for this order'], 400);
        }
        
        try {
            $shipping = $this->shippingService->createShipment($order, $carrier, $options);
            
            return new JsonResponse([
                'message' => 'Shipment created successfully',
                'shipping' => [
                    'id' => $shipping->getId(),
                    'trackingNumber' => $shipping->getTrackingNumber(),
                    'trackingUrl' => $shipping->getTrackingUrl(),
                    'carrier' => $shipping->getCarrier(),
                    'cost' => $shipping->getCost(),
                    'estimatedDelivery' => $shipping->getEstimatedDelivery()?->format('Y-m-d'),
                    'status' => $shipping->getStatus()
                ]
            ]);
            
        } catch (\Exception $e) {
            return new JsonResponse(['error' => $e->getMessage()], 500);
        }
    }

    #[Route('/track/{id}', name: 'api_shipping_track', methods: ['GET'])]
    public function trackShipment(Shipping $shipping): JsonResponse
    {
        // Check permissions
        $user = $this->getUser();
        $order = $shipping->getOrder();
        
        if ($order->getBuyer() !== $user && $order->getSeller() !== $user && !$this->isGranted('ROLE_ADMIN')) {
            return new JsonResponse(['error' => 'Unauthorized'], 403);
        }
        
        try {
            $trackingData = $this->shippingService->trackShipment($shipping);
            
            return new JsonResponse([
                'tracking' => $trackingData,
                'shipping' => [
                    'id' => $shipping->getId(),
                    'trackingNumber' => $shipping->getTrackingNumber(),
                    'carrier' => $shipping->getCarrier(),
                    'status' => $shipping->getStatus(),
                    'estimatedDelivery' => $shipping->getEstimatedDelivery()?->format('Y-m-d'),
                    'trackingEvents' => $shipping->getTrackingEvents()
                ]
            ]);
            
        } catch (\Exception $e) {
            return new JsonResponse(['error' => $e->getMessage()], 500);
        }
    }

    #[Route('/update-status/{id}', name: 'api_shipping_update_status', methods: ['PUT'])]
    public function updateStatus(Shipping $shipping, Request $request): JsonResponse
    {
        // Only admin or carrier webhook can update status
        if (!$this->isGranted('ROLE_ADMIN')) {
            return new JsonResponse(['error' => 'Unauthorized'], 403);
        }
        
        $data = json_decode($request->getContent(), true);
        $status = $data['status'] ?? null;
        $eventData = $data['eventData'] ?? [];
        
        if (!$status) {
            return new JsonResponse(['error' => 'Status required'], 400);
        }
        
        try {
            $this->shippingService->updateShippingStatus($shipping, $status, $eventData);
            
            return new JsonResponse([
                'message' => 'Shipping status updated successfully',
                'shipping' => [
                    'id' => $shipping->getId(),
                    'status' => $shipping->getStatus(),
                    'trackingEvents' => $shipping->getTrackingEvents()
                ]
            ]);
            
        } catch (\Exception $e) {
            return new JsonResponse(['error' => $e->getMessage()], 500);
        }
    }

    #[Route('/label/{id}', name: 'api_shipping_label', methods: ['GET'])]
    public function generateLabel(Shipping $shipping): JsonResponse
    {
        // Check permissions
        $user = $this->getUser();
        $order = $shipping->getOrder();
        
        if ($order->getSeller() !== $user && !$this->isGranted('ROLE_ADMIN')) {
            return new JsonResponse(['error' => 'Unauthorized'], 403);
        }
        
        try {
            $labelUrl = $this->shippingService->generateShippingLabel($shipping);
            
            return new JsonResponse([
                'labelUrl' => $labelUrl,
                'trackingNumber' => $shipping->getTrackingNumber()
            ]);
            
        } catch (\Exception $e) {
            return new JsonResponse(['error' => $e->getMessage()], 500);
        }
    }

    #[Route('/webhook/{carrier}', name: 'api_shipping_webhook', methods: ['POST'])]
    public function handleCarrierWebhook(string $carrier, Request $request): JsonResponse
    {
        // Handle carrier webhooks for tracking updates
        $payload = json_decode($request->getContent(), true);
        
        try {
            // Verify webhook signature (implementation depends on carrier)
            // Parse tracking update from payload
            // Update shipping status
            
            return new JsonResponse(['message' => 'Webhook processed successfully']);
            
        } catch (\Exception $e) {
            return new JsonResponse(['error' => $e->getMessage()], 500);
        }
    }
}