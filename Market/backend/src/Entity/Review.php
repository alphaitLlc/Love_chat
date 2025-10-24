<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use ApiPlatform\Metadata\Delete;
use App\Repository\ReviewRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: ReviewRepository::class)]
#[ApiResource(
    operations: [
        new GetCollection(
            normalizationContext: ['groups' => ['review:read:collection']],
            security: "true"
        ),
        new Get(
            normalizationContext: ['groups' => ['review:read']],
            security: "true"
        ),
        new Post(
            denormalizationContext: ['groups' => ['review:write']],
            normalizationContext: ['groups' => ['review:read']],
            security: "is_granted('ROLE_USER')"
        ),
        new Put(
            denormalizationContext: ['groups' => ['review:update']],
            normalizationContext: ['groups' => ['review:read']],
            security: "is_granted('ROLE_ADMIN') or object.getAuthor() == user"
        ),
        new Delete(
            security: "is_granted('ROLE_ADMIN') or object.getAuthor() == user"
        )
    ]
)]
class Review
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['review:read', 'review:read:collection'])]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'reviews')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['review:read', 'review:read:collection'])]
    private ?User $author = null;

    #[ORM\ManyToOne(inversedBy: 'receivedReviews')]
    #[Groups(['review:read', 'review:read:collection'])]
    private ?User $target = null;

    #[ORM\ManyToOne(inversedBy: 'reviews')]
    #[Groups(['review:read', 'review:read:collection'])]
    private ?Product $product = null;

    #[ORM\ManyToOne]
    #[Groups(['review:read'])]
    private ?Order $order = null;

    #[ORM\Column]
    #[Assert\Range(min: 1, max: 5)]
    #[Groups(['review:read', 'review:read:collection', 'review:write'])]
    private ?int $rating = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['review:read', 'review:read:collection', 'review:write', 'review:update'])]
    private ?string $title = null;

    #[ORM\Column(type: Types::TEXT)]
    #[Assert\NotBlank]
    #[Groups(['review:read', 'review:read:collection', 'review:write', 'review:update'])]
    private ?string $comment = null;

    #[ORM\Column(type: Types::JSON, nullable: true)]
    #[Groups(['review:read', 'review:write', 'review:update'])]
    private ?array $images = null;

    #[ORM\Column(nullable: true)]
    #[Groups(['review:read', 'review:read:collection'])]
    private ?int $helpfulCount = 0;

    #[ORM\Column]
    #[Groups(['review:read', 'review:read:collection'])]
    private ?bool $isVerified = false;

    #[ORM\Column]
    #[Groups(['review:read', 'review:read:collection'])]
    private ?bool $isVisible = true;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    #[Groups(['review:read', 'review:read:collection'])]
    private ?\DateTimeInterface $createdAt = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    #[Groups(['review:read'])]
    private ?\DateTimeInterface $updatedAt = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(['review:read', 'review:update'])]
    private ?string $response = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE, nullable: true)]
    #[Groups(['review:read'])]
    private ?\DateTimeInterface $respondedAt = null;

    #[ORM\Column(type: Types::JSON, nullable: true)]
    #[Groups(['review:read', 'review:write', 'review:update'])]
    private ?array $metadata = null;

    public function __construct()
    {
        $this->createdAt = new \DateTime();
        $this->updatedAt = new \DateTime();
        $this->images = [];
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getAuthor(): ?User
    {
        return $this->author;
    }

    public function setAuthor(?User $author): static
    {
        $this->author = $author;
        return $this;
    }

    public function getTarget(): ?User
    {
        return $this->target;
    }

    public function setTarget(?User $target): static
    {
        $this->target = $target;
        return $this;
    }

    public function getProduct(): ?Product
    {
        return $this->product;
    }

    public function setProduct(?Product $product): static
    {
        $this->product = $product;
        return $this;
    }

    public function getOrder(): ?Order
    {
        return $this->order;
    }

    public function setOrder(?Order $order): static
    {
        $this->order = $order;
        return $this;
    }

    public function getRating(): ?int
    {
        return $this->rating;
    }

    public function setRating(int $rating): static
    {
        $this->rating = $rating;
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

    public function getComment(): ?string
    {
        return $this->comment;
    }

    public function setComment(string $comment): static
    {
        $this->comment = $comment;
        return $this;
    }

    public function getImages(): ?array
    {
        return $this->images;
    }

    public function setImages(?array $images): static
    {
        $this->images = $images;
        return $this;
    }

    public function getHelpfulCount(): ?int
    {
        return $this->helpfulCount;
    }

    public function setHelpfulCount(?int $helpfulCount): static
    {
        $this->helpfulCount = $helpfulCount;
        return $this;
    }

    public function isVerified(): ?bool
    {
        return $this->isVerified;
    }

    public function setIsVerified(bool $isVerified): static
    {
        $this->isVerified = $isVerified;
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

    public function getResponse(): ?string
    {
        return $this->response;
    }

    public function setResponse(?string $response): static
    {
        $this->response = $response;
        
        if ($response && !$this->respondedAt) {
            $this->respondedAt = new \DateTime();
        }
        
        return $this;
    }

    public function getRespondedAt(): ?\DateTimeInterface
    {
        return $this->respondedAt;
    }

    public function setRespondedAt(?\DateTimeInterface $respondedAt): static
    {
        $this->respondedAt = $respondedAt;
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
}