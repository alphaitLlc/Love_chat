<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use App\Repository\SocialShareRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: SocialShareRepository::class)]
#[ApiResource(
    operations: [
        new GetCollection(
            normalizationContext: ['groups' => ['social_share:read:collection']],
            security: "is_granted('ROLE_ADMIN')"
        ),
        new Get(
            normalizationContext: ['groups' => ['social_share:read']],
            security: "is_granted('ROLE_ADMIN') or object.getUser() == user"
        )
    ]
)]
class SocialShare
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['social_share:read', 'social_share:read:collection'])]
    private ?int $id = null;

    #[ORM\ManyToOne]
    #[Groups(['social_share:read', 'social_share:read:collection'])]
    private ?User $user = null;

    #[ORM\Column(length: 50)]
    #[Assert\Choice(choices: ['facebook', 'twitter', 'instagram', 'tiktok', 'whatsapp', 'telegram', 'email', 'sms', 'linkedin', 'pinterest', 'copy'])]
    #[Groups(['social_share:read', 'social_share:read:collection'])]
    private ?string $platform = null;

    #[ORM\Column(length: 50)]
    #[Assert\Choice(choices: ['product', 'livestream', 'user', 'order', 'post'])]
    #[Groups(['social_share:read', 'social_share:read:collection'])]
    private ?string $entityType = null;

    #[ORM\Column(length: 255)]
    #[Groups(['social_share:read', 'social_share:read:collection'])]
    private ?string $entityId = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['social_share:read'])]
    private ?string $url = null;

    #[ORM\Column(type: Types::JSON, nullable: true)]
    #[Groups(['social_share:read'])]
    private ?array $utmParams = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    #[Groups(['social_share:read', 'social_share:read:collection'])]
    private ?\DateTimeInterface $createdAt = null;

    #[ORM\Column(length: 45, nullable: true)]
    #[Groups(['social_share:read'])]
    private ?string $ipAddress = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['social_share:read'])]
    private ?string $userAgent = null;

    #[ORM\Column(length: 10, nullable: true)]
    #[Groups(['social_share:read'])]
    private ?string $country = null;

    #[ORM\Column(nullable: true)]
    #[Groups(['social_share:read', 'social_share:read:collection'])]
    private ?int $clickCount = 0;

    #[ORM\Column(type: Types::DATETIME_MUTABLE, nullable: true)]
    #[Groups(['social_share:read'])]
    private ?\DateTimeInterface $lastClickAt = null;

    public function __construct()
    {
        $this->createdAt = new \DateTime();
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

    public function getPlatform(): ?string
    {
        return $this->platform;
    }

    public function setPlatform(string $platform): static
    {
        $this->platform = $platform;
        return $this;
    }

    public function getEntityType(): ?string
    {
        return $this->entityType;
    }

    public function setEntityType(string $entityType): static
    {
        $this->entityType = $entityType;
        return $this;
    }

    public function getEntityId(): ?string
    {
        return $this->entityId;
    }

    public function setEntityId(string $entityId): static
    {
        $this->entityId = $entityId;
        return $this;
    }

    public function getUrl(): ?string
    {
        return $this->url;
    }

    public function setUrl(?string $url): static
    {
        $this->url = $url;
        return $this;
    }

    public function getUtmParams(): ?array
    {
        return $this->utmParams;
    }

    public function setUtmParams(?array $utmParams): static
    {
        $this->utmParams = $utmParams;
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

    public function getIpAddress(): ?string
    {
        return $this->ipAddress;
    }

    public function setIpAddress(?string $ipAddress): static
    {
        $this->ipAddress = $ipAddress;
        return $this;
    }

    public function getUserAgent(): ?string
    {
        return $this->userAgent;
    }

    public function setUserAgent(?string $userAgent): static
    {
        $this->userAgent = $userAgent;
        return $this;
    }

    public function getCountry(): ?string
    {
        return $this->country;
    }

    public function setCountry(?string $country): static
    {
        $this->country = $country;
        return $this;
    }

    public function getClickCount(): ?int
    {
        return $this->clickCount;
    }

    public function setClickCount(?int $clickCount): static
    {
        $this->clickCount = $clickCount;
        return $this;
    }

    public function getLastClickAt(): ?\DateTimeInterface
    {
        return $this->lastClickAt;
    }

    public function setLastClickAt(?\DateTimeInterface $lastClickAt): static
    {
        $this->lastClickAt = $lastClickAt;
        return $this;
    }

    public function incrementClickCount(): void
    {
        $this->clickCount = ($this->clickCount ?? 0) + 1;
        $this->lastClickAt = new \DateTime();
    }

    #[Groups(['social_share:read', 'social_share:read:collection'])]
    public function getPlatformName(): string
    {
        return match($this->platform) {
            'facebook' => 'Facebook',
            'twitter' => 'Twitter',
            'instagram' => 'Instagram',
            'tiktok' => 'TikTok',
            'whatsapp' => 'WhatsApp',
            'telegram' => 'Telegram',
            'email' => 'Email',
            'sms' => 'SMS',
            'linkedin' => 'LinkedIn',
            'pinterest' => 'Pinterest',
            'copy' => 'Direct Link',
            default => $this->platform
        };
    }

    #[Groups(['social_share:read', 'social_share:read:collection'])]
    public function getEntityTypeName(): string
    {
        return match($this->entityType) {
            'product' => 'Produit',
            'livestream' => 'Live Stream',
            'user' => 'Utilisateur',
            'order' => 'Commande',
            'post' => 'Publication',
            default => $this->entityType
        };
    }
}