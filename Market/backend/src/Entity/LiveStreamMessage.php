<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use App\Repository\LiveStreamMessageRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: LiveStreamMessageRepository::class)]
#[ApiResource(
    operations: [
        new GetCollection(
            normalizationContext: ['groups' => ['livestream_message:read:collection']],
            security: "true"
        ),
        new Get(
            normalizationContext: ['groups' => ['livestream_message:read']],
            security: "true"
        ),
        new Post(
            denormalizationContext: ['groups' => ['livestream_message:write']],
            normalizationContext: ['groups' => ['livestream_message:read']],
            security: "is_granted('ROLE_USER')"
        )
    ]
)]
class LiveStreamMessage
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['livestream_message:read', 'livestream_message:read:collection'])]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'messages')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['livestream_message:read', 'livestream_message:read:collection'])]
    private ?LiveStream $liveStream = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['livestream_message:read', 'livestream_message:read:collection'])]
    private ?User $user = null;

    #[ORM\Column(type: Types::TEXT)]
    #[Assert\NotBlank]
    #[Groups(['livestream_message:read', 'livestream_message:read:collection', 'livestream_message:write'])]
    private ?string $content = null;

    #[ORM\Column(length: 20)]
    #[Assert\Choice(choices: ['text', 'emoji', 'system', 'product_highlight'])]
    #[Groups(['livestream_message:read', 'livestream_message:read:collection', 'livestream_message:write'])]
    private ?string $type = 'text';

    #[ORM\Column(type: Types::JSON, nullable: true)]
    #[Groups(['livestream_message:read', 'livestream_message:read:collection', 'livestream_message:write'])]
    private ?array $metadata = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    #[Groups(['livestream_message:read', 'livestream_message:read:collection'])]
    private ?\DateTimeInterface $createdAt = null;

    #[ORM\Column]
    #[Groups(['livestream_message:read', 'livestream_message:read:collection'])]
    private ?bool $isVisible = true;

    public function __construct()
    {
        $this->createdAt = new \DateTime();
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

    public function getContent(): ?string
    {
        return $this->content;
    }

    public function setContent(string $content): static
    {
        $this->content = $content;
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

    public function isVisible(): ?bool
    {
        return $this->isVisible;
    }

    public function setIsVisible(bool $isVisible): static
    {
        $this->isVisible = $isVisible;
        return $this;
    }
}