<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use ApiPlatform\Metadata\Delete;
use App\Repository\PaymentMethodRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: PaymentMethodRepository::class)]
#[ApiResource(
    operations: [
        new GetCollection(
            normalizationContext: ['groups' => ['payment_method:read:collection']],
            security: "is_granted('ROLE_USER')"
        ),
        new Get(
            normalizationContext: ['groups' => ['payment_method:read']],
            security: "is_granted('ROLE_ADMIN') or object.getUser() == user"
        ),
        new Post(
            denormalizationContext: ['groups' => ['payment_method:write']],
            normalizationContext: ['groups' => ['payment_method:read']],
            security: "is_granted('ROLE_USER')"
        ),
        new Put(
            denormalizationContext: ['groups' => ['payment_method:update']],
            normalizationContext: ['groups' => ['payment_method:read']],
            security: "is_granted('ROLE_ADMIN') or object.getUser() == user"
        ),
        new Delete(
            security: "is_granted('ROLE_ADMIN') or object.getUser() == user"
        )
    ]
)]
class PaymentMethod
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['payment_method:read', 'payment_method:read:collection'])]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'paymentMethods')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['payment_method:read', 'payment_method:read:collection'])]
    private ?User $user = null;

    #[ORM\Column(length: 50)]
    #[Assert\Choice(choices: ['card', 'paypal', 'mobile_money', 'bank_transfer', 'crypto'])]
    #[Groups(['payment_method:read', 'payment_method:read:collection', 'payment_method:write'])]
    private ?string $type = null;

    #[ORM\Column(length: 100)]
    #[Assert\NotBlank]
    #[Groups(['payment_method:read', 'payment_method:read:collection', 'payment_method:write'])]
    private ?string $provider = null;

    #[ORM\Column(length: 255)]
    #[Groups(['payment_method:read', 'payment_method:read:collection', 'payment_method:write'])]
    private ?string $displayName = null;

    #[ORM\Column(length: 4, nullable: true)]
    #[Groups(['payment_method:read', 'payment_method:read:collection'])]
    private ?string $last4 = null;

    #[ORM\Column(nullable: true)]
    #[Groups(['payment_method:read', 'payment_method:read:collection'])]
    private ?int $expiryMonth = null;

    #[ORM\Column(nullable: true)]
    #[Groups(['payment_method:read', 'payment_method:read:collection'])]
    private ?int $expiryYear = null;

    #[ORM\Column(length: 50, nullable: true)]
    #[Groups(['payment_method:read', 'payment_method:read:collection'])]
    private ?string $brand = null;

    #[ORM\Column]
    #[Groups(['payment_method:read', 'payment_method:read:collection', 'payment_method:update'])]
    private ?bool $isDefault = false;

    #[ORM\Column]
    #[Groups(['payment_method:read', 'payment_method:read:collection'])]
    private ?bool $isActive = true;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $externalId = null;

    #[ORM\Column(type: Types::JSON, nullable: true)]
    #[Groups(['payment_method:read', 'payment_method:write'])]
    private ?array $metadata = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    #[Groups(['payment_method:read'])]
    private ?\DateTimeInterface $createdAt = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    #[Groups(['payment_method:read'])]
    private ?\DateTimeInterface $updatedAt = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE, nullable: true)]
    #[Groups(['payment_method:read'])]
    private ?\DateTimeInterface $verifiedAt = null;

    public function __construct()
    {
        $this->createdAt = new \DateTime();
        $this->updatedAt = new \DateTime();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(?User $user): static
    {
        $this->user = $user;
        return $this;
    }

    public function getType(): ?string
    {
        return $this->type;
    }

    public function setType(string $type): static
    {
        $this->type = $type;
        return $this;
    }

    public function getProvider(): ?string
    {
        return $this->provider;
    }

    public function setProvider(string $provider): static
    {
        $this->provider = $provider;
        return $this;
    }

    public function getDisplayName(): ?string
    {
        return $this->displayName;
    }

    public function setDisplayName(string $displayName): static
    {
        $this->displayName = $displayName;
        return $this;
    }

    public function getLast4(): ?string
    {
        return $this->last4;
    }

    public function setLast4(?string $last4): static
    {
        $this->last4 = $last4;
        return $this;
    }

    public function getExpiryMonth(): ?int
    {
        return $this->expiryMonth;
    }

    public function setExpiryMonth(?int $expiryMonth): static
    {
        $this->expiryMonth = $expiryMonth;
        return $this;
    }

    public function getExpiryYear(): ?int
    {
        return $this->expiryYear;
    }

    public function setExpiryYear(?int $expiryYear): static
    {
        $this->expiryYear = $expiryYear;
        return $this;
    }

    public function getBrand(): ?string
    {
        return $this->brand;
    }

    public function setBrand(?string $brand): static
    {
        $this->brand = $brand;
        return $this;
    }

    public function isDefault(): ?bool
    {
        return $this->isDefault;
    }

    public function setIsDefault(bool $isDefault): static
    {
        $this->isDefault = $isDefault;
        return $this;
    }

    public function isActive(): ?bool
    {
        return $this->isActive;
    }

    public function setIsActive(bool $isActive): static
    {
        $this->isActive = $isActive;
        return $this;
    }

    public function getExternalId(): ?string
    {
        return $this->externalId;
    }

    public function setExternalId(?string $externalId): static
    {
        $this->externalId = $externalId;
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

    public function getVerifiedAt(): ?\DateTimeInterface
    {
        return $this->verifiedAt;
    }

    public function setVerifiedAt(?\DateTimeInterface $verifiedAt): static
    {
        $this->verifiedAt = $verifiedAt;
        return $this;
    }

    #[Groups(['payment_method:read', 'payment_method:read:collection'])]
    public function isExpired(): bool
    {
        if (!$this->expiryMonth || !$this->expiryYear) {
            return false;
        }
        
        $now = new \DateTime();
        $expiry = new \DateTime(sprintf('%d-%02d-01', $this->expiryYear, $this->expiryMonth));
        $expiry->modify('last day of this month');
        
        return $now > $expiry;
    }

    #[Groups(['payment_method:read', 'payment_method:read:collection'])]
    public function getMaskedNumber(): ?string
    {
        if ($this->type === 'card' && $this->last4) {
            return '**** **** **** ' . $this->last4;
        }
        return null;
    }

    #[Groups(['payment_method:read', 'payment_method:read:collection'])]
    public function getIcon(): string
    {
        return match($this->type) {
            'card' => match(strtolower($this->brand ?? '')) {
                'visa' => '💳',
                'mastercard' => '💳',
                'amex' => '💳',
                default => '💳'
            },
            'paypal' => '🅿️',
            'mobile_money' => '📱',
            'bank_transfer' => '🏦',
            'crypto' => '₿',
            default => '💰'
        };
    }
}