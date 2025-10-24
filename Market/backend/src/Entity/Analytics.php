<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use App\Repository\AnalyticsRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: AnalyticsRepository::class)]
#[ApiResource(
    operations: [
        new GetCollection(
            normalizationContext: ['groups' => ['analytics:read:collection']],
            security: "is_granted('ROLE_USER')"
        ),
        new Get(
            normalizationContext: ['groups' => ['analytics:read']],
            security: "is_granted('ROLE_ADMIN') or object.getUser() == user"
        ),
        new Post(
            denormalizationContext: ['groups' => ['analytics:write']],
            normalizationContext: ['groups' => ['analytics:read']],
            security: "is_granted('ROLE_USER')"
        )
    ]
)]
class Analytics
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['analytics:read', 'analytics:read:collection'])]
    private ?int $id = null;

    #[ORM\ManyToOne]
    #[Groups(['analytics:read', 'analytics:read:collection'])]
    private ?User $user = null;

    #[ORM\Column(length: 50)]
    #[Assert\Choice(choices: ['page_view', 'product_view', 'add_to_cart', 'purchase', 'funnel_step', 'live_stream_view', 'message_sent'])]
    #[Groups(['analytics:read', 'analytics:read:collection', 'analytics:write'])]
    private ?string $eventType = null;

    #[ORM\Column(length: 255)]
    #[Groups(['analytics:read', 'analytics:read:collection', 'analytics:write'])]
    private ?string $eventName = null;

    #[ORM\Column(type: Types::JSON)]
    #[Groups(['analytics:read', 'analytics:write'])]
    private array $properties = [];

    #[ORM\Column(type: Types::DECIMAL, precision: 10, scale: 2, nullable: true)]
    #[Groups(['analytics:read', 'analytics:write'])]
    private ?string $value = null;

    #[ORM\Column(length: 3, nullable: true)]
    #[Groups(['analytics:read', 'analytics:write'])]
    private ?string $currency = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['analytics:read', 'analytics:write'])]
    private ?string $source = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['analytics:read', 'analytics:write'])]
    private ?string $medium = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['analytics:read', 'analytics:write'])]
    private ?string $campaign = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['analytics:read', 'analytics:write'])]
    private ?string $sessionId = null;

    #[ORM\Column(length: 45, nullable: true)]
    #[Groups(['analytics:read', 'analytics:write'])]
    private ?string $ipAddress = null;

    #[ORM\Column(length: 500, nullable: true)]
    #[Groups(['analytics:read', 'analytics:write'])]
    private ?string $userAgent = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['analytics:read', 'analytics:write'])]
    private ?string $referrer = null;

    #[ORM\Column(length: 10, nullable: true)]
    #[Groups(['analytics:read', 'analytics:write'])]
    private ?string $country = null;

    #[ORM\Column(length: 100, nullable: true)]
    #[Groups(['analytics:read', 'analytics:write'])]
    private ?string $city = null;

    #[ORM\Column(length: 100, nullable: true)]
    #[Groups(['analytics:read', 'analytics:write'])]
    private ?string $device = null;

    #[ORM\Column(length: 100, nullable: true)]
    #[Groups(['analytics:read', 'analytics:write'])]
    private ?string $browser = null;

    #[ORM\Column(length: 100, nullable: true)]
    #[Groups(['analytics:read', 'analytics:write'])]
    private ?string $os = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    #[Groups(['analytics:read', 'analytics:read:collection'])]
    private ?\DateTimeInterface $createdAt = null;

    #[ORM\Column(type: Types::DATE_MUTABLE)]
    #[Groups(['analytics:read', 'analytics:read:collection'])]
    private ?\DateTimeInterface $eventDate = null;

    #[ORM\Column(nullable: true)]
    #[Groups(['analytics:read', 'analytics:read:collection'])]
    private ?int $eventHour = null;

    public function __construct()
    {
        $this->createdAt = new \DateTime();
        $this->eventDate = new \DateTime();
        $this->eventHour = (int)(new \DateTime())->format('H');
        $this->properties = [];
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

    public function getEventType(): ?string
    {
        return $this->eventType;
    }

    public function setEventType(string $eventType): static
    {
        $this->eventType = $eventType;
        return $this;
    }

    public function getEventName(): ?string
    {
        return $this->eventName;
    }

    public function setEventName(string $eventName): static
    {
        $this->eventName = $eventName;
        return $this;
    }

    public function getProperties(): array
    {
        return $this->properties;
    }

    public function setProperties(array $properties): static
    {
        $this->properties = $properties;
        return $this;
    }

    public function getValue(): ?string
    {
        return $this->value;
    }

    public function setValue(?string $value): static
    {
        $this->value = $value;
        return $this;
    }

    public function getCurrency(): ?string
    {
        return $this->currency;
    }

    public function setCurrency(?string $currency): static
    {
        $this->currency = $currency;
        return $this;
    }

    public function getSource(): ?string
    {
        return $this->source;
    }

    public function setSource(?string $source): static
    {
        $this->source = $source;
        return $this;
    }

    public function getMedium(): ?string
    {
        return $this->medium;
    }

    public function setMedium(?string $medium): static
    {
        $this->medium = $medium;
        return $this;
    }

    public function getCampaign(): ?string
    {
        return $this->campaign;
    }

    public function setCampaign(?string $campaign): static
    {
        $this->campaign = $campaign;
        return $this;
    }

    public function getSessionId(): ?string
    {
        return $this->sessionId;
    }

    public function setSessionId(?string $sessionId): static
    {
        $this->sessionId = $sessionId;
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

    public function getReferrer(): ?string
    {
        return $this->referrer;
    }

    public function setReferrer(?string $referrer): static
    {
        $this->referrer = $referrer;
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

    public function getCity(): ?string
    {
        return $this->city;
    }

    public function setCity(?string $city): static
    {
        $this->city = $city;
        return $this;
    }

    public function getDevice(): ?string
    {
        return $this->device;
    }

    public function setDevice(?string $device): static
    {
        $this->device = $device;
        return $this;
    }

    public function getBrowser(): ?string
    {
        return $this->browser;
    }

    public function setBrowser(?string $browser): static
    {
        $this->browser = $browser;
        return $this;
    }

    public function getOs(): ?string
    {
        return $this->os;
    }

    public function setOs(?string $os): static
    {
        $this->os = $os;
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

    public function getEventDate(): ?\DateTimeInterface
    {
        return $this->eventDate;
    }

    public function setEventDate(\DateTimeInterface $eventDate): static
    {
        $this->eventDate = $eventDate;
        return $this;
    }

    public function getEventHour(): ?int
    {
        return $this->eventHour;
    }

    public function setEventHour(?int $eventHour): static
    {
        $this->eventHour = $eventHour;
        return $this;
    }

    public function addProperty(string $key, mixed $value): static
    {
        $this->properties[$key] = $value;
        return $this;
    }

    public function getProperty(string $key): mixed
    {
        return $this->properties[$key] ?? null;
    }
}