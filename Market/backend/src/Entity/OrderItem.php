<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\OrderItemRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: OrderItemRepository::class)]
#[ApiResource]
class OrderItem
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['order:read'])]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'orderItems')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Order $order = null;

    #[ORM\ManyToOne(inversedBy: 'orderItems')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['order:read'])]
    private ?Product $product = null;

    #[ORM\Column]
    #[Assert\Positive]
    #[Groups(['order:read'])]
    private ?int $quantity = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 10, scale: 2)]
    #[Groups(['order:read'])]
    private ?string $unitPrice = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 10, scale: 2)]
    #[Groups(['order:read'])]
    private ?string $totalPrice = null;

    #[ORM\Column(type: Types::JSON, nullable: true)]
    #[Groups(['order:read'])]
    private ?array $productSnapshot = null;

    #[ORM\Column(type: Types::JSON, nullable: true)]
    #[Groups(['order:read'])]
    private ?array $selectedVariant = null;

    public function __construct()
    {
        // Constructor logic if needed
    }

    public function getId(): ?int
    {
        return $this->id;
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

    public function getProduct(): ?Product
    {
        return $this->product;
    }

    public function setProduct(?Product $product): static
    {
        $this->product = $product;
        
        // Create product snapshot
        if ($product) {
            $this->productSnapshot = [
                'id' => $product->getId(),
                'title' => $product->getTitle(),
                'description' => $product->getDescription(),
                'images' => $product->getImages(),
                'category' => $product->getCategory()?->getName(),
                'specifications' => $product->getSpecifications()
            ];
        }
        
        return $this;
    }

    public function getQuantity(): ?int
    {
        return $this->quantity;
    }

    public function setQuantity(int $quantity): static
    {
        $this->quantity = $quantity;
        $this->calculateTotalPrice();
        return $this;
    }

    public function getUnitPrice(): ?string
    {
        return $this->unitPrice;
    }

    public function setUnitPrice(string $unitPrice): static
    {
        $this->unitPrice = $unitPrice;
        $this->calculateTotalPrice();
        return $this;
    }

    public function getTotalPrice(): ?string
    {
        return $this->totalPrice;
    }

    public function setTotalPrice(string $totalPrice): static
    {
        $this->totalPrice = $totalPrice;
        return $this;
    }

    public function getProductSnapshot(): ?array
    {
        return $this->productSnapshot;
    }

    public function setProductSnapshot(?array $productSnapshot): static
    {
        $this->productSnapshot = $productSnapshot;
        return $this;
    }

    public function getSelectedVariant(): ?array
    {
        return $this->selectedVariant;
    }

    public function setSelectedVariant(?array $selectedVariant): static
    {
        $this->selectedVariant = $selectedVariant;
        return $this;
    }

    private function calculateTotalPrice(): void
    {
        if ($this->unitPrice && $this->quantity) {
            $total = (float) $this->unitPrice * $this->quantity;
            $this->totalPrice = number_format($total, 2, '.', '');
        }
    }
}