<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use App\Repository\MessageRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: MessageRepository::class)]
#[ApiResource(
    operations: [
        new GetCollection(
            normalizationContext: ['groups' => ['message:read:collection']],
            security: "is_granted('ROLE_USER')"
        ),
        new Get(
            normalizationContext: ['groups' => ['message:read']],
            security: "is_granted('ROLE_ADMIN') or object.getSender() == user or object.getReceiver() == user"
        ),
        new Post(
            denormalizationContext: ['groups' => ['message:write']],
            normalizationContext: ['groups' => ['message:read']],
            security: "is_granted('ROLE_USER')"
        ),
        new Put(
            denormalizationContext: ['groups' => ['message:update']],
            normalizationContext: ['groups' => ['message:read']],
            security: "is_granted('ROLE_ADMIN') or object.getReceiver() == user"
        )
    ]
)]
class Message
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['message:read', 'message:read:collection'])]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'messages')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['message:read', 'message:read:collection'])]
    private ?Conversation $conversation = null;

    #[ORM\ManyToOne(inversedBy: 'sentMessages')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['message:read', 'message:read:collection'])]
    private ?User $sender = null;

    #[ORM\ManyToOne(inversedBy: 'receivedMessages')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['message:read', 'message:read:collection'])]
    private ?User $receiver = null;

    #[ORM\Column(type: Types::TEXT)]
    #[Assert\NotBlank]
    #[Groups(['message:read', 'message:read:collection', 'message:write'])]
    private ?string $content = null;

    #[ORM\Column(length: 20)]
    #[Assert\Choice(choices: ['text', 'image', 'file', 'product', 'order'])]
    #[Groups(['message:read', 'message:read:collection', 'message:write'])]
    private ?string $type = 'text';

    #[ORM\Column]
    #[Groups(['message:read', 'message:read:collection', 'message:update'])]
    private ?bool $isRead = false;

    #[ORM\Column(type: Types::DATETIME_MUTABLE, nullable: true)]
    #[Groups(['message:read'])]
    private ?\DateTimeInterface $readAt = null;

    #[ORM\Column(type: Types::JSON, nullable: true)]
    #[Groups(['message:read', 'message:write'])]
    private ?array $attachments = null;

    #[ORM\Column(type: Types::JSON, nullable: true)]
    #[Groups(['message:read', 'message:write'])]
    private ?array $metadata = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    #[Groups(['message:read', 'message:read:collection'])]
    private ?\DateTimeInterface $createdAt = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    #[Groups(['message:read'])]
    private ?\DateTimeInterface $updatedAt = null;

    #[ORM\ManyToOne]
    #[Groups(['message:read', 'message:write'])]
    private ?Product $relatedProduct = null;

    #[ORM\ManyToOne]
    #[Groups(['message:read', 'message:write'])]
    private ?Order $relatedOrder = null;

    public function __construct()
    {
        $this->createdAt = new \DateTime();
        $this->updatedAt = new \DateTime();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getConversation(): ?Conversation
    {
        return $this->conversation;
    }

    public function setConversation(?Conversation $conversation): static
    {
        $this->conversation = $conversation;
        return $this;
    }

    public function getSender(): ?User
    {
        return $this->sender;
    }

    public function setSender(?User $sender): static
    {
        $this->sender = $sender;
        return $this;
    }

    public function getReceiver(): ?User
    {
        return $this->receiver;
    }

    public function setReceiver(?User $receiver): static
    {
        $this->receiver = $receiver;
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

    public function isRead(): ?bool
    {
        return $this->isRead;
    }

    public function setIsRead(bool $isRead): static
    {
        $this->isRead = $isRead;
        
        if ($isRead && !$this->readAt) {
            $this->readAt = new \DateTime();
        }
        
        return $this;
    }

    public function getReadAt(): ?\DateTimeInterface
    {
        return $this->readAt;
    }

    public function setReadAt(?\DateTimeInterface $readAt): static
    {
        $this->readAt = $readAt;
        return $this;
    }

    public function getAttachments(): ?array
    {
        return $this->attachments;
    }

    public function setAttachments(?array $attachments): static
    {
        $this->attachments = $attachments;
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

    public function getRelatedProduct(): ?Product
    {
        return $this->relatedProduct;
    }

    public function setRelatedProduct(?Product $relatedProduct): static
    {
        $this->relatedProduct = $relatedProduct;
        return $this;
    }

    public function getRelatedOrder(): ?Order
    {
        return $this->relatedOrder;
    }

    public function setRelatedOrder(?Order $relatedOrder): static
    {
        $this->relatedOrder = $relatedOrder;
        return $this;
    }

    #[Groups(['message:read', 'message:read:collection'])]
    public function getSenderName(): string
    {
        return $this->sender ? $this->sender->getFullName() : 'Unknown';
    }

    #[Groups(['message:read', 'message:read:collection'])]
    public function getReceiverName(): string
    {
        return $this->receiver ? $this->receiver->getFullName() : 'Unknown';
    }

    #[Groups(['message:read'])]
    public function getDeliveryStatus(): string
    {
        if ($this->isRead) {
            return 'read';
        } elseif ($this->readAt) {
            return 'delivered';
        } else {
            return 'sent';
        }
    }
}