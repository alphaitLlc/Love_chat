<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use App\Repository\ShippingRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: ShippingRepository::class)]
#[ApiResource(
    operations: [
        new GetCollection(
            normalizationContext: ['groups' => ['shipping:read:collection']],
            security: "is_granted('ROLE_USER')"
        ),
        new Get(
            normalizationContext: ['groups' => ['shipping:read']],
            security: "is_granted('ROLE_ADMIN') or object.getOrder().getBuyer() == user or object.getOrder().getSeller() == user"
        ),
        new Post(
            denormalizationContext: ['groups' => ['shipping:write']],
            normalizationContext: ['groups' => ['shipping:read']],
            security: "is_granted('ROLE_VENDOR') or is_granted('ROLE_SUPPLIER')"
        ),
        new Put(
            denormalizationContext: ['groups' => ['shipping:update']],
            normalizationContext: ['groups' => ['shipping:read']],
            security: "is_granted('ROLE_ADMIN') or object.getOrder().getSeller() == user"
        )
    ]
)]
class Shipping
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['shipping:read', 'shipping:read:collection'])]
    private ?int $id = null;

    #[ORM\OneToOne(inversedBy: 'shipping', cascade: ['persist', 'remove'])]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['shipping:read', 'shipping:read:collection'])]
    private ?Order $order = null;

    #[ORM\Column(length: 100)]
    #[Assert\NotBlank]
    #[Groups(['shipping:read', 'shipping:read:collection', 'shipping:write', 'shipping:update'])]
    private ?string $carrier = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['shipping:read', 'shipping:read:collection', 'shipping:update'])]
    private ?string $trackingNumber = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['shipping:read', 'shipping:update'])]
    private ?string $trackingUrl = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 8, scale: 2)]
    #[Groups(['shipping:read', 'shipping:write'])]
    private ?string $cost = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 5, scale: 2, nullable: true)]
    #[Groups(['shipping:read', 'shipping:write'])]
    private ?string $weight = null;

    #[ORM\Column(type: Types::JSON, nullable: true)]
    #[Groups(['shipping:read', 'shipping:write'])]
    private ?array $dimensions = null;

    #[ORM\Column(length: 50)]
    #[Assert\Choice(choices: ['pending', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'failed', 'returned'])]
    #[Groups(['shipping:read', 'shipping:read:collection', 'shipping:update'])]
    private ?string $status = 'pending';

    #[ORM\Column(type: Types::DATETIME_MUTABLE, nullable: true)]
    #[Groups(['shipping:read', 'shipping:update'])]
    private ?\DateTimeInterface $shippedAt = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE, nullable: true)]
    #[Groups(['shipping:read', 'shipping:write'])]
    private ?\DateTimeInterface $estimatedDelivery = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE, nullable: true)]
    #[Groups(['shipping:read', 'shipping:update'])]
    private ?\DateTimeInterface $deliveredAt = null;

    #[ORM\Column(type: Types::JSON)]
    #[Groups(['shipping:read', 'shipping:write'])]
    private array $fromAddress = [];

    #[ORM\Column(type: Types::JSON)]
    #[Groups(['shipping:read', 'shipping:write'])]
    private array $toAddress = [];

    #[ORM\Column(type: Types::JSON, nullable: true)]
    #[Groups(['shipping:read', 'shipping:update'])]
    private ?array $trackingEvents = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(['shipping:read', 'shipping:update'])]
    private ?string $notes = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    #[Groups(['shipping:read'])]
    private ?\DateTimeInterface $createdAt = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    #[Groups(['shipping:read'])]
    private ?\DateTimeInterface $updatedAt = null;

    #[ORM\Column(length: 50, nullable: true)]
    #[Groups(['shipping:read', 'shipping:write'])]
    private ?string $serviceType = null;

    #[ORM\Column]
    #[Groups(['shipping:read', 'shipping:write'])]
    private ?bool $requiresSignature = false;

    #[ORM\Column]
    #[Groups(['shipping:read', 'shipping:write'])]
    private ?bool $isInsured = false;

    #[ORM\Column(type: Types::DECIMAL, precision: 10, scale: 2, nullable: true)]
    #[Groups(['shipping:read', 'shipping:write'])]
    private ?string $insuranceValue = null;

    public function __construct()
    {
        $this->createdAt = new \DateTime();
        $this->updatedAt = new \DateTime();
        $this->trackingEvents = [];
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getOrder(): ?Order
    {
        return $this->order;
    }

    public function setOrder(Order $order): static
    {
        $this->order = $order;
        return $this;
    }

    public function getCarrier(): ?string
    {
        return $this->carrier;
    }

    public function setCarrier(string $carrier): static
    {
        $this->carrier = $carrier;
        return $this;
    }

    public function getTrackingNumber(): ?string
    {
        return $this->trackingNumber;
    }

    public function setTrackingNumber(?string $trackingNumber): static
    {
        $this->trackingNumber = $trackingNumber;
        return $this;
    }

    public function getTrackingUrl(): ?string
    {
        return $this->trackingUrl;
    }

    public function setTrackingUrl(?string $trackingUrl): static
    {
        $this->trackingUrl = $trackingUrl;
        return $this;
    }

    public function getCost(): ?string
    {
        return $this->cost;
    }

    public function setCost(string $cost): static
    {
        $this->cost = $cost;
        return $this;
    }

    public function getWeight(): ?string
    {
        return $this->weight;
    }

    public function setWeight(?string $weight): static
    {
        $this->weight = $weight;
        return $this;
    }

    public function getDimensions(): ?array
    {
        return $this->dimensions;
    }

    public function setDimensions(?array $dimensions): static
    {
        $this->dimensions = $dimensions;
        return $this;
    }

    public function getStatus(): ?string
    {
        return $this->status;
    }

    public function setStatus(string $status): static
    {
        $this->status = $status;
        $this->updatedAt = new \DateTime();
        
        if ($status === 'picked_up' && !$this->shippedAt) {
            $this->shippedAt = new \DateTime();
        } elseif ($status === 'delivered' && !$this->deliveredAt) {
            $this->deliveredAt = new \DateTime();
        }
        
        return $this;
    }

    public function getShippedAt(): ?\DateTimeInterface
    {
        return $this->shippedAt;
    }

    public function setShippedAt(?\DateTimeInterface $shippedAt): static
    {
        $this->shippedAt = $shippedAt;
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

    public function getDeliveredAt(): ?\DateTimeInterface
    {
        return $this->deliveredAt;
    }

    public function setDeliveredAt(?\DateTimeInterface $deliveredAt): static
    {
        $this->deliveredAt = $deliveredAt;
        return $this;
    }

    public function getFromAddress(): array
    {
        return $this->fromAddress;
    }

    public function setFromAddress(array $fromAddress): static
    {
        $this->fromAddress = $fromAddress;
        return $this;
    }

    public function getToAddress(): array
    {
        return $this->toAddress;
    }

    public function setToAddress(array $toAddress): static
    {
        $this->toAddress = $toAddress;
        return $this;
    }

    public function getTrackingEvents(): ?array
    {
        return $this->trackingEvents;
    }

    public function setTrackingEvents(?array $trackingEvents): static
    {
        $this->trackingEvents = $trackingEvents;
        return $this;
    }

    public function addTrackingEvent(array $event): static
    {
        $this->trackingEvents[] = array_merge($event, [
            'timestamp' => new \DateTime(),
            'id' => uniqid()
        ]);
        $this->updatedAt = new \DateTime();
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

    public function getServiceType(): ?string
    {
        return $this->serviceType;
    }

    public function setServiceType(?string $serviceType): static
    {
        $this->serviceType = $serviceType;
        return $this;
    }

    public function isRequiresSignature(): ?bool
    {
        return $this->requiresSignature;
    }

    public function setRequiresSignature(bool $requiresSignature): static
    {
        $this->requiresSignature = $requiresSignature;
        return $this;
    }

    public function isInsured(): ?bool
    {
        return $this->isInsured;
    }

    public function setIsInsured(bool $isInsured): static
    {
        $this->isInsured = $isInsured;
        return $this;
    }

    public function getInsuranceValue(): ?string
    {
        return $this->insuranceValue;
    }

    public function setInsuranceValue(?string $insuranceValue): static
    {
        $this->insuranceValue = $insuranceValue;
        return $this;
    }

    #[Groups(['shipping:read'])]
    public function getDeliveryDays(): ?int
    {
        if ($this->shippedAt && $this->deliveredAt) {
            return $this->deliveredAt->diff($this->shippedAt)->days;
        }
        return null;
    }

    #[Groups(['shipping:read'])]
    public function isDelayed(): bool
    {
        if ($this->estimatedDelivery && $this->status !== 'delivered') {
            return new \DateTime() > $this->estimatedDelivery;
        }
        return false;
    }
}