<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use App\Repository\OrderRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: OrderRepository::class)]
#[ORM\Table(name: '`order`')]
#[ApiResource(
    operations: [
        new GetCollection(
            normalizationContext: ['groups' => ['order:read:collection']],
            security: "is_granted('ROLE_USER')"
        ),
        new Get(
            normalizationContext: ['groups' => ['order:read']],
            security: "is_granted('ROLE_ADMIN') or object.getBuyer() == user or object.getSeller() == user"
        ),
        new Post(
            denormalizationContext: ['groups' => ['order:write']],
            normalizationContext: ['groups' => ['order:read']],
            security: "is_granted('ROLE_USER')"
        ),
        new Put(
            denormalizationContext: ['groups' => ['order:update']],
            normalizationContext: ['groups' => ['order:read']],
            security: "is_granted('ROLE_ADMIN') or object.getSeller() == user"
        )
    ]
)]
class Order
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['order:read', 'order:read:collection'])]
    private ?int $id = null;

    #[ORM\Column(length: 255, unique: true)]
    #[Groups(['order:read', 'order:read:collection'])]
    private ?string $orderNumber = null;

    #[ORM\ManyToOne(inversedBy: 'orders')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['order:read', 'order:read:collection'])]
    private ?User $buyer = null;

    #[ORM\ManyToOne(inversedBy: 'sales')]
    #[Groups(['order:read', 'order:read:collection'])]
    private ?User $seller = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 10, scale: 2)]
    #[Groups(['order:read', 'order:read:collection'])]
    private ?string $subtotal = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 10, scale: 2)]
    #[Groups(['order:read', 'order:read:collection'])]
    private ?string $shippingCost = '0.00';

    #[ORM\Column(type: Types::DECIMAL, precision: 10, scale: 2)]
    #[Groups(['order:read', 'order:read:collection'])]
    private ?string $taxAmount = '0.00';

    #[ORM\Column(type: Types::DECIMAL, precision: 10, scale: 2)]
    #[Groups(['order:read', 'order:read:collection'])]
    private ?string $discountAmount = '0.00';

    #[ORM\Column(type: Types::DECIMAL, precision: 10, scale: 2)]
    #[Groups(['order:read', 'order:read:collection'])]
    private ?string $totalAmount = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 10, scale: 2)]
    #[Groups(['order:read'])]
    private ?string $commission = '0.00';

    #[ORM\Column(length: 20)]
    #[Assert\Choice(choices: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'])]
    #[Groups(['order:read', 'order:read:collection', 'order:update'])]
    private ?string $status = 'pending';

    #[ORM\Column(length: 20)]
    #[Assert\Choice(choices: ['pending', 'paid', 'failed', 'refunded'])]
    #[Groups(['order:read', 'order:read:collection'])]
    private ?string $paymentStatus = 'pending';

    #[ORM\Column(length: 50)]
    #[Groups(['order:read', 'order:write'])]
    private ?string $paymentMethod = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['order:read'])]
    private ?string $paymentIntentId = null;

    #[ORM\Column(type: Types::JSON)]
    #[Assert\NotBlank]
    #[Groups(['order:read', 'order:write'])]
    private array $shippingAddress = [];

    #[ORM\Column(type: Types::JSON, nullable: true)]
    #[Groups(['order:read', 'order:write'])]
    private ?array $billingAddress = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['order:read', 'order:update'])]
    private ?string $trackingNumber = null;

    #[ORM\Column(length: 100, nullable: true)]
    #[Groups(['order:read', 'order:update'])]
    private ?string $carrier = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE, nullable: true)]
    #[Groups(['order:read', 'order:update'])]
    private ?\DateTimeInterface $estimatedDelivery = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(['order:read', 'order:write', 'order:update'])]
    private ?string $notes = null;

    #[ORM\Column(type: Types::JSON)]
    #[Groups(['order:read'])]
    private array $timeline = [];

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    #[Groups(['order:read', 'order:read:collection'])]
    private ?\DateTimeInterface $createdAt = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    #[Groups(['order:read'])]
    private ?\DateTimeInterface $updatedAt = null;

    #[ORM\OneToMany(mappedBy: 'order', targetEntity: OrderItem::class, orphanRemoval: true, cascade: ['persist'])]
    #[Groups(['order:read'])]
    private Collection $orderItems;

    #[ORM\Column(length: 3)]
    #[Groups(['order:read', 'order:write'])]
    private ?string $currency = 'EUR';

    #[ORM\Column(type: Types::JSON, nullable: true)]
    #[Groups(['order:read'])]
    private ?array $metadata = null;

    public function __construct()
    {
        $this->orderItems = new ArrayCollection();
        $this->createdAt = new \DateTime();
        $this->updatedAt = new \DateTime();
        $this->timeline = [];
        $this->generateOrderNumber();
        $this->addTimelineEvent('pending', 'Commande créée');
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getOrderNumber(): ?string
    {
        return $this->orderNumber;
    }

    public function setOrderNumber(string $orderNumber): static
    {
        $this->orderNumber = $orderNumber;
        return $this;
    }

    public function getBuyer(): ?User
    {
        return $this->buyer;
    }

    public function setBuyer(?User $buyer): static
    {
        $this->buyer = $buyer;
        return $this;
    }

    public function getSeller(): ?User
    {
        return $this->seller;
    }

    public function setSeller(?User $seller): static
    {
        $this->seller = $seller;
        return $this;
    }

    public function getSubtotal(): ?string
    {
        return $this->subtotal;
    }

    public function setSubtotal(string $subtotal): static
    {
        $this->subtotal = $subtotal;
        $this->calculateTotal();
        return $this;
    }

    public function getShippingCost(): ?string
    {
        return $this->shippingCost;
    }

    public function setShippingCost(string $shippingCost): static
    {
        $this->shippingCost = $shippingCost;
        $this->calculateTotal();
        return $this;
    }

    public function getTaxAmount(): ?string
    {
        return $this->taxAmount;
    }

    public function setTaxAmount(string $taxAmount): static
    {
        $this->taxAmount = $taxAmount;
        $this->calculateTotal();
        return $this;
    }

    public function getDiscountAmount(): ?string
    {
        return $this->discountAmount;
    }

    public function setDiscountAmount(string $discountAmount): static
    {
        $this->discountAmount = $discountAmount;
        $this->calculateTotal();
        return $this;
    }

    public function getTotalAmount(): ?string
    {
        return $this->totalAmount;
    }

    public function setTotalAmount(string $totalAmount): static
    {
        $this->totalAmount = $totalAmount;
        return $this;
    }

    public function getCommission(): ?string
    {
        return $this->commission;
    }

    public function setCommission(string $commission): static
    {
        $this->commission = $commission;
        return $this;
    }

    public function getStatus(): ?string
    {
        return $this->status;
    }

    public function setStatus(string $status): static
    {
        $oldStatus = $this->status;
        $this->status = $status;
        
        if ($oldStatus !== $status) {
            $this->addTimelineEvent($status, $this->getStatusDescription($status));
            $this->updatedAt = new \DateTime();
        }
        
        return $this;
    }

    public function getPaymentStatus(): ?string
    {
        return $this->paymentStatus;
    }

    public function setPaymentStatus(string $paymentStatus): static
    {
        $this->paymentStatus = $paymentStatus;
        return $this;
    }

    public function getPaymentMethod(): ?string
    {
        return $this->paymentMethod;
    }

    public function setPaymentMethod(string $paymentMethod): static
    {
        $this->paymentMethod = $paymentMethod;
        return $this;
    }

    public function getPaymentIntentId(): ?string
    {
        return $this->paymentIntentId;
    }

    public function setPaymentIntentId(?string $paymentIntentId): static
    {
        $this->paymentIntentId = $paymentIntentId;
        return $this;
    }

    public function getShippingAddress(): array
    {
        return $this->shippingAddress;
    }

    public function setShippingAddress(array $shippingAddress): static
    {
        $this->shippingAddress = $shippingAddress;
        return $this;
    }

    public function getBillingAddress(): ?array
    {
        return $this->billingAddress;
    }

    public function setBillingAddress(?array $billingAddress): static
    {
        $this->billingAddress = $billingAddress;
        return $this;
    }

    public function getTrackingNumber(): ?string
    {
        return $this->trackingNumber;
    }

    public function setTrackingNumber(?string $trackingNumber): static
    {
        $this->trackingNumber = $trackingNumber;
        if ($trackingNumber && $this->status === 'processing') {
            $this->setStatus('shipped');
        }
        return $this;
    }

    public function getCarrier(): ?string
    {
        return $this->carrier;
    }

    public function setCarrier(?string $carrier): static
    {
        $this->carrier = $carrier;
        return $this;
    }

    public function getEstimatedDelivery(): ?\DateTimeInterface
    {
        return $this->estimatedDelivery;
    }

    public function setEstimatedDelivery(?\DateTimeInterface $estimatedDelivery): static
    {
        $this->estimatedDelivery = $estimatedDelivery;
        return $this;
    }

    public function getNotes(): ?string
    {
        return $this->notes;
    }

    public function setNotes(?string $notes): static
    {
        $this->notes = $notes;
        return $this;
    }

    public function getTimeline(): array
    {
        return $this->timeline;
    }

    public function setTimeline(array $timeline): static
    {
        $this->timeline = $timeline;
        return $this;
    }

    public function getCreatedAt(): ?\DateTimeInterface
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTimeInterface $createdAt): static
    {
        $this->createdAt = $createdAt;
        return $this;
    }

    public function getUpdatedAt(): ?\DateTimeInterface
    {
        return $this->updatedAt;
    }

    public function setUpdatedAt(\DateTimeInterface $updatedAt): static
    {
        $this->updatedAt = $updatedAt;
        return $this;
    }

    /**
     * @return Collection<int, OrderItem>
     */
    public function getOrderItems(): Collection
    {
        return $this->orderItems;
    }

    public function addOrderItem(OrderItem $orderItem): static
    {
        if (!$this->orderItems->contains($orderItem)) {
            $this->orderItems->add($orderItem);
            $orderItem->setOrder($this);
        }

        return $this;
    }

    public function removeOrderItem(OrderItem $orderItem): static
    {
        if ($this->orderItems->removeElement($orderItem)) {
            if ($orderItem->getOrder() === $this) {
                $orderItem->setOrder(null);
            }
        }

        return $this;
    }

    public function getCurrency(): ?string
    {
        return $this->currency;
    }

    public function setCurrency(string $currency): static
    {
        $this->currency = $currency;
        return $this;
    }

    public function getMetadata(): ?array
    {
        return $this->metadata;
    }

    public function setMetadata(?array $metadata): static
    {
        $this->metadata = $metadata;
        return $this;
    }

    private function generateOrderNumber(): void
    {
        $this->orderNumber = 'ORD-' . date('Y') . '-' . strtoupper(uniqid());
    }

    private function calculateTotal(): void
    {
        $subtotal = (float) ($this->subtotal ?? 0);
        $shipping = (float) ($this->shippingCost ?? 0);
        $tax = (float) ($this->taxAmount ?? 0);
        $discount = (float) ($this->discountAmount ?? 0);
        
        $total = $subtotal + $shipping + $tax - $discount;
        $this->totalAmount = number_format($total, 2, '.', '');
        
        // Calculate commission (5% of subtotal)
        $this->commission = number_format($subtotal * 0.05, 2, '.', '');
    }

    private function addTimelineEvent(string $status, string $description, ?string $location = null): void
    {
        $this->timeline[] = [
            'status' => $status,
            'timestamp' => (new \DateTime())->format('c'),
            'description' => $description,
            'location' => $location
        ];
    }

    private function getStatusDescription(string $status): string
    {
        $descriptions = [
            'pending' => 'Commande en attente',
            'confirmed' => 'Commande confirmée',
            'processing' => 'Préparation en cours',
            'shipped' => 'Expédiée',
            'delivered' => 'Livrée',
            'cancelled' => 'Annulée',
            'refunded' => 'Remboursée'
        ];
        
        return $descriptions[$status] ?? $status;
    }

    #[Groups(['order:read', 'order:read:collection'])]
    public function getItemCount(): int
    {
        return $this->orderItems->count();
    }

    #[Groups(['order:read', 'order:read:collection'])]
    public function getTotalQuantity(): int
    {
        $total = 0;
        foreach ($this->orderItems as $item) {
            $total += $item->getQuantity();
        }
        return $total;
    }
}