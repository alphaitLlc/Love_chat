<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use ApiPlatform\Metadata\Delete;
use App\Repository\UserRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Bridge\Doctrine\Validator\Constraints\UniqueEntity;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: UserRepository::class)]
#[ORM\Table(name: '`user`')]
#[UniqueEntity(fields: ['email'], message: 'Cette adresse email est déjà utilisée.')]
#[ApiResource(
    operations: [
        new GetCollection(
            normalizationContext: ['groups' => ['user:read:collection']],
            security: "is_granted('ROLE_ADMIN')"
        ),
        new Get(
            normalizationContext: ['groups' => ['user:read']],
            security: "is_granted('ROLE_ADMIN') or object == user"
        ),
        new Get(
            uriTemplate: '/users/{id}/public',
            normalizationContext: ['groups' => ['user:read:public']],
            security: "true"
        ),
        new Post(
            uriTemplate: '/register',
            denormalizationContext: ['groups' => ['user:write']],
            normalizationContext: ['groups' => ['user:read']],
            security: "true"
        ),
        new Put(
            denormalizationContext: ['groups' => ['user:update']],
            normalizationContext: ['groups' => ['user:read']],
            security: "is_granted('ROLE_ADMIN') or object == user"
        ),
        new Delete(
            security: "is_granted('ROLE_ADMIN') or object == user"
        )
    ]
)]
class User implements UserInterface, PasswordAuthenticatedUserInterface
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['user:read', 'user:read:collection', 'user:read:public'])]
    private ?int $id = null;

    #[ORM\Column(length: 180, unique: true)]
    #[Assert\NotBlank]
    #[Assert\Email]
    #[Groups(['user:read', 'user:write', 'user:update'])]
    private ?string $email = null;

    #[ORM\Column]
    #[Groups(['user:read'])]
    private array $roles = [];

    #[ORM\Column]
    #[Groups(['user:write', 'user:update'])]
    private ?string $password = null;

    #[ORM\Column(length: 100)]
    #[Assert\NotBlank]
    #[Groups(['user:read', 'user:read:collection', 'user:read:public', 'user:write', 'user:update'])]
    private ?string $firstName = null;

    #[ORM\Column(length: 100)]
    #[Assert\NotBlank]
    #[Groups(['user:read', 'user:read:collection', 'user:read:public', 'user:write', 'user:update'])]
    private ?string $lastName = null;

    #[ORM\Column(length: 20)]
    #[Assert\Choice(choices: ['client', 'vendor', 'supplier', 'admin'])]
    #[Groups(['user:read', 'user:read:collection', 'user:read:public', 'user:write'])]
    private ?string $role = 'client';

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['user:read', 'user:read:public', 'user:write', 'user:update'])]
    private ?string $company = null;

    #[ORM\Column(length: 20, nullable: true)]
    #[Groups(['user:read', 'user:write', 'user:update'])]
    private ?string $phone = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 3, scale: 2, nullable: true)]
    #[Groups(['user:read', 'user:read:public'])]
    private ?string $rating = '0.00';

    #[ORM\Column(nullable: true)]
    #[Groups(['user:read', 'user:read:public'])]
    private ?int $reviewCount = 0;

    #[ORM\Column]
    #[Groups(['user:read', 'user:read:public'])]
    private ?bool $isVerified = false;

    #[ORM\Column(type: Types::JSON, nullable: true)]
    #[Groups(['user:read', 'user:read:public'])]
    private ?array $badges = [];

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    #[Groups(['user:read', 'user:read:public'])]
    private ?\DateTimeInterface $joinedAt = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['user:read', 'user:read:public'])]
    private ?string $avatar = null;

    #[ORM\Column(type: Types::JSON, nullable: true)]
    #[Groups(['user:read', 'user:update'])]
    private ?array $address = null;

    #[ORM\Column(type: Types::JSON, nullable: true)]
    #[Groups(['user:read', 'user:update'])]
    private ?array $preferences = null;

    #[ORM\Column(length: 20, nullable: true)]
    #[Groups(['user:read'])]
    private ?string $kycStatus = 'pending';

    #[ORM\Column(length: 20, nullable: true)]
    #[Groups(['user:read', 'user:read:public'])]
    private ?string $subscription = 'free';

    #[ORM\Column(type: Types::DATETIME_MUTABLE, nullable: true)]
    #[Groups(['user:read'])]
    private ?\DateTimeInterface $lastLoginAt = null;

    #[ORM\Column]
    #[Groups(['user:read'])]
    private ?bool $isActive = true;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(['user:read', 'user:read:public', 'user:update'])]
    private ?string $bio = null;

    #[ORM\Column(type: Types::JSON, nullable: true)]
    #[Groups(['user:read'])]
    private ?array $socialLinks = null;

    #[ORM\Column(type: Types::JSON, nullable: true)]
    #[Groups(['user:read'])]
    private ?array $metadata = null;

    #[ORM\OneToMany(mappedBy: 'owner', targetEntity: Product::class, orphanRemoval: true)]
    private Collection $products;

    #[ORM\OneToMany(mappedBy: 'buyer', targetEntity: Order::class)]
    private Collection $orders;

    #[ORM\OneToMany(mappedBy: 'seller', targetEntity: Order::class)]
    private Collection $sales;

    #[ORM\OneToMany(mappedBy: 'author', targetEntity: Review::class)]
    private Collection $reviews;

    #[ORM\OneToMany(mappedBy: 'target', targetEntity: Review::class)]
    private Collection $receivedReviews;

    #[ORM\OneToMany(mappedBy: 'sender', targetEntity: Message::class)]
    private Collection $sentMessages;

    #[ORM\OneToMany(mappedBy: 'receiver', targetEntity: Message::class)]
    private Collection $receivedMessages;

    #[ORM\OneToMany(mappedBy: 'streamer', targetEntity: LiveStream::class)]
    private Collection $liveStreams;

    #[ORM\OneToMany(mappedBy: 'owner', targetEntity: SalesFunnel::class)]
    private Collection $salesFunnels;

    #[ORM\OneToMany(mappedBy: 'user', targetEntity: PaymentMethod::class, orphanRemoval: true)]
    private Collection $paymentMethods;

    #[ORM\OneToMany(mappedBy: 'user', targetEntity: KYCDocument::class, orphanRemoval: true)]
    private Collection $kycDocuments;

    public function __construct()
    {
        $this->products = new ArrayCollection();
        $this->orders = new ArrayCollection();
        $this->sales = new ArrayCollection();
        $this->reviews = new ArrayCollection();
        $this->receivedReviews = new ArrayCollection();
        $this->sentMessages = new ArrayCollection();
        $this->receivedMessages = new ArrayCollection();
        $this->liveStreams = new ArrayCollection();
        $this->salesFunnels = new ArrayCollection();
        $this->paymentMethods = new ArrayCollection();
        $this->kycDocuments = new ArrayCollection();
        $this->joinedAt = new \DateTime();
        $this->badges = [];
        $this->preferences = [
            'language' => 'fr',
            'currency' => 'EUR',
            'timezone' => 'Europe/Paris',
            'notifications' => [
                'email' => true,
                'push' => true,
                'sms' => false,
                'marketing' => true
            ],
            'privacy' => [
                'profileVisibility' => 'public',
                'showOnlineStatus' => true,
                'allowDirectMessages' => true
            ]
        ];
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(string $email): static
    {
        $this->email = $email;
        return $this;
    }

    public function getUserIdentifier(): string
    {
        return (string) $this->email;
    }

    public function getRoles(): array
    {
        $roles = $this->roles;
        $roles[] = 'ROLE_USER';
        
        // Add role based on user type
        switch ($this->role) {
            case 'vendor':
                $roles[] = 'ROLE_VENDOR';
                break;
            case 'supplier':
                $roles[] = 'ROLE_SUPPLIER';
                break;
            case 'admin':
                $roles[] = 'ROLE_ADMIN';
                break;
        }

        return array_unique($roles);
    }

    public function setRoles(array $roles): static
    {
        $this->roles = $roles;
        return $this;
    }

    public function getPassword(): string
    {
        return $this->password;
    }

    public function setPassword(string $password): static
    {
        $this->password = $password;
        return $this;
    }

    public function eraseCredentials(): void
    {
        // If you store any temporary, sensitive data on the user, clear it here
    }

    public function getFirstName(): ?string
    {
        return $this->firstName;
    }

    public function setFirstName(string $firstName): static
    {
        $this->firstName = $firstName;
        return $this;
    }

    public function getLastName(): ?string
    {
        return $this->lastName;
    }

    public function setLastName(string $lastName): static
    {
        $this->lastName = $lastName;
        return $this;
    }

    public function getRole(): ?string
    {
        return $this->role;
    }

    public function setRole(string $role): static
    {
        $this->role = $role;
        return $this;
    }

    public function getCompany(): ?string
    {
        return $this->company;
    }

    public function setCompany(?string $company): static
    {
        $this->company = $company;
        return $this;
    }

    public function getPhone(): ?string
    {
        return $this->phone;
    }

    public function setPhone(?string $phone): static
    {
        $this->phone = $phone;
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

    public function isVerified(): ?bool
    {
        return $this->isVerified;
    }

    public function setIsVerified(bool $isVerified): static
    {
        $this->isVerified = $isVerified;
        return $this;
    }

    public function getBadges(): ?array
    {
        return $this->badges;
    }

    public function setBadges(?array $badges): static
    {
        $this->badges = $badges;
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

    public function getAvatar(): ?string
    {
        return $this->avatar;
    }

    public function setAvatar(?string $avatar): static
    {
        $this->avatar = $avatar;
        return $this;
    }

    public function getAddress(): ?array
    {
        return $this->address;
    }

    public function setAddress(?array $address): static
    {
        $this->address = $address;
        return $this;
    }

    public function getPreferences(): ?array
    {
        return $this->preferences;
    }

    public function setPreferences(?array $preferences): static
    {
        $this->preferences = $preferences;
        return $this;
    }

    public function getKycStatus(): ?string
    {
        return $this->kycStatus;
    }

    public function setKycStatus(?string $kycStatus): static
    {
        $this->kycStatus = $kycStatus;
        return $this;
    }

    public function getSubscription(): ?string
    {
        return $this->subscription;
    }

    public function setSubscription(?string $subscription): static
    {
        $this->subscription = $subscription;
        return $this;
    }

    public function getLastLoginAt(): ?\DateTimeInterface
    {
        return $this->lastLoginAt;
    }

    public function setLastLoginAt(?\DateTimeInterface $lastLoginAt): static
    {
        $this->lastLoginAt = $lastLoginAt;
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

    public function getBio(): ?string
    {
        return $this->bio;
    }

    public function setBio(?string $bio): static
    {
        $this->bio = $bio;
        return $this;
    }

    public function getSocialLinks(): ?array
    {
        return $this->socialLinks;
    }

    public function setSocialLinks(?array $socialLinks): static
    {
        $this->socialLinks = $socialLinks;
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
            $product->setOwner($this);
        }

        return $this;
    }

    public function removeProduct(Product $product): static
    {
        if ($this->products->removeElement($product)) {
            if ($product->getOwner() === $this) {
                $product->setOwner(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, Order>
     */
    public function getOrders(): Collection
    {
        return $this->orders;
    }

    public function addOrder(Order $order): static
    {
        if (!$this->orders->contains($order)) {
            $this->orders->add($order);
            $order->setBuyer($this);
        }

        return $this;
    }

    public function removeOrder(Order $order): static
    {
        if ($this->orders->removeElement($order)) {
            if ($order->getBuyer() === $this) {
                $order->setBuyer(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, Order>
     */
    public function getSales(): Collection
    {
        return $this->sales;
    }

    public function addSale(Order $sale): static
    {
        if (!$this->sales->contains($sale)) {
            $this->sales->add($sale);
            $sale->setSeller($this);
        }

        return $this;
    }

    public function removeSale(Order $sale): static
    {
        if ($this->sales->removeElement($sale)) {
            if ($sale->getSeller() === $this) {
                $sale->setSeller(null);
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
            $review->setAuthor($this);
        }

        return $this;
    }

    public function removeReview(Review $review): static
    {
        if ($this->reviews->removeElement($review)) {
            if ($review->getAuthor() === $this) {
                $review->setAuthor(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, Review>
     */
    public function getReceivedReviews(): Collection
    {
        return $this->receivedReviews;
    }

    public function addReceivedReview(Review $receivedReview): static
    {
        if (!$this->receivedReviews->contains($receivedReview)) {
            $this->receivedReviews->add($receivedReview);
            $receivedReview->setTarget($this);
        }

        return $this;
    }

    public function removeReceivedReview(Review $receivedReview): static
    {
        if ($this->receivedReviews->removeElement($receivedReview)) {
            if ($receivedReview->getTarget() === $this) {
                $receivedReview->setTarget(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, Message>
     */
    public function getSentMessages(): Collection
    {
        return $this->sentMessages;
    }

    public function addSentMessage(Message $sentMessage): static
    {
        if (!$this->sentMessages->contains($sentMessage)) {
            $this->sentMessages->add($sentMessage);
            $sentMessage->setSender($this);
        }

        return $this;
    }

    public function removeSentMessage(Message $sentMessage): static
    {
        if ($this->sentMessages->removeElement($sentMessage)) {
            if ($sentMessage->getSender() === $this) {
                $sentMessage->setSender(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, Message>
     */
    public function getReceivedMessages(): Collection
    {
        return $this->receivedMessages;
    }

    public function addReceivedMessage(Message $receivedMessage): static
    {
        if (!$this->receivedMessages->contains($receivedMessage)) {
            $this->receivedMessages->add($receivedMessage);
            $receivedMessage->setReceiver($this);
        }

        return $this;
    }

    public function removeReceivedMessage(Message $receivedMessage): static
    {
        if ($this->receivedMessages->removeElement($receivedMessage)) {
            if ($receivedMessage->getReceiver() === $this) {
                $receivedMessage->setReceiver(null);
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
            $liveStream->setStreamer($this);
        }

        return $this;
    }

    public function removeLiveStream(LiveStream $liveStream): static
    {
        if ($this->liveStreams->removeElement($liveStream)) {
            if ($liveStream->getStreamer() === $this) {
                $liveStream->setStreamer(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, SalesFunnel>
     */
    public function getSalesFunnels(): Collection
    {
        return $this->salesFunnels;
    }

    public function addSalesFunnel(SalesFunnel $salesFunnel): static
    {
        if (!$this->salesFunnels->contains($salesFunnel)) {
            $this->salesFunnels->add($salesFunnel);
            $salesFunnel->setOwner($this);
        }

        return $this;
    }

    public function removeSalesFunnel(SalesFunnel $salesFunnel): static
    {
        if ($this->salesFunnels->removeElement($salesFunnel)) {
            if ($salesFunnel->getOwner() === $this) {
                $salesFunnel->setOwner(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, PaymentMethod>
     */
    public function getPaymentMethods(): Collection
    {
        return $this->paymentMethods;
    }

    public function addPaymentMethod(PaymentMethod $paymentMethod): static
    {
        if (!$this->paymentMethods->contains($paymentMethod)) {
            $this->paymentMethods->add($paymentMethod);
            $paymentMethod->setUser($this);
        }

        return $this;
    }

    public function removePaymentMethod(PaymentMethod $paymentMethod): static
    {
        if ($this->paymentMethods->removeElement($paymentMethod)) {
            if ($paymentMethod->getUser() === $this) {
                $paymentMethod->setUser(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, KYCDocument>
     */
    public function getKycDocuments(): Collection
    {
        return $this->kycDocuments;
    }

    public function addKycDocument(KYCDocument $kycDocument): static
    {
        if (!$this->kycDocuments->contains($kycDocument)) {
            $this->kycDocuments->add($kycDocument);
            $kycDocument->setUser($this);
        }

        return $this;
    }

    public function removeKycDocument(KYCDocument $kycDocument): static
    {
        if ($this->kycDocuments->removeElement($kycDocument)) {
            if ($kycDocument->getUser() === $this) {
                $kycDocument->setUser(null);
            }
        }

        return $this;
    }

    #[Groups(['user:read', 'user:read:public'])]
    public function getFullName(): string
    {
        return $this->firstName . ' ' . $this->lastName;
    }

    #[Groups(['user:read', 'user:read:public'])]
    public function getInitials(): string
    {
        return strtoupper(substr($this->firstName, 0, 1) . substr($this->lastName, 0, 1));
    }

    #[Groups(['user:read'])]
    public function getDefaultPaymentMethod(): ?PaymentMethod
    {
        foreach ($this->paymentMethods as $method) {
            if ($method->isDefault() && $method->isActive()) {
                return $method;
            }
        }
        return null;
    }

    #[Groups(['user:read'])]
    public function hasCompletedKYC(): bool
    {
        return $this->kycStatus === 'verified';
    }

    #[Groups(['user:read'])]
    public function getAccountAge(): int
    {
        return $this->joinedAt->diff(new \DateTime())->days;
    }

    #[Groups(['user:read', 'user:read:public'])]
    public function getAccountType(): string
    {
        if ($this->subscription === 'enterprise') {
            return 'Enterprise';
        } elseif ($this->subscription === 'premium') {
            return 'Premium';
        } else {
            return 'Standard';
        }
    }
}