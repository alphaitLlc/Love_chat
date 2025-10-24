<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\FunnelStepRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: FunnelStepRepository::class)]
#[ApiResource]
class FunnelStep
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['funnel:read'])]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'steps')]
    #[ORM\JoinColumn(nullable: false)]
    private ?SalesFunnel $funnel = null;

    #[ORM\Column(length: 50)]
    #[Assert\Choice(choices: ['landing', 'product', 'upsell', 'downsell', 'checkout', 'thankyou', 'optin', 'webinar'])]
    #[Groups(['funnel:read'])]
    private ?string $type = null;

    #[ORM\Column(length: 255)]
    #[Assert\NotBlank]
    #[Groups(['funnel:read'])]
    private ?string $name = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(['funnel:read'])]
    private ?string $description = null;

    #[ORM\Column]
    #[Groups(['funnel:read'])]
    private ?int $sortOrder = 0;

    #[ORM\Column(type: Types::JSON)]
    #[Groups(['funnel:read'])]
    private array $content = [];

    #[ORM\Column(type: Types::JSON, nullable: true)]
    #[Groups(['funnel:read'])]
    private ?array $settings = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['funnel:read'])]
    private ?string $nextStepId = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['funnel:read'])]
    private ?string $alternativeStepId = null;

    #[ORM\Column(nullable: true)]
    #[Groups(['funnel:read'])]
    private ?int $visitors = 0;

    #[ORM\Column(nullable: true)]
    #[Groups(['funnel:read'])]
    private ?int $conversions = 0;

    #[ORM\Column(type: Types::DECIMAL, precision: 5, scale: 2, nullable: true)]
    #[Groups(['funnel:read'])]
    private ?string $conversionRate = '0.00';

    #[ORM\Column(type: Types::DECIMAL, precision: 10, scale: 2, nullable: true)]
    #[Groups(['funnel:read'])]
    private ?string $revenue = '0.00';

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    #[Groups(['funnel:read'])]
    private ?\DateTimeInterface $createdAt = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    #[Groups(['funnel:read'])]
    private ?\DateTimeInterface $updatedAt = null;

    #[ORM\Column(length: 255, unique: true)]
    #[Groups(['funnel:read'])]
    private ?string $slug = null;

    #[ORM\Column]
    #[Groups(['funnel:read'])]
    private ?bool $isActive = true;

    public function __construct()
    {
        $this->createdAt = new \DateTime();
        $this->updatedAt = new \DateTime();
        $this->content = [];
        $this->generateSlug();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getFunnel(): ?SalesFunnel
    {
        return $this->funnel;
    }

    public function setFunnel(?SalesFunnel $funnel): static
    {
        $this->funnel = $funnel;
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

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): static
    {
        $this->name = $name;
        $this->generateSlug();
        return $this;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): static
    {
        $this->description = $description;
        return $this;
    }

    public function getSortOrder(): ?int
    {
        return $this->sortOrder;
    }

    public function setSortOrder(int $sortOrder): static
    {
        $this->sortOrder = $sortOrder;
        return $this;
    }

    public function getContent(): array
    {
        return $this->content;
    }

    public function setContent(array $content): static
    {
        $this->content = $content;
        return $this;
    }

    public function getSettings(): ?array
    {
        return $this->settings;
    }

    public function setSettings(?array $settings): static
    {
        $this->settings = $settings;
        return $this;
    }

    public function getNextStepId(): ?string
    {
        return $this->nextStepId;
    }

    public function setNextStepId(?string $nextStepId): static
    {
        $this->nextStepId = $nextStepId;
        return $this;
    }

    public function getAlternativeStepId(): ?string
    {
        return $this->alternativeStepId;
    }

    public function setAlternativeStepId(?string $alternativeStepId): static
    {
        $this->alternativeStepId = $alternativeStepId;
        return $this;
    }

    public function getVisitors(): ?int
    {
        return $this->visitors;
    }

    public function setVisitors(?int $visitors): static
    {
        $this->visitors = $visitors;
        $this->updateConversionRate();
        return $this;
    }

    public function getConversions(): ?int
    {
        return $this->conversions;
    }

    public function setConversions(?int $conversions): static
    {
        $this->conversions = $conversions;
        $this->updateConversionRate();
        return $this;
    }

    public function getConversionRate(): ?string
    {
        return $this->conversionRate;
    }

    public function setConversionRate(?string $conversionRate): static
    {
        $this->conversionRate = $conversionRate;
        return $this;
    }

    public function getRevenue(): ?string
    {
        return $this->revenue;
    }

    public function setRevenue(?string $revenue): static
    {
        $this->revenue = $revenue;
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

    public function getSlug(): ?string
    {
        return $this->slug;
    }

    public function setSlug(string $slug): static
    {
        $this->slug = $slug;
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

    private function generateSlug(): void
    {
        if ($this->name) {
            $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $this->name)));
            $this->slug = $slug . '-' . uniqid();
        }
    }

    private function updateConversionRate(): void
    {
        if ($this->visitors > 0) {
            $rate = ($this->conversions / $this->visitors) * 100;
            $this->conversionRate = number_format($rate, 2);
        } else {
            $this->conversionRate = '0.00';
        }
    }

    #[Groups(['funnel:read'])]
    public function getDropOffRate(): ?string
    {
        if ($this->visitors > 0) {
            $dropOff = (($this->visitors - $this->conversions) / $this->visitors) * 100;
            return number_format($dropOff, 2);
        }
        return '0.00';
    }
}