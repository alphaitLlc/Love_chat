<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use App\Repository\KYCDocumentRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: KYCDocumentRepository::class)]
#[ApiResource(
    operations: [
        new GetCollection(
            normalizationContext: ['groups' => ['kyc_document:read:collection']],
            security: "is_granted('ROLE_ADMIN')"
        ),
        new Get(
            normalizationContext: ['groups' => ['kyc_document:read']],
            security: "is_granted('ROLE_ADMIN') or object.getUser() == user"
        )
    ]
)]
class KYCDocument
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['kyc_document:read', 'kyc_document:read:collection'])]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'kycDocuments')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['kyc_document:read', 'kyc_document:read:collection'])]
    private ?User $user = null;

    #[ORM\Column(length: 50)]
    #[Assert\Choice(choices: ['identity_card', 'selfie', 'proof_of_address', 'business_registration', 'tax_certificate', 'bank_statement'])]
    #[Groups(['kyc_document:read', 'kyc_document:read:collection'])]
    private ?string $type = null;

    #[ORM\Column(length: 255)]
    #[Groups(['kyc_document:read'])]
    private ?string $filePath = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['kyc_document:read'])]
    private ?string $fileHash = null;

    #[ORM\Column(length: 20)]
    #[Assert\Choice(choices: ['pending', 'approved', 'rejected'])]
    #[Groups(['kyc_document:read', 'kyc_document:read:collection'])]
    private ?string $status = 'pending';

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(['kyc_document:read'])]
    private ?string $rejectionReason = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    #[Groups(['kyc_document:read', 'kyc_document:read:collection'])]
    private ?\DateTimeInterface $uploadedAt = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE, nullable: true)]
    #[Groups(['kyc_document:read'])]
    private ?\DateTimeInterface $verifiedAt = null;

    #[ORM\Column(type: Types::JSON, nullable: true)]
    #[Groups(['kyc_document:read'])]
    private ?array $metadata = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['kyc_document:read'])]
    private ?string $verifiedBy = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE, nullable: true)]
    #[Groups(['kyc_document:read'])]
    private ?\DateTimeInterface $expiresAt = null;

    public function __construct()
    {
        $this->uploadedAt = new \DateTime();
    }

    public function getId(): ?int
    {
        return $this->id;
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

    public function getType(): ?string
    {
        return $this->type;
    }

    public function setType(string $type): static
    {
        $this->type = $type;
        return $this;
    }

    public function getFilePath(): ?string
    {
        return $this->filePath;
    }

    public function setFilePath(string $filePath): static
    {
        $this->filePath = $filePath;
        return $this;
    }

    public function getFileHash(): ?string
    {
        return $this->fileHash;
    }

    public function setFileHash(?string $fileHash): static
    {
        $this->fileHash = $fileHash;
        return $this;
    }

    public function getStatus(): ?string
    {
        return $this->status;
    }

    public function setStatus(string $status): static
    {
        $this->status = $status;
        
        if ($status === 'approved' || $status === 'rejected') {
            $this->verifiedAt = new \DateTime();
        }
        
        return $this;
    }

    public function getRejectionReason(): ?string
    {
        return $this->rejectionReason;
    }

    public function setRejectionReason(?string $rejectionReason): static
    {
        $this->rejectionReason = $rejectionReason;
        return $this;
    }

    public function getUploadedAt(): ?\DateTimeInterface
    {
        return $this->uploadedAt;
    }

    public function setUploadedAt(\DateTimeInterface $uploadedAt): static
    {
        $this->uploadedAt = $uploadedAt;
        return $this;
    }

    public function getVerifiedAt(): ?\DateTimeInterface
    {
        return $this->verifiedAt;
    }

    public function setVerifiedAt(?\DateTimeInterface $verifiedAt): static
    {
        $this->verifiedAt = $verifiedAt;
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

    public function getVerifiedBy(): ?string
    {
        return $this->verifiedBy;
    }

    public function setVerifiedBy(?string $verifiedBy): static
    {
        $this->verifiedBy = $verifiedBy;
        return $this;
    }

    public function getExpiresAt(): ?\DateTimeInterface
    {
        return $this->expiresAt;
    }

    public function setExpiresAt(?\DateTimeInterface $expiresAt): static
    {
        $this->expiresAt = $expiresAt;
        return $this;
    }

    #[Groups(['kyc_document:read', 'kyc_document:read:collection'])]
    public function isExpired(): bool
    {
        return $this->expiresAt && $this->expiresAt < new \DateTime();
    }

    #[Groups(['kyc_document:read', 'kyc_document:read:collection'])]
    public function getTypeName(): string
    {
        return match($this->type) {
            'identity_card' => 'Pièce d\'identité',
            'selfie' => 'Selfie avec pièce d\'identité',
            'proof_of_address' => 'Justificatif de domicile',
            'business_registration' => 'Extrait Kbis',
            'tax_certificate' => 'Attestation fiscale',
            'bank_statement' => 'Relevé bancaire',
            default => $this->type
        };
    }
}