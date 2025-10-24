<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\LiveStreamViewerRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: LiveStreamViewerRepository::class)]
#[ApiResource]
class LiveStreamViewer
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'viewers')]
    #[ORM\JoinColumn(nullable: false)]
    private ?LiveStream $liveStream = null;

    #[ORM\ManyToOne]
    private ?User $user = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $sessionId = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    private ?\DateTimeInterface $joinedAt = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE, nullable: true)]
    private ?\DateTimeInterface $leftAt = null;

    #[ORM\Column(nullable: true)]
    private ?int $watchDuration = null;

    #[ORM\Column]
    private ?bool $isActive = true;

    public function __construct()
    {
        $this->joinedAt = new \DateTime();
        $this->sessionId = uniqid('viewer_', true);
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getLiveStream(): ?LiveStream
    {
        return $this->liveStream;
    }

    public function setLiveStream(?LiveStream $liveStream): static
    {
        $this->liveStream = $liveStream;
        return $this;
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

    public function getSessionId(): ?string
    {
        return $this->sessionId;
    }

    public function setSessionId(?string $sessionId): static
    {
        $this->sessionId = $sessionId;
        return $this;
    }

    public function getJoinedAt(): ?\DateTimeInterface
    {
        return $this->joinedAt;
    }

    public function setJoinedAt(\DateTimeInterface $joinedAt): static
    {
        $this->joinedAt = $joinedAt;
        return $this;
    }

    public function getLeftAt(): ?\DateTimeInterface
    {
        return $this->leftAt;
    }

    public function setLeftAt(?\DateTimeInterface $leftAt): static
    {
        $this->leftAt = $leftAt;
        
        if ($leftAt && $this->joinedAt) {
            $this->watchDuration = $leftAt->getTimestamp() - $this->joinedAt->getTimestamp();
            $this->isActive = false;
        }
        
        return $this;
    }

    public function getWatchDuration(): ?int
    {
        return $this->watchDuration;
    }

    public function setWatchDuration(?int $watchDuration): static
    {
        $this->watchDuration = $watchDuration;
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
}