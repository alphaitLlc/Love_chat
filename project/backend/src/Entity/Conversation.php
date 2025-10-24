<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use App\Repository\ConversationRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: ConversationRepository::class)]
#[ApiResource(
    operations: [
        new GetCollection(
            normalizationContext: ['groups' => ['conversation:read:collection']],
            security: "is_granted('ROLE_USER')"
        ),
        new Get(
            normalizationContext: ['groups' => ['conversation:read']],
            security: "is_granted('ROLE_ADMIN') or object.hasParticipant(user)"
        ),
        new Post(
            denormalizationContext: ['groups' => ['conversation:write']],
            normalizationContext: ['groups' => ['conversation:read']],
            security: "is_granted('ROLE_USER')"
        ),
        new Put(
            denormalizationContext: ['groups' => ['conversation:update']],
            normalizationContext: ['groups' => ['conversation:read']],
            security: "is_granted('ROLE_ADMIN') or object.hasParticipant(user)"
        )
    ]
)]
class Conversation
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['conversation:read', 'conversation:read:collection'])]
    private ?int $id = null;

    #[ORM\ManyToMany(targetEntity: User::class)]
    #[Groups(['conversation:read', 'conversation:write'])]
    private Collection $participants;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['conversation:read', 'conversation:read:collection', 'conversation:write', 'conversation:update'])]
    private ?string $title = null;

    #[ORM\Column(length: 20)]
    #[Groups(['conversation:read', 'conversation:read:collection', 'conversation:write'])]
    private ?string $type = 'direct';

    #[ORM\Column]
    #[Groups(['conversation:read', 'conversation:read:collection', 'conversation:update'])]
    private ?bool $isArchived = false;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    #[Groups(['conversation:read', 'conversation:read:collection'])]
    private ?\DateTimeInterface $createdAt = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    #[Groups(['conversation:read', 'conversation:read:collection'])]
    private ?\DateTimeInterface $updatedAt = null;

    #[ORM\OneToMany(mappedBy: 'conversation', targetEntity: Message::class, orphanRemoval: true)]
    #[Groups(['conversation:read'])]
    private Collection $messages;

    #[ORM\Column(type: Types::JSON, nullable: true)]
    #[Groups(['conversation:read', 'conversation:write', 'conversation:update'])]
    private ?array $metadata = null;

    #[ORM\Column(length: 255, unique: true)]
    #[Groups(['conversation:read', 'conversation:read:collection'])]
    private ?string $conversationId = null;

    public function __construct()
    {
        $this->participants = new ArrayCollection();
        $this->messages = new ArrayCollection();
        $this->createdAt = new \DateTime();
        $this->updatedAt = new \DateTime();
        $this->generateConversationId();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    /**
     * @return Collection<int, User>
     */
    public function getParticipants(): Collection
    {
        return $this->participants;
    }

    public function addParticipant(User $participant): static
    {
        if (!$this->participants->contains($participant)) {
            $this->participants->add($participant);
            $this->generateConversationId();
        }

        return $this;
    }

    public function removeParticipant(User $participant): static
    {
        $this->participants->removeElement($participant);
        $this->generateConversationId();

        return $this;
    }

    public function getTitle(): ?string
    {
        return $this->title;
    }

    public function setTitle(?string $title): static
    {
        $this->title = $title;
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

    public function isArchived(): ?bool
    {
        return $this->isArchived;
    }

    public function setIsArchived(bool $isArchived): static
    {
        $this->isArchived = $isArchived;
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
     * @return Collection<int, Message>
     */
    public function getMessages(): Collection
    {
        return $this->messages;
    }

    public function addMessage(Message $message): static
    {
        if (!$this->messages->contains($message)) {
            $this->messages->add($message);
            $message->setConversation($this);
            $this->updatedAt = new \DateTime();
        }

        return $this;
    }

    public function removeMessage(Message $message): static
    {
        if ($this->messages->removeElement($message)) {
            if ($message->getConversation() === $this) {
                $message->setConversation(null);
            }
        }

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

    public function getConversationId(): ?string
    {
        return $this->conversationId;
    }

    public function setConversationId(string $conversationId): static
    {
        $this->conversationId = $conversationId;
        return $this;
    }

    private function generateConversationId(): void
    {
        if ($this->participants->count() > 0) {
            $ids = [];
            foreach ($this->participants as $participant) {
                $ids[] = $participant->getId();
            }
            sort($ids);
            $this->conversationId = 'conv_' . implode('_', $ids);
        } else {
            $this->conversationId = 'conv_' . uniqid();
        }
    }

    #[Groups(['conversation:read', 'conversation:read:collection'])]
    public function getLastMessage(): ?Message
    {
        if ($this->messages->isEmpty()) {
            return null;
        }
        
        $criteria = \Doctrine\Common\Collections\Criteria::create()
            ->orderBy(['createdAt' => \Doctrine\Common\Collections\Criteria::DESC])
            ->setMaxResults(1);
        
        $lastMessages = $this->messages->matching($criteria);
        return $lastMessages->isEmpty() ? null : $lastMessages->first();
    }

    #[Groups(['conversation:read', 'conversation:read:collection'])]
    public function getParticipantCount(): int
    {
        return $this->participants->count();
    }

    #[Groups(['conversation:read', 'conversation:read:collection'])]
    public function getMessageCount(): int
    {
        return $this->messages->count();
    }

    public function hasParticipant(User $user): bool
    {
        foreach ($this->participants as $participant) {
            if ($participant->getId() === $user->getId()) {
                return true;
            }
        }
        return false;
    }

    #[Groups(['conversation:read', 'conversation:read:collection'])]
    public function getUnreadCount(User $user): int
    {
        $count = 0;
        foreach ($this->messages as $message) {
            if ($message->getReceiver() === $user && !$message->isRead()) {
                $count++;
            }
        }
        return $count;
    }
}