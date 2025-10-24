<?php

namespace App\Service;

use App\Entity\Order;
use App\Entity\PaymentMethod;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Stripe\StripeClient;
use Stripe\Webhook;

class PaymentService
{
    private StripeClient $stripe;
    private string $webhookSecret;

    public function __construct(
        private EntityManagerInterface $entityManager,
        private NotificationService $notificationService,
        string $stripeSecretKey,
        string $stripeWebhookSecret
    ) {
        $this->stripe = new StripeClient($stripeSecretKey);
        $this->webhookSecret = $stripeWebhookSecret;
    }

    public function createPaymentIntent(Order $order, string $paymentMethod = 'stripe'): array
    {
        switch ($paymentMethod) {
            case 'stripe':
                return $this->createStripePaymentIntent($order);
            case 'paypal':
                return $this->createPayPalPayment($order);
            case 'orange_money':
                return $this->createOrangeMoneyPayment($order);
            case 'mtn_money':
                return $this->createMTNMoneyPayment($order);
            default:
                throw new \InvalidArgumentException("Méthode de paiement non supportée: $paymentMethod");
        }
    }

    private function createStripePaymentIntent(Order $order): array
    {
        $amount = (int)((float)$order->getTotalAmount() * 100); // Convert to cents

        $paymentIntent = $this->stripe->paymentIntents->create([
            'amount' => $amount,
            'currency' => strtolower($order->getCurrency()),
            'metadata' => [
                'order_id' => $order->getId(),
                'order_number' => $order->getOrderNumber(),
                'buyer_id' => $order->getBuyer()->getId(),
                'seller_id' => $order->getSeller()?->getId()
            ],
            'description' => "Commande {$order->getOrderNumber()}",
            'receipt_email' => $order->getBuyer()->getEmail(),
            'shipping' => [
                'name' => $order->getShippingAddress()['firstName'] . ' ' . $order->getShippingAddress()['lastName'],
                'address' => [
                    'line1' => $order->getShippingAddress()['street'],
                    'city' => $order->getShippingAddress()['city'],
                    'postal_code' => $order->getShippingAddress()['zipCode'],
                    'country' => $order->getShippingAddress()['country']
                ]
            ]
        ]);

        $order->setPaymentIntentId($paymentIntent->id);

        return [
            'id' => $paymentIntent->id,
            'client_secret' => $paymentIntent->client_secret,
            'status' => $paymentIntent->status
        ];
    }

    private function createPayPalPayment(Order $order): array
    {
        // PayPal integration implementation
        // This would use PayPal SDK
        throw new \Exception('PayPal integration not implemented yet');
    }

    private function createOrangeMoneyPayment(Order $order): array
    {
        // Orange Money integration implementation
        throw new \Exception('Orange Money integration not implemented yet');
    }

    private function createMTNMoneyPayment(Order $order): array
    {
        // MTN Money integration implementation
        throw new \Exception('MTN Money integration not implemented yet');
    }

    public function confirmPayment(Order $order, ?string $paymentIntentId = null): array
    {
        if ($order->getPaymentMethod() === 'stripe') {
            return $this->confirmStripePayment($order, $paymentIntentId);
        }

        throw new \InvalidArgumentException("Confirmation non supportée pour: {$order->getPaymentMethod()}");
    }

    private function confirmStripePayment(Order $order, ?string $paymentIntentId = null): array
    {
        $intentId = $paymentIntentId ?? $order->getPaymentIntentId();
        
        if (!$intentId) {
            throw new \Exception('Payment Intent ID manquant');
        }

        $paymentIntent = $this->stripe->paymentIntents->retrieve($intentId);

        return [
            'status' => $paymentIntent->status,
            'amount_received' => $paymentIntent->amount_received,
            'charges' => $paymentIntent->charges->data
        ];
    }

    public function handleStripeWebhook(string $payload, string $sigHeader): array
    {
        try {
            $event = Webhook::constructEvent(
                $payload,
                $sigHeader,
                $this->webhookSecret
            );

            return $event->toArray();

        } catch (\UnexpectedValueException $e) {
            throw new \Exception('Invalid payload');
        } catch (\Stripe\Exception\SignatureVerificationException $e) {
            throw new \Exception('Invalid signature');
        }
    }

    public function refundPayment(Order $order, ?float $amount = null): array
    {
        if ($order->getPaymentMethod() === 'stripe') {
            return $this->refundStripePayment($order, $amount);
        }

        throw new \InvalidArgumentException("Remboursement non supporté pour: {$order->getPaymentMethod()}");
    }

    private function refundStripePayment(Order $order, ?float $amount = null): array
    {
        $paymentIntentId = $order->getPaymentIntentId();
        
        if (!$paymentIntentId) {
            throw new \Exception('Payment Intent ID manquant');
        }

        $refundAmount = $amount ? (int)($amount * 100) : null;

        $refund = $this->stripe->refunds->create([
            'payment_intent' => $paymentIntentId,
            'amount' => $refundAmount,
            'metadata' => [
                'order_id' => $order->getId(),
                'order_number' => $order->getOrderNumber()
            ]
        ]);

        return [
            'id' => $refund->id,
            'status' => $refund->status,
            'amount' => $refund->amount / 100
        ];
    }

    public function createSetupIntent(User $user): array
    {
        $setupIntent = $this->stripe->setupIntents->create([
            'customer' => $this->getOrCreateStripeCustomer($user),
            'usage' => 'off_session'
        ]);

        return [
            'id' => $setupIntent->id,
            'client_secret' => $setupIntent->client_secret
        ];
    }

    public function attachPaymentMethod(User $user, string $paymentMethodId, bool $makeDefault = false): PaymentMethod
    {
        // Retrieve the payment method from Stripe
        $stripePaymentMethod = $this->stripe->paymentMethods->retrieve($paymentMethodId);
        
        // Attach to customer
        $customerId = $this->getOrCreateStripeCustomer($user);
        $this->stripe->paymentMethods->attach($paymentMethodId, [
            'customer' => $customerId
        ]);
        
        // Make default if requested
        if ($makeDefault) {
            $this->stripe->customers->update($customerId, [
                'invoice_settings' => [
                    'default_payment_method' => $paymentMethodId
                ]
            ]);
        }
        
        // Create payment method entity
        $paymentMethod = new PaymentMethod();
        $paymentMethod->setUser($user);
        $paymentMethod->setExternalId($paymentMethodId);
        
        // Set payment method details based on type
        if ($stripePaymentMethod->type === 'card') {
            $card = $stripePaymentMethod->card;
            $paymentMethod->setType('card');
            $paymentMethod->setProvider('stripe');
            $paymentMethod->setDisplayName($card->brand . ' •••• ' . $card->last4);
            $paymentMethod->setLast4($card->last4);
            $paymentMethod->setExpiryMonth($card->exp_month);
            $paymentMethod->setExpiryYear($card->exp_year);
            $paymentMethod->setBrand($card->brand);
        } else {
            $paymentMethod->setType($stripePaymentMethod->type);
            $paymentMethod->setProvider('stripe');
            $paymentMethod->setDisplayName(ucfirst($stripePaymentMethod->type));
        }
        
        // Clear default flag on other payment methods if needed
        if ($makeDefault) {
            $userPaymentMethods = $this->entityManager->getRepository(PaymentMethod::class)->findByUser($user);
            foreach ($userPaymentMethods as $method) {
                $method->setIsDefault(false);
            }
            $paymentMethod->setIsDefault(true);
        }
        
        $paymentMethod->setIsActive(true);
        $paymentMethod->setVerifiedAt(new \DateTime());
        
        $this->entityManager->persist($paymentMethod);
        $this->entityManager->flush();
        
        return $paymentMethod;
    }

    public function detachPaymentMethod(string $paymentMethodId): void
    {
        $this->stripe->paymentMethods->detach($paymentMethodId);
    }

    public function validateCardDetails(string $cardNumber, int $expiryMonth, int $expiryYear, string $cvc): array
    {
        // Basic validation
        $errors = [];
        $valid = true;
        $brand = null;
        
        // Card number validation (Luhn algorithm)
        if (!$this->validateLuhn($cardNumber)) {
            $errors[] = 'Invalid card number';
            $valid = false;
        } else {
            $brand = $this->detectCardBrand($cardNumber);
        }
        
        // Expiry date validation
        $now = new \DateTime();
        $currentYear = (int)$now->format('Y');
        $currentMonth = (int)$now->format('m');
        
        if ($expiryYear < $currentYear || ($expiryYear === $currentYear && $expiryMonth < $currentMonth)) {
            $errors[] = 'Card has expired';
            $valid = false;
        }
        
        // CVC validation
        if (!preg_match('/^\d{3,4}$/', $cvc)) {
            $errors[] = 'Invalid CVC';
            $valid = false;
        }
        
        return [
            'valid' => $valid,
            'brand' => $brand,
            'errors' => $errors
        ];
    }

    private function validateLuhn(string $number): bool
    {
        // Remove non-digits
        $number = preg_replace('/\D/', '', $number);
        
        // Check length
        $length = strlen($number);
        if ($length < 13 || $length > 19) {
            return false;
        }
        
        // Luhn algorithm
        $sum = 0;
        $parity = $length % 2;
        
        for ($i = 0; $i < $length; $i++) {
            $digit = (int)$number[$i];
            
            if ($i % 2 === $parity) {
                $digit *= 2;
                if ($digit > 9) {
                    $digit -= 9;
                }
            }
            
            $sum += $digit;
        }
        
        return $sum % 10 === 0;
    }

    private function detectCardBrand(string $number): ?string
    {
        $patterns = [
            'visa' => '/^4\d{12}(\d{3})?$/',
            'mastercard' => '/^(5[1-5]\d{4}|222[1-9]\d{3}|22[3-9]\d{4}|2[3-6]\d{5}|27[01]\d{4}|2720\d{3})\d{10}$/',
            'amex' => '/^3[47]\d{13}$/',
            'discover' => '/^(6011|65\d{2}|64[4-9]\d)\d{12}|(62\d{14})$/',
            'diners' => '/^3(0[0-5]|[68]\d)\d{11}$/',
            'jcb' => '/^35\d{14}$/'
        ];
        
        foreach ($patterns as $brand => $pattern) {
            if (preg_match($pattern, $number)) {
                return $brand;
            }
        }
        
        return null;
    }

    private function getOrCreateStripeCustomer(User $user): string
    {
        // Check if user already has a Stripe customer ID
        $customerId = $user->getMetadata()['stripe_customer_id'] ?? null;
        
        if ($customerId) {
            return $customerId;
        }
        
        // Create new customer
        $customer = $this->stripe->customers->create([
            'email' => $user->getEmail(),
            'name' => $user->getFirstName() . ' ' . $user->getLastName(),
            'phone' => $user->getPhone(),
            'metadata' => [
                'user_id' => $user->getId(),
                'role' => $user->getRole()
            ]
        ]);
        
        // Save customer ID to user metadata
        $metadata = $user->getMetadata() ?? [];
        $metadata['stripe_customer_id'] = $customer->id;
        $user->setMetadata($metadata);
        
        $this->entityManager->flush();
        
        return $customer->id;
    }
}