<?php

namespace App\Service;

use App\Entity\Order;
use App\Entity\Shipping;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class ShippingService
{
    private array $carriers = [
        'colissimo' => [
            'name' => 'Colissimo',
            'api_url' => 'https://api.colissimo.fr',
            'tracking_url' => 'https://www.colissimo.fr/portail_colissimo/suivreResultat.do?parcelnumber='
        ],
        'chronopost' => [
            'name' => 'Chronopost',
            'api_url' => 'https://api.chronopost.fr',
            'tracking_url' => 'https://www.chronopost.fr/tracking-colis?listeNumerosLT='
        ],
        'ups' => [
            'name' => 'UPS',
            'api_url' => 'https://api.ups.com',
            'tracking_url' => 'https://www.ups.com/track?tracknum='
        ],
        'dhl' => [
            'name' => 'DHL',
            'api_url' => 'https://api.dhl.com',
            'tracking_url' => 'https://www.dhl.com/fr-fr/home/tracking/tracking-express.html?submit=1&tracking-id='
        ]
    ];

    public function __construct(
        private EntityManagerInterface $entityManager,
        private HttpClientInterface $httpClient,
        private NotificationService $notificationService
    ) {}

    public function calculateShippingCost(Order $order, string $carrier = 'colissimo'): float
    {
        $weight = $this->calculateOrderWeight($order);
        $dimensions = $this->calculateOrderDimensions($order);
        $destination = $order->getShippingAddress();
        
        // Mock shipping cost calculation
        $baseCost = match($carrier) {
            'colissimo' => 6.99,
            'chronopost' => 12.99,
            'ups' => 15.99,
            'dhl' => 18.99,
            default => 9.99
        };
        
        // Weight-based pricing
        if ($weight > 2) {
            $baseCost += ($weight - 2) * 2.50;
        }
        
        // International shipping
        if ($destination['country'] !== 'France') {
            $baseCost *= 2.5;
        }
        
        // Express delivery
        if (isset($destination['express']) && $destination['express']) {
            $baseCost *= 1.8;
        }
        
        return round($baseCost, 2);
    }

    public function createShipment(Order $order, string $carrier = 'colissimo', array $options = []): Shipping
    {
        $shipping = new Shipping();
        $shipping->setOrder($order);
        $shipping->setCarrier($carrier);
        $shipping->setCost((string)$this->calculateShippingCost($order, $carrier));
        $shipping->setWeight((string)$this->calculateOrderWeight($order));
        $shipping->setDimensions($this->calculateOrderDimensions($order));
        $shipping->setFromAddress($this->getSellerAddress($order));
        $shipping->setToAddress($order->getShippingAddress());
        $shipping->setServiceType($options['service_type'] ?? 'standard');
        $shipping->setRequiresSignature($options['signature'] ?? false);
        $shipping->setIsInsured($options['insurance'] ?? false);
        
        if ($options['insurance'] ?? false) {
            $shipping->setInsuranceValue($order->getTotalAmount());
        }
        
        // Generate tracking number
        $trackingNumber = $this->generateTrackingNumber($carrier);
        $shipping->setTrackingNumber($trackingNumber);
        $shipping->setTrackingUrl($this->carriers[$carrier]['tracking_url'] . $trackingNumber);
        
        // Set estimated delivery
        $estimatedDelivery = $this->calculateEstimatedDelivery($carrier, $order->getShippingAddress());
        $shipping->setEstimatedDelivery($estimatedDelivery);
        
        $this->entityManager->persist($shipping);
        $this->entityManager->flush();
        
        // Create shipment with carrier API
        $this->createCarrierShipment($shipping);
        
        return $shipping;
    }

    public function updateShippingStatus(Shipping $shipping, string $status, array $eventData = []): void
    {
        $oldStatus = $shipping->getStatus();
        $shipping->setStatus($status);
        
        // Add tracking event
        $event = [
            'status' => $status,
            'description' => $this->getStatusDescription($status),
            'location' => $eventData['location'] ?? null,
            'timestamp' => new \DateTime(),
            'details' => $eventData['details'] ?? null
        ];
        
        $shipping->addTrackingEvent($event);
        
        $this->entityManager->flush();
        
        // Send notifications
        if ($this->shouldNotifyStatusChange($oldStatus, $status)) {
            $this->notificationService->sendShippingUpdate($shipping);
        }
        
        // Update order status if needed
        $this->updateOrderStatus($shipping);
    }

    public function trackShipment(Shipping $shipping): array
    {
        $carrier = $shipping->getCarrier();
        $trackingNumber = $shipping->getTrackingNumber();
        
        if (!$trackingNumber) {
            return ['error' => 'No tracking number available'];
        }
        
        try {
            // Call carrier API for tracking info
            $trackingData = $this->callCarrierTrackingAPI($carrier, $trackingNumber);
            
            // Update shipping status if changed
            if (isset($trackingData['status']) && $trackingData['status'] !== $shipping->getStatus()) {
                $this->updateShippingStatus($shipping, $trackingData['status'], $trackingData);
            }
            
            return $trackingData;
            
        } catch (\Exception $e) {
            return ['error' => 'Unable to track shipment: ' . $e->getMessage()];
        }
    }

    public function getAvailableCarriers(Order $order): array
    {
        $destination = $order->getShippingAddress();
        $weight = $this->calculateOrderWeight($order);
        
        $availableCarriers = [];
        
        foreach ($this->carriers as $code => $carrier) {
            $cost = $this->calculateShippingCost($order, $code);
            $estimatedDelivery = $this->calculateEstimatedDelivery($code, $destination);
            
            $availableCarriers[] = [
                'code' => $code,
                'name' => $carrier['name'],
                'cost' => $cost,
                'estimated_delivery' => $estimatedDelivery,
                'max_weight' => $this->getCarrierMaxWeight($code),
                'international' => $this->supportsInternational($code),
                'tracking' => true,
                'insurance' => true
            ];
        }
        
        // Sort by cost
        usort($availableCarriers, fn($a, $b) => $a['cost'] <=> $b['cost']);
        
        return $availableCarriers;
    }

    public function generateShippingLabel(Shipping $shipping): string
    {
        // Generate shipping label PDF
        // This would integrate with carrier APIs to generate actual labels
        
        $labelData = [
            'tracking_number' => $shipping->getTrackingNumber(),
            'carrier' => $shipping->getCarrier(),
            'from_address' => $shipping->getFromAddress(),
            'to_address' => $shipping->getToAddress(),
            'weight' => $shipping->getWeight(),
            'dimensions' => $shipping->getDimensions(),
            'service_type' => $shipping->getServiceType(),
            'order_number' => $shipping->getOrder()->getOrderNumber()
        ];
        
        // Mock label generation - in production, use carrier APIs
        $labelUrl = "https://labels.linkmarket.com/{$shipping->getTrackingNumber()}.pdf";
        
        return $labelUrl;
    }

    private function calculateOrderWeight(Order $order): float
    {
        $totalWeight = 0;
        
        foreach ($order->getOrderItems() as $item) {
            $product = $item->getProduct();
            $weight = $product->getWeight() ?? 0.5; // Default 500g
            $totalWeight += (float)$weight * $item->getQuantity();
        }
        
        return $totalWeight;
    }

    private function calculateOrderDimensions(Order $order): array
    {
        // Simplified dimension calculation
        $totalVolume = 0;
        
        foreach ($order->getOrderItems() as $item) {
            $product = $item->getProduct();
            $dimensions = $product->getDimensions() ?? ['length' => 20, 'width' => 15, 'height' => 5];
            $volume = $dimensions['length'] * $dimensions['width'] * $dimensions['height'];
            $totalVolume += $volume * $item->getQuantity();
        }
        
        // Calculate optimal box dimensions
        $cubeRoot = pow($totalVolume, 1/3);
        
        return [
            'length' => round($cubeRoot * 1.2, 1),
            'width' => round($cubeRoot, 1),
            'height' => round($cubeRoot * 0.8, 1)
        ];
    }

    private function getSellerAddress(Order $order): array
    {
        $seller = $order->getSeller();
        
        return [
            'name' => $seller->getFirstName() . ' ' . $seller->getLastName(),
            'company' => $seller->getCompany(),
            'street' => $seller->getAddress()['street'] ?? '',
            'city' => $seller->getAddress()['city'] ?? '',
            'zipCode' => $seller->getAddress()['zipCode'] ?? '',
            'country' => $seller->getAddress()['country'] ?? 'France',
            'phone' => $seller->getPhone()
        ];
    }

    private function generateTrackingNumber(string $carrier): string
    {
        $prefix = match($carrier) {
            'colissimo' => 'CP',
            'chronopost' => 'CH',
            'ups' => 'UP',
            'dhl' => 'DH',
            default => 'LM'
        };
        
        return $prefix . date('Y') . strtoupper(uniqid());
    }

    private function calculateEstimatedDelivery(string $carrier, array $destination): \DateTime
    {
        $businessDays = match($carrier) {
            'chronopost' => 1, // Express
            'colissimo' => 2,
            'ups' => 3,
            'dhl' => 2,
            default => 3
        };
        
        // International shipping takes longer
        if ($destination['country'] !== 'France') {
            $businessDays += 3;
        }
        
        $delivery = new \DateTime();
        $delivery->modify("+{$businessDays} weekdays");
        
        return $delivery;
    }

    private function createCarrierShipment(Shipping $shipping): void
    {
        // Mock carrier API call
        // In production, integrate with actual carrier APIs
        
        $shipping->setStatus('picked_up');
        $shipping->addTrackingEvent([
            'status' => 'picked_up',
            'description' => 'Package picked up by carrier',
            'location' => 'Origin facility'
        ]);
    }

    private function callCarrierTrackingAPI(string $carrier, string $trackingNumber): array
    {
        // Mock tracking API response
        // In production, call actual carrier APIs
        
        return [
            'tracking_number' => $trackingNumber,
            'status' => 'in_transit',
            'events' => [
                [
                    'status' => 'picked_up',
                    'description' => 'Package picked up',
                    'location' => 'Origin facility',
                    'timestamp' => (new \DateTime('-2 days'))->format('c')
                ],
                [
                    'status' => 'in_transit',
                    'description' => 'In transit to destination',
                    'location' => 'Sorting facility',
                    'timestamp' => (new \DateTime('-1 day'))->format('c')
                ]
            ]
        ];
    }

    private function getStatusDescription(string $status): string
    {
        return match($status) {
            'pending' => 'Shipment created',
            'picked_up' => 'Package picked up by carrier',
            'in_transit' => 'In transit to destination',
            'out_for_delivery' => 'Out for delivery',
            'delivered' => 'Package delivered',
            'failed' => 'Delivery failed',
            'returned' => 'Package returned to sender',
            default => 'Status updated'
        };
    }

    private function shouldNotifyStatusChange(string $oldStatus, string $newStatus): bool
    {
        $notifiableStatuses = ['picked_up', 'out_for_delivery', 'delivered', 'failed'];
        return in_array($newStatus, $notifiableStatuses);
    }

    private function updateOrderStatus(Shipping $shipping): void
    {
        $order = $shipping->getOrder();
        
        match($shipping->getStatus()) {
            'picked_up' => $order->setStatus('shipped'),
            'delivered' => $order->setStatus('delivered'),
            'failed' => $order->setStatus('shipping_failed'),
            default => null
        };
        
        $this->entityManager->flush();
    }

    private function getCarrierMaxWeight(string $carrier): float
    {
        return match($carrier) {
            'colissimo' => 30.0,
            'chronopost' => 30.0,
            'ups' => 70.0,
            'dhl' => 70.0,
            default => 30.0
        };
    }

    private function supportsInternational(string $carrier): bool
    {
        return match($carrier) {
            'colissimo' => true,
            'chronopost' => true,
            'ups' => true,
            'dhl' => true,
            default => false
        };
    }
}