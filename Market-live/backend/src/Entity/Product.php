<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use ApiPlatform\Metadata\Delete;
use App\Repository\ProductRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: ProductRepository::class)]
#[ApiResource(
    operations: [
        new GetCollection(
            normalizationContext: ['groups' => ['product:read:collection']],
            security: "true"
        ),
        new Get(
            normalizationContext: ['groups' => ['product:read']],
            security: "true"
        ),
        new Post(
            denormalizationContext: ['groups' => ['product:write']],
            normalizationContext: ['groups' => ['product:read']],
            security: "is_granted('ROLE_VENDOR') or is_granted('ROLE_SUPPLIER')"
        ),
        new Put(
            denormalizationContext: ['groups' => ['product:update']],
            normalizationContext: ['groups' => ['product:read']],
            security: "is_granted('ROLE_ADMIN') or object.getOwner() == user"
        ),
        new Delete(
            security: "is_granted('ROLE_ADMIN') or object.getOwner() == user"
        )
    ]
)]
class Product
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['product:read', 'product:read:collection'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Assert\NotBlank]
    #[Groups(['product:read', 'product:read:collection', 'product:write', 'product:update'])]
    private ?string $title = null;

    #[ORM\Column(type: Types::TEXT)]
    #[Assert\NotBlank]
    #[Groups(['product:read', 'product:write', 'product:update'])]
    private ?string $description = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 10, scale: 2)]
    #[Assert\NotBlank]
    #[Assert\Positive]
    #[Groups(['product:read', 'product:read:collection', 'product:write', 'product:update'])]
    private ?string $price = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 10, scale: 2, nullable: true)]
    #[Groups(['product:read', 'product:read:collection', 'product:write', 'product:update'])]
    private ?string $originalPrice = null;

    #[ORM\Column(type: Types::JSON)]
    #[Groups(['product:read', 'product:read:collection', 'product:write', 'product:update'])]
    private array $images = [];

    #[ORM\ManyToOne(inversedBy: 'products')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['product:read', 'product:read:collection', 'product:write', 'product:update'])]
    private ?Category $category = null;

    #[ORM\ManyToOne(inversedBy: 'products')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['product:read', 'product:read:collection'])]
    private ?User $owner = null;

    #[ORM\Column]
    #[Assert\NotBlank]
    #[Assert\PositiveOrZero]
    #[Groups(['product:read', 'product:read:collection', 'product:write', 'product:update'])]
    private ?int $stock = null;

    #[ORM\Column]
    #[Assert\Positive]
    #[Groups(['product:read', 'product:write', 'product:update'])]
    private ?int $minOrder = 1;

    #[ORM\Column(nullable: true)]
    #[Groups(['product:read', 'product:write', 'product:update'])]
    private ?int $maxOrder = null;

    #[ORM\Column(type: Types::JSON)]
    #[Groups(['product:read', 'product:write', 'product:update'])]
    private array $tags = [];

    #[ORM\Column(type: Types::DECIMAL, precision: 3, scale: 2, nullable: true)]
    #[Groups(['product:read', 'product:read:collection'])]
    private ?string $rating = '0.00';

    #[ORM\Column(nullable: true)]
    #[Groups(['product:read', 'product:read:collection'])]
    private ?int $reviewCount = 0;

    #[ORM\Column]
    #[Groups(['product:read', 'product:read:collection', 'product:write', 'product:update'])]
    private ?bool $isPromoted = false;

    #[ORM\Column(type: Types::JSON, nullable: true)]
    #[Groups(['product:read', 'product:write', 'product:update'])]
    private ?array $specifications = null;

    #[ORM\Column(type: Types::JSON, nullable: true)]
    #[Groups(['product:read', 'product:write', 'product:update'])]
    private ?array $variants = null;

    #[ORM\Column(type: Types::JSON, nullable: true)]
    #[Groups(['product:read', 'product:write', 'product:update'])]
    private ?array $shippingInfo = null;

    #[ORM\Column(length: 20)]
    #[Assert\Choice(choices: ['active', 'inactive', 'draft'])]
    #[Groups(['product:read', 'product:write', 'product:update'])]
    private ?string $status = 'active';

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    #[Groups(['product:read'])]
    private ?\DateTimeInterface $createdAt = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    #[Groups(['product:read'])]
    private ?\DateTimeInterface $updatedAt = null;

    #[ORM\Column(length: 255, unique: true)]
    #[Groups(['product:read', 'product:write', 'product:update'])]
    private ?string $slug = null;

    #[ORM\Column(type: Types::JSON, nullable: true)]
    #[Groups(['product:read', 'product:write', 'product:update'])]
    private ?array $seoData = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 5, scale: 2, nullable: true)]
    #[Groups(['product:read', 'product:write', 'product:update'])]
    private ?string $weight = null;

    #[ORM\Column(type: Types::JSON, nullable: true)]
    #[Groups(['product:read', 'product:write', 'product:update'])]
    private ?array $dimensions = null;

    #[ORM\Column(nullable: true)]
    #[Groups(['product:read', 'product:read:collection'])]
    private ?int $viewCount = 0;

    #[ORM\Column(nullable: true)]
    #[Groups(['product:read', 'product:read:collection'])]
    private ?int $favoriteCount = 0;

    #[ORM\Column(nullable: true)]
    #[Groups(['product:read', 'product:read:collection'])]
    private ?int $shareCount = 0;

    #[ORM\OneToMany(mappedBy: 'product', targetEntity: OrderItem::class)]
    private Collection $orderItems;

    #[ORM\OneToMany(mappedBy: 'product', targetEntity: Review::class)]
    private Collection $reviews;

    #[ORM\OneToMany(mappedBy: 'product', targetEntity: Favorite::class)]
    private Collection $favorites;

    #[ORM\ManyToMany(targetEntity: LiveStream::class, mappedBy: 'products')]
    private Collection $liveStreams;

    public function __construct()
    {
        $this->orderItems = new ArrayCollection();
        $this->reviews = new ArrayCollection();
        $this->favorites = new ArrayCollection();
        $this->liveStreams = new ArrayCollection();
        $this->createdAt = new \DateTime();
        $this->updatedAt = new \DateTime();
        $this->images = [];
        $this->tags = [];
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
        $this->generateSlug();
        return $this;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(string $description): static
    {
        $this->description = $description;
        return $this;
    }

    public function getPrice(): ?string
    {
        return $this->price;
    }

    public function setPrice(string $price): static
    {
        $this->price = $price;
        return $this;
    }

    public function getOriginalPrice(): ?string
    {
        return $this->originalPrice;
    }

    public function setOriginalPrice(?string $originalPrice): static
    {
        $this->originalPrice = $originalPrice;
        return $this;
    }

    public function getImages(): array
    {
        return $this->images;
    }

    public function setImages(array $images): static
    {
        $this->images = $images;
        return $this;
    }

    public function getCategory(): ?Category
    {
        return $this->category;
    }

    public function setCategory(?Category $category): static
    {
        $this->category = $category;
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

    public function getStock(): ?int
    {
        return $this->stock;
    }

    public function setStock(int $stock): static
    {
        $this->stock = $stock;
        return $this;
    }

    public function getMinOrder(): ?int
    {
        return $this->minOrder;
    }

    public function setMinOrder(int $minOrder): static
    {
        $this->minOrder = $minOrder;
        return $this;
    }

    public function getMaxOrder(): ?int
    {
        return $this->maxOrder;
    }

    public function setMaxOrder(?int $maxOrder): static
    {
        $this->maxOrder = $maxOrder;
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

    public function getRating(): ?string
    {
        return $this->rating;
    }

    public function setRating(?string $rating): static
    {
        $this->rating = $rating;
        return $this;
    }

    public function getReviewCount(): ?int
    {
        return $this->reviewCount;
    }

    public function setReviewCount(?int $reviewCount): static
    {
        $this->reviewCount = $reviewCount;
        return $this;
    }

    public function isPromoted(): ?bool
    {
        return $this->isPromoted;
    }

    public function setIsPromoted(bool $isPromoted): static
    {
        $this->isPromoted = $isPromoted;
        return $this;
    }

    public function getSpecifications(): ?array
    {
        return $this->specifications;
    }

    public function setSpecifications(?array $specifications): static
    {
        $this->specifications = $specifications;
        return $this;
    }

    public function getVariants(): ?array
    {
        return $this->variants;
    }

    public function setVariants(?array $variants): static
    {
        $this->variants = $variants;
        return $this;
    }

    public function getShippingInfo(): ?array
    {
        return $this->shippingInfo;
    }

    public function setShippingInfo(?array $shippingInfo): static
    {
        $this->shippingInfo = $shippingInfo;
        return $this;
    }

    public function getStatus(): ?string
    {
        return $this->status;
    }

    public function setStatus(string $status): static
    {
        $this->status = $status;
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

    public function getSeoData(): ?array
    {
        return $this->seoData;
    }

    public function setSeoData(?array $seoData): static
    {
        $this->seoData = $seoData;
        return $this;
    }

    public function getWeight(): ?string
    {
        return $this->weight;
    }

    public function setWeight(?string $weight): static
    {
        $this->weight = $weight;
        return $this;
    }

    public function getDimensions(): ?array
    {
        return $this->dimensions;
    }

    public function setDimensions(?array $dimensions): static
    {
        $this->dimensions = $dimensions;
        return $this;
    }

    public function getViewCount(): ?int
    {
        return $this->viewCount;
    }

    public function setViewCount(?int $viewCount): static
    {
        $this->viewCount = $viewCount;
        return $this;
    }

    public function getFavoriteCount(): ?int
    {
        return $this->favoriteCount;
    }

    public function setFavoriteCount(?int $favoriteCount): static
    {
        $this->favoriteCount = $favoriteCount;
        return $this;
    }

    public function getShareCount(): ?int
    {
        return $this->shareCount;
    }

    public function setShareCount(?int $shareCount): static
    {
        $this->shareCount = $shareCount;
        return $this;
    }

    /**
     * @return Collection<int, OrderItem>
     */
    public function getOrderItems(): Collection
    {
        return $this->orderItems;
    }

    public function addOrderItem(OrderItem $orderItem): static
    {
        if (!$this->orderItems->contains($orderItem)) {
            $this->orderItems->add($orderItem);
            $orderItem->setProduct($this);
        }

        return $this;
    }

    public function removeOrderItem(OrderItem $orderItem): static
    {
        if ($this->orderItems->removeElement($orderItem)) {
            if ($orderItem->getProduct() === $this) {
                $orderItem->setProduct(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, Review>
     */
    public function getReviews(): Collection
    {
        return $this->reviews;
    }

    public function addReview(Review $review): static
    {
        if (!$this->reviews->contains($review)) {
            $this->reviews->add($review);
            $review->setProduct($this);
        }

        return $this;
    }

    public function removeReview(Review $review): static
    {
        if ($this->reviews->removeElement($review)) {
            if ($review->getProduct() === $this) {
                $review->setProduct(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, Favorite>
     */
    public function getFavorites(): Collection
    {
        return $this->favorites;
    }

    public function addFavorite(Favorite $favorite): static
    {
        if (!$this->favorites->contains($favorite)) {
            $this->favorites->add($favorite);
            $favorite->setProduct($this);
        }

        return $this;
    }

    public function removeFavorite(Favorite $favorite): static
    {
        if ($this->favorites->removeElement($favorite)) {
            if ($favorite->getProduct() === $this) {
                $favorite->setProduct(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, LiveStream>
     */
    public function getLiveStreams(): Collection
    {
        return $this->liveStreams;
    }

    public function addLiveStream(LiveStream $liveStream): static
    {
        if (!$this->liveStreams->contains($liveStream)) {
            $this->liveStreams->add($liveStream);
            $liveStream->addProduct($this);
        }

        return $this;
    }

    public function removeLiveStream(LiveStream $liveStream): static
    {
        if ($this->liveStreams->removeElement($liveStream)) {
            $liveStream->removeProduct($this);
        }

        return $this;
    }

    private function generateSlug(): void
    {
        if ($this->title) {
            $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $this->title)));
            $this->slug = $slug . '-' . uniqid();
        }
    }

    #[Groups(['product:read', 'product:read:collection'])]
    public function getDiscountPercentage(): ?int
    {
        if ($this->originalPrice && $this->price) {
            $original = (float) $this->originalPrice;
            $current = (float) $this->price;
            return (int) round((($original - $current) / $original) * 100);
        }
        return null;
    }

    #[Groups(['product:read', 'product:read:collection'])]
    public function isInStock(): bool
    {
        return $this->stock > 0;
    }

    #[Groups(['product:read', 'product:read:collection'])]
    public function isLowStock(): bool
    {
        return $this->stock > 0 && $this->stock <= 10;
    }
}