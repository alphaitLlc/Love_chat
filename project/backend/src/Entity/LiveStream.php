<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use ApiPlatform\Metadata\Delete;
use App\Repository\LiveStreamRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: LiveStreamRepository::class)]
#[ApiResource(
    operations: [
        new GetCollection(
            uriTemplate: '/live-streams/public',
            normalizationContext: ['groups' => ['livestream:read:public']],
            security: "true"
        ),
        new GetCollection(
            normalizationContext: ['groups' => ['livestream:read:collection']],
            security: "is_granted('ROLE_USER')"
        ),
        new Get(
            normalizationContext: ['groups' => ['livestream:read']],
            security: "true"
        ),
        new Post(
            denormalizationContext: ['groups' => ['livestream:write']],
            normalizationContext: ['groups' => ['livestream:read']],
            security: "is_granted('ROLE_VENDOR') or is_granted('ROLE_SUPPLIER')"
        ),
        new Put(
            denormalizationContext: ['groups' => ['livestream:update']],
            normalizationContext: ['groups' => ['livestream:read']],
            security: "is_granted('ROLE_ADMIN') or object.getStreamer() == user"
        ),
        new Delete(
            security: "is_granted('ROLE_ADMIN') or object.getStreamer() == user"
        )
    ]
)]
class LiveStream
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['livestream:read', 'livestream:read:collection', 'livestream:read:public'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Assert\NotBlank]
    #[Groups(['livestream:read', 'livestream:read:collection', 'livestream:read:public', 'livestream:write', 'livestream:update'])]
    private ?string $title = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(['livestream:read', 'livestream:read:public', 'livestream:write', 'livestream:update'])]
    private ?string $description = null;

    #[ORM\ManyToOne(inversedBy: 'liveStreams')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['livestream:read', 'livestream:read:collection', 'livestream:read:public'])]
    private ?User $streamer = null;

    #[ORM\Column(length: 20)]
    #[Assert\Choice(choices: ['scheduled', 'live', 'ended', 'cancelled'])]
    #[Groups(['livestream:read', 'livestream:read:collection', 'livestream:read:public', 'livestream:update'])]
    private ?string $status = 'scheduled';

    #[ORM\Column(type: Types::DATETIME_MUTABLE, nullable: true)]
    #[Groups(['livestream:read', 'livestream:read:collection', 'livestream:read:public', 'livestream:write', 'livestream:update'])]
    private ?\DateTimeInterface $scheduledAt = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE, nullable: true)]
    #[Groups(['livestream:read', 'livestream:read:public'])]
    private ?\DateTimeInterface $startedAt = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE, nullable: true)]
    #[Groups(['livestream:read', 'livestream:read:public'])]
    private ?\DateTimeInterface $endedAt = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['livestream:read'])]
    private ?string $streamKey = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['livestream:read', 'livestream:read:public'])]
    private ?string $streamUrl = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['livestream:read', 'livestream:read:public'])]
    private ?string $playbackUrl = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['livestream:read', 'livestream:read:collection', 'livestream:read:public', 'livestream:write', 'livestream:update'])]
    private ?string $thumbnail = null;

    #[ORM\Column(nullable: true)]
    #[Groups(['livestream:read', 'livestream:read:collection', 'livestream:read:public'])]
    private ?int $viewerCount = 0;

    #[ORM\Column(nullable: true)]
    #[Groups(['livestream:read', 'livestream:read:public'])]
    private ?int $maxViewers = 0;

    #[ORM\Column(nullable: true)]
    #[Groups(['livestream:read', 'livestream:read:public'])]
    private ?int $totalViews = 0;

    #[ORM\Column(type: Types::DECIMAL, precision: 10, scale: 2, nullable: true)]
    #[Groups(['livestream:read'])]
    private ?string $revenue = '0.00';

    #[ORM\Column(nullable: true)]
    #[Groups(['livestream:read'])]
    private ?int $ordersCount = 0;

    #[ORM\Column(type: Types::JSON, nullable: true)]
    #[Groups(['livestream:read', 'livestream:write', 'livestream:update'])]
    private ?array $settings = null;

    #[ORM\Column(type: Types::JSON)]
    #[Groups(['livestream:read', 'livestream:write', 'livestream:update'])]
    private array $tags = [];

    #[ORM\Column]
    #[Groups(['livestream:read', 'livestream:read:collection', 'livestream:read:public', 'livestream:write', 'livestream:update'])]
    private ?bool $isPublic = true;

    #[ORM\Column]
    #[Groups(['livestream:read', 'livestream:write', 'livestream:update'])]
    private ?bool $allowChat = true;

    #[ORM\Column]
    #[Groups(['livestream:read', 'livestream:write', 'livestream:update'])]
    private ?bool $recordStream = false;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['livestream:read'])]
    private ?string $recordingUrl = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    #[Groups(['livestream:read'])]
    private ?\DateTimeInterface $createdAt = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    #[Groups(['livestream:read'])]
    private ?\DateTimeInterface $updatedAt = null;

    #[ORM\ManyToMany(targetEntity: Product::class, inversedBy: 'liveStreams')]
    #[Groups(['livestream:read', 'livestream:write', 'livestream:update'])]
    private Collection $products;

    #[ORM\OneToMany(mappedBy: 'liveStream', targetEntity: LiveStreamMessage::class, orphanRemoval: true)]
    private Collection $messages;

    #[ORM\OneToMany(mappedBy: 'liveStream', targetEntity: LiveStreamViewer::class, orphanRemoval: true)]
    private Collection $viewers;

    public function __construct()
    {
        $this->products = new ArrayCollection();
        $this->messages = new ArrayCollection();
        $this->viewers = new ArrayCollection();
        $this->createdAt = new \DateTime();
        $this->updatedAt = new \DateTime();
        $this->tags = [];
        $this->generateStreamKey();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getTitle(): ?string
    {
        return $this->title;
    }

    public function setTitle(string $title): static
    {
        $this->title = $title;
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

    public function getStreamer(): ?User
    {
        return $this->streamer;
    }

    public function setStreamer(?User $streamer): static
    {
        $this->streamer = $streamer;
        return $this;
    }

    public function getStatus(): ?string
    {
        return $this->status;
    }

    public function setStatus(string $status): static
    {
        $this->status = $status;
        
        if ($status === 'live' && !$this->startedAt) {
            $this->startedAt = new \DateTime();
        } elseif ($status === 'ended' && !$this->endedAt) {
            $this->endedAt = new \DateTime();
        }
        
        $this->updatedAt = new \DateTime();
        return $this;
    }

    public function getScheduledAt(): ?\DateTimeInterface
    {
        return $this->scheduledAt;
    }

    public function setScheduledAt(?\DateTimeInterface $scheduledAt): static
    {
        $this->scheduledAt = $scheduledAt;
        return $this;
    }

    public function getStartedAt(): ?\DateTimeInterface
    {
        return $this->startedAt;
    }

    public function setStartedAt(?\DateTimeInterface $startedAt): static
    {
        $this->startedAt = $startedAt;
        return $this;
    }

    public function getEndedAt(): ?\DateTimeInterface
    {
        return $this->endedAt;
    }

    public function setEndedAt(?\DateTimeInterface $endedAt): static
    {
        $this->endedAt = $endedAt;
        return $this;
    }

    public function getStreamKey(): ?string
    {
        return $this->streamKey;
    }

    public function setStreamKey(?string $streamKey): static
    {
        $this->streamKey = $streamKey;
        return $this;
    }

    public function getStreamUrl(): ?string
    {
        return $this->streamUrl;
    }

    public function setStreamUrl(?string $streamUrl): static
    {
        $this->streamUrl = $streamUrl;
        return $this;
    }

    public function getPlaybackUrl(): ?string
    {
        return $this->playbackUrl;
    }

    public function setPlaybackUrl(?string $playbackUrl): static
    {
        $this->playbackUrl = $playbackUrl;
        return $this;
    }

    public function getThumbnail(): ?string
    {
        return $this->thumbnail;
    }

    public function setThumbnail(?string $thumbnail): static
    {
        $this->thumbnail = $thumbnail;
        return $this;
    }

    public function getViewerCount(): ?int
    {
        return $this->viewerCount;
    }

    public function setViewerCount(?int $viewerCount): static
    {
        $this->viewerCount = $viewerCount;
        
        if ($viewerCount > $this->maxViewers) {
            $this->maxViewers = $viewerCount;
        }
        
        return $this;
    }

    public function getMaxViewers(): ?int
    {
        return $this->maxViewers;
    }

    public function setMaxViewers(?int $maxViewers): static
    {
        $this->maxViewers = $maxViewers;
        return $this;
    }

    public function getTotalViews(): ?int
    {
        return $this->totalViews;
    }

    public function setTotalViews(?int $totalViews): static
    {
        $this->totalViews = $totalViews;
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

    public function getOrdersCount(): ?int
    {
        return $this->ordersCount;
    }

    public function setOrdersCount(?int $ordersCount): static
    {
        $this->ordersCount = $ordersCount;
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

    public function getTags(): array
    {
        return $this->tags;
    }

    public function setTags(array $tags): static
    {
        $this->tags = $tags;
        return $this;
    }

    public function isPublic(): ?bool
    {
        return $this->isPublic;
    }

    public function setIsPublic(bool $isPublic): static
    {
        $this->isPublic = $isPublic;
        return $this;
    }

    public function isAllowChat(): ?bool
    {
        return $this->allowChat;
    }

    public function setAllowChat(bool $allowChat): static
    {
        $this->allowChat = $allowChat;
        return $this;
    }

    public function isRecordStream(): ?bool
    {
        return $this->recordStream;
    }

    public function setRecordStream(bool $recordStream): static
    {
        $this->recordStream = $recordStream;
        return $this;
    }

    public function getRecordingUrl(): ?string
    {
        return $this->recordingUrl;
    }

    public function setRecordingUrl(?string $recordingUrl): static
    {
        $this->recordingUrl = $recordingUrl;
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
     * @return Collection<int, Product>
     */
    public function getProducts(): Collection
    {
        return $this->products;
    }

    public function addProduct(Product $product): static
    {
        if (!$this->products->contains($product)) {
            $this->products->add($product);
        }

        return $this;
    }

    public function removeProduct(Product $product): static
    {
        $this->products->removeElement($product);

        return $this;
    }

    /**
     * @return Collection<int, LiveStreamMessage>
     */
    public function getMessages(): Collection
    {
        return $this->messages;
    }

    public function addMessage(LiveStreamMessage $message): static
    {
        if (!$this->messages->contains($message)) {
            $this->messages->add($message);
            $message->setLiveStream($this);
        }

        return $this;
    }

    public function removeMessage(LiveStreamMessage $message): static
    {
        if ($this->messages->removeElement($message)) {
            if ($message->getLiveStream() === $this) {
                $message->setLiveStream(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, LiveStreamViewer>
     */
    public function getViewers(): Collection
    {
        return $this->viewers;
    }

    public function addViewer(LiveStreamViewer $viewer): static
    {
        if (!$this->viewers->contains($viewer)) {
            $this->viewers->add($viewer);
            $viewer->setLiveStream($this);
        }

        return $this;
    }

    public function removeViewer(LiveStreamViewer $viewer): static
    {
        if ($this->viewers->removeElement($viewer)) {
            if ($viewer->getLiveStream() === $this) {
                $viewer->setLiveStream(null);
            }
        }

        return $this;
    }

    private function generateStreamKey(): void
    {
        $this->streamKey = 'stream_' . uniqid() . '_' . bin2hex(random_bytes(8));
    }

    #[Groups(['livestream:read', 'livestream:read:collection', 'livestream:read:public'])]
    public function getDuration(): ?int
    {
        if ($this->startedAt && $this->endedAt) {
            return $this->endedAt->getTimestamp() - $this->startedAt->getTimestamp();
        } elseif ($this->startedAt && $this->status === 'live') {
            return (new \DateTime())->getTimestamp() - $this->startedAt->getTimestamp();
        }
        return null;
    }

    #[Groups(['livestream:read', 'livestream:read:collection', 'livestream:read:public'])]
    public function isLive(): bool
    {
        return $this->status === 'live';
    }

    #[Groups(['livestream:read', 'livestream:read:collection', 'livestream:read:public'])]
    public function isScheduled(): bool
    {
        return $this->status === 'scheduled' && $this->scheduledAt && $this->scheduledAt > new \DateTime();
    }
}