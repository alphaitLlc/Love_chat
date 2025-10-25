<?php

namespace App\Service;

use App\Entity\User;
use App\Entity\KYCDocument;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\String\Slugger\SluggerInterface;

class KYCService
{
    private string $targetDirectory;

    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly SluggerInterface $slugger,
        private readonly NotificationService $notificationService,
        private readonly string $kycDirectory
    ) {
        $this->targetDirectory = $kycDirectory;

        if (!is_dir($this->targetDirectory)) {
            mkdir($this->targetDirectory, 0755, true);
        }
    }

    public function uploadDocument(User $user, string $type, UploadedFile $file): KYCDocument
    {
        // Check if document of this type already exists
        $existingDocument = $this->entityManager->getRepository(KYCDocument::class)
            ->findOneBy(['user' => $user, 'type' => $type]);
        
        if ($existingDocument) {
            // Update existing document
            $document = $existingDocument;
            $document->setStatus('pending');
            $document->setRejectionReason(null);
            $document->setVerifiedAt(null);
            $document->setVerifiedBy(null);
            
            // Remove old file if it exists
            $oldFilePath = $document->getFilePath();
            if ($oldFilePath && file_exists($this->targetDirectory . '/' . $oldFilePath)) {
                unlink($this->targetDirectory . '/' . $oldFilePath);
            }
        } else {
            // Create new document
            $document = new KYCDocument();
            $document->setUser($user);
            $document->setType($type);
        }
        
        // Generate unique filename
        $originalFilename = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
        $safeFilename = $this->slugger->slug($originalFilename);
        $newFilename = $user->getId() . '_' . $type . '_' . $safeFilename . '_' . uniqid() . '.' . $file->guessExtension();
        
        // Move file to target directory
        $file->move($this->targetDirectory, $newFilename);
        
        // Generate file hash for integrity verification
        $fileHash = hash_file('sha256', $this->targetDirectory . '/' . $newFilename);
        
        // Update document properties
        $document->setFilePath($newFilename);
        $document->setFileHash($fileHash);
        $document->setUploadedAt(new \DateTime());
        $document->setMetadata([
            'originalName' => $file->getClientOriginalName(),
            'mimeType' => $file->getMimeType(),
            'size' => $file->getSize()
        ]);
        
        // Set expiry date (1 year for most documents)
        $expiryDate = new \DateTime();
        $expiryDate->modify('+1 year');
        $document->setExpiresAt($expiryDate);
        
        // Save to database
        $this->entityManager->persist($document);
        $this->entityManager->flush();
        
        return $document;
    }

    public function submitKYCForVerification(User $user): void
    {
        // Update user KYC status
        $user->setKycStatus('in_progress');
        
        // Send notification to admin
        // In a real implementation, this would notify the KYC team
        
        // Send confirmation to user
        $this->notificationService->sendSystemNotification(
            $user,
            'Vérification KYC en cours',
            'Vos documents ont été soumis pour vérification. Nous vous informerons dès que le processus sera terminé.',
            null,
            'medium'
        );
        
        $this->entityManager->flush();
    }

    public function verifyDocument(KYCDocument $document, string $status, ?string $rejectionReason = null, ?string $verifiedBy = null): void
    {
        $document->setStatus($status);
        
        if ($status === 'rejected') {
            $document->setRejectionReason($rejectionReason);
        }
        
        $document->setVerifiedAt(new \DateTime());
        $document->setVerifiedBy($verifiedBy);
        
        $this->entityManager->flush();
        
        // Update user KYC status if all documents are verified
        $this->updateUserKYCStatus($document->getUser());
        
        // Send notification to user
        $this->notifyUser($document);
    }

    public function updateUserKYCStatus(User $user): void
    {
        $documents = $this->entityManager->getRepository(KYCDocument::class)->findBy(['user' => $user]);
        
        if (empty($documents)) {
            return;
        }
        
        $allApproved = true;
        $anyRejected = false;
        
        foreach ($documents as $document) {
            if ($document->getStatus() === 'pending') {
                $allApproved = false;
            } elseif ($document->getStatus() === 'rejected') {
                $anyRejected = true;
                $allApproved = false;
            }
        }
        
        if ($allApproved) {
            $user->setKycStatus('verified');
            $user->setIsVerified(true);
            
            // Add verified badge
            $badges = $user->getBadges() ?? [];
            if (!in_array('Verified', $badges)) {
                $badges[] = 'Verified';
                $user->setBadges($badges);
            }
            
            $this->notificationService->sendSystemNotification(
                $user,
                'Vérification KYC réussie',
                'Félicitations ! Votre vérification KYC est terminée avec succès. Votre compte est maintenant entièrement vérifié.',
                null,
                'high'
            );
        } elseif ($anyRejected) {
            $user->setKycStatus('rejected');
            
            $this->notificationService->sendSystemNotification(
                $user,
                'Vérification KYC échouée',
                'Certains de vos documents ont été rejetés. Veuillez les vérifier et les soumettre à nouveau.',
                '/kyc',
                'high'
            );
        }
        
        $this->entityManager->flush();
    }

    private function notifyUser(KYCDocument $document): void
    {
        $user = $document->getUser();
        $documentName = $document->getTypeName();
        
        if ($document->getStatus() === 'approved') {
            $this->notificationService->sendSystemNotification(
                $user,
                'Document approuvé',
                "Votre document '{$documentName}' a été approuvé.",
                '/kyc',
                'medium'
            );
        } elseif ($document->getStatus() === 'rejected') {
            $this->notificationService->sendSystemNotification(
                $user,
                'Document rejeté',
                "Votre document '{$documentName}' a été rejeté. Raison : {$document->getRejectionReason()}",
                '/kyc',
                'high'
            );
        }
    }

    public function getDocumentFile(KYCDocument $document): ?string
    {
        $filePath = $this->targetDirectory . '/' . $document->getFilePath();
        
        if (!file_exists($filePath)) {
            return null;
        }
        
        // Verify file integrity
        $currentHash = hash_file('sha256', $filePath);
        if ($currentHash !== $document->getFileHash()) {
            // File has been tampered with
            return null;
        }
        
        return $filePath;
    }

    public function checkDocumentExpiry(): void
    {
        $now = new \DateTime();
        
        $expiredDocuments = $this->entityManager->getRepository(KYCDocument::class)
            ->createQueryBuilder('d')
            ->where('d.expiresAt < :now')
            ->andWhere('d.status = :status')
            ->setParameter('now', $now)
            ->setParameter('status', 'approved')
            ->getQuery()
            ->getResult();
        
        foreach ($expiredDocuments as $document) {
            $user = $document->getUser();
            
            $this->notificationService->sendSystemNotification(
                $user,
                'Document expiré',
                "Votre document '{$document->getTypeName()}' a expiré. Veuillez le mettre à jour pour maintenir votre statut vérifié.",
                '/kyc',
                'high'
            );
            
            // Update user KYC status if necessary
            if ($user->getKycStatus() === 'verified') {
                $user->setKycStatus('expired');
                $this->entityManager->flush();
            }
        }
    }
}