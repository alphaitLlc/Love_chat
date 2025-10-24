<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use ApiPlatform\Metadata\Delete;
use App\Repository\SalesFunnelRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: SalesFunnelRepository::class)]
#[ApiResource(
    operations: [
        new GetCollection(
            normalizationContext: ['groups' => ['funnel:read:collection']],
            security: "is_granted('ROLE_VENDOR') or is_granted('ROLE_SUPPLIER')"
        ),
        new Get(
            normalizationContext: ['groups' => ['funnel:read']],
            security: "is_granted('ROLE_ADMIN') or object.getOwner() == user"
        ),
        new Post(
            denormalizationContext: ['groups' => ['funnel:write']],
            normalizationContext: ['groups' => ['funnel:read']],
            security: "is_granted('ROLE_VENDOR') or is_granted('ROLE_SUPPLIER')"
        ),
        new Put(
            denormalizationContext: ['groups' => ['funnel:update']],
            normalizationContext: ['groups' => ['funnel:read']],
            security: "is_granted('ROLE_ADMIN') or object.getOwner() == user"
        ),
        new Delete(
            security: "is_granted('ROLE_ADMIN') or object.getOwner() == user"
        )
    ]
)]
class SalesFunnel
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['funnel:read', 'funnel:read:collection'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Assert\NotBlank]
    #[Groups(['funnel:read', 'funnel:read:collection', 'funnel:write', 'funnel:update'])]
    private ?string $name = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(['funnel:read', 'funnel:write', 'funnel:update'])]
    private ?string $description = null;

    #[ORM\ManyToOne(inversedBy: 'salesFunnels')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['funnel:read', 'funnel:read:collection'])]
    private ?User $owner = null;

    #[ORM\Column(length: 20)]
    #[Assert\Choice(choices: ['draft', 'active', 'paused', 'archived'])]
    #[Groups(['funnel:read', 'funnel:read:collection', 'funnel:update'])]
    private ?string $status = 'draft';

    #[ORM\OneToMany(mappedBy: 'funnel', targetEntity: FunnelStep::class, orphanRemoval: true, cascade: ['persist', 'remove'])]
    #[Groups(['funnel:read'])]
    private Collection $steps;

    #[ORM\Column(type: Types::JSON, nullable: true)]
    #[Groups(['funnel:read', 'funnel:write', 'funnel:update'])]
    private ?array $settings = null;

    #[ORM\Column(type: Types::JSON)]
    #[Groups(['funnel:read', 'funnel:write', 'funnel:update'])]
    private array $targetAudience = [];

    #[ORM\Column(nullable: true)]
    #[Groups(['funnel:read', 'funnel:read:collection'])]
    private ?int $totalVisitors = 0;

    #[ORM\Column(nullable: true)]
    #[Groups(['funnel:read', 'funnel:read:collection'])]
    private ?int $totalConversions = 0;

    #[ORM\Column(type: Types::DECIMAL, precision: 10, scale: 2, nullable: true)]
    #[Groups(['funnel:read', 'funnel:read:collection'])]
    private ?string $totalRevenue = '0.00';

    #[ORM\Column(type: Types::DECIMAL, precision: 5, scale: 2, nullable: true)]
    #[Groups(['funnel:read', 'funnel:read:collection'])]
    private ?string $conversionRate = '0.00';

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    #[Groups(['funnel:read'])]
    private ?\DateTimeInterface $createdAt = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    #[Groups(['funnel:read'])]
    private ?\DateTimeInterface $updatedAt = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE, nullable: true)]
    #[Groups(['funnel:read'])]
    private ?\DateTimeInterface $publishedAt = null;

    #[ORM\Column(length: 255, unique: true)]
    #[Groups(['funnel:read', 'funnel:write', 'funnel:update'])]
    private ?string $slug = null;

    #[ORM\Column(type: Types::JSON, nullable: true)]
    #[Groups(['funnel:read', 'funnel:write', 'funnel:update'])]
    private ?array $integrations = null;

    public function __construct()
    {
        $this->steps = new ArrayCollection();
        $this->createdAt = new \DateTime();
        $this->updatedAt = new \DateTime();
        $this->targetAudience = [];
        $this->generateSlug();
    }

    public function getId(): ?int
    {
        return $this->id;
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

    public function getOwner(): ?User
    {
        return $this->owner;
    }

    public function setOwner(?User $owner): static
    {
        $this->owner = $owner;
        return $this;
    }

    public function getStatus(): ?string
    {
        return $this->status;
    }

    public function setStatus(string $status): static
    {
        $this->status = $status;
        
        if ($status === 'active' && !$this->publishedAt) {
            $this->publishedAt = new \DateTime();
        }
        
        $this->updatedAt = new \DateTime();
        return $this;
    }

    /**
     * @return Collection<int, FunnelStep>
     */
    public function getSteps(): Collection
    {
        return $this->steps;
    }

    public function addStep(FunnelStep $step): static
    {
        if (!$this->steps->contains($step)) {
            $this->steps->add($step);
            $step->setFunnel($this);
        }

        return $this;
    }

    public function removeStep(FunnelStep $step): static
    {
        if ($this->steps->removeElement($step)) {
            if ($step->getFunnel() === $this) {
                $step->setFunnel(null);
            }
        }

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

    public function getTargetAudience(): array
    {
        return $this->targetAudience;
    }

    public function setTargetAudience(array $targetAudience): static
    {
        $this->targetAudience = $targetAudience;
        return $this;
    }

    public function getTotalVisitors(): ?int
    {
        return $this->totalVisitors;
    }

    public function setTotalVisitors(?int $totalVisitors): static
    {
        $this->totalVisitors = $totalVisitors;
        $this->updateConversionRate();
        return $this;
    }

    public function getTotalConversions(): ?int
    {
        return $this->totalConversions;
    }

    public function setTotalConversions(?int $totalConversions): static
    {
        $this->totalConversions = $totalConversions;
        $this->updateConversionRate();
        return $this;
    }

    public function getTotalRevenue(): ?string
    {
        return $this->totalRevenue;
    }

    public function setTotalRevenue(?string $totalRevenue): static
    {
        $this->totalRevenue = $totalRevenue;
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

    public function getPublishedAt(): ?\DateTimeInterface
    {
        return $this->publishedAt;
    }

    public function setPublishedAt(?\DateTimeInterface $publishedAt): static
    {
        $this->publishedAt = $publishedAt;
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

    public function getIntegrations(): ?array
    {
        return $this->integrations;
    }

    public function setIntegrations(?array $integrations): static
    {
        $this->integrations = $integrations;
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
        if ($this->totalVisitors > 0) {
            $rate = ($this->totalConversions / $this->totalVisitors) * 100;
            $this->conversionRate = number_format($rate, 2);
        } else {
            $this->conversionRate = '0.00';
        }
    }

    #[Groups(['funnel:read', 'funnel:read:collection'])]
    public function getStepCount(): int
    {
        return $this->steps->count();
    }

    #[Groups(['funnel:read', 'funnel:read:collection'])]
    public function isPublished(): bool
    {
        return $this->status === 'active' && $this->publishedAt !== null;
    }

    #[Groups(['funnel:read', 'funnel:read:collection'])]
    public function getAverageOrderValue(): ?string
    {
        if ($this->totalConversions > 0) {
            $aov = (float)$this->totalRevenue / $this->totalConversions;
            return number_format($aov, 2);
        }
        return '0.00';
    }
}