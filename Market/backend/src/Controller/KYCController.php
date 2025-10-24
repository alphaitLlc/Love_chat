<?php

namespace App\Controller;

use App\Entity\User;
use App\Entity\KYCDocument;
use App\Service\KYCService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/kyc')]
class KYCController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private KYCService $kycService
    ) {}

    #[Route('/status', name: 'api_kyc_status', methods: ['GET'])]
    public function getKYCStatus(): JsonResponse
    {
        $user = $this->getUser();
        
        if (!$user) {
            return new JsonResponse(['error' => 'Unauthorized'], 401);
        }
        
        $documents = $this->entityManager->getRepository(KYCDocument::class)->findBy(['user' => $user]);
        
        $documentStatus = [];
        foreach ($documents as $document) {
            $documentStatus[] = [
                'id' => $document->getId(),
                'type' => $document->getType(),
                'status' => $document->getStatus(),
                'uploadedAt' => $document->getUploadedAt()->format('c'),
                'verifiedAt' => $document->getVerifiedAt()?->format('c'),
                'rejectionReason' => $document->getRejectionReason()
            ];
        }
        
        return new JsonResponse([
            'status' => $user->getKycStatus(),
            'documents' => $documentStatus,
            'requiredDocuments' => $this->getRequiredDocuments($user->getRole()),
            'canSubmit' => $this->canSubmitKYC($user)
        ]);
    }

    #[Route('/upload', name: 'api_kyc_upload', methods: ['POST'])]
    public function uploadDocument(Request $request): JsonResponse
    {
        $user = $this->getUser();
        
        if (!$user) {
            return new JsonResponse(['error' => 'Unauthorized'], 401);
        }
        
        if (!$this->canSubmitKYC($user)) {
            return new JsonResponse(['error' => 'KYC already completed or in progress'], 400);
        }
        
        $type = $request->request->get('type');
        $file = $request->files->get('document');
        
        if (!$type || !$file) {
            return new JsonResponse(['error' => 'Type and document file are required'], 400);
        }
        
        if (!in_array($type, $this->getRequiredDocuments($user->getRole()))) {
            return new JsonResponse(['error' => 'Invalid document type'], 400);
        }
        
        try {
            $document = $this->kycService->uploadDocument($user, $type, $file);
            
            return new JsonResponse([
                'message' => 'Document uploaded successfully',
                'document' => [
                    'id' => $document->getId(),
                    'type' => $document->getType(),
                    'status' => $document->getStatus(),
                    'uploadedAt' => $document->getUploadedAt()->format('c')
                ]
            ]);
            
        } catch (\Exception $e) {
            return new JsonResponse(['error' => $e->getMessage()], 500);
        }
    }

    #[Route('/submit', name: 'api_kyc_submit', methods: ['POST'])]
    public function submitKYC(): JsonResponse
    {
        $user = $this->getUser();
        
        if (!$user) {
            return new JsonResponse(['error' => 'Unauthorized'], 401);
        }
        
        $documents = $this->entityManager->getRepository(KYCDocument::class)->findBy(['user' => $user]);
        $requiredDocuments = $this->getRequiredDocuments($user->getRole());
        
        $uploadedTypes = array_map(fn($doc) => $doc->getType(), $documents);
        $missingTypes = array_diff($requiredDocuments, $uploadedTypes);
        
        if (!empty($missingTypes)) {
            return new JsonResponse([
                'error' => 'Missing required documents',
                'missingDocuments' => $missingTypes
            ], 400);
        }
        
        try {
            $this->kycService->submitKYCForVerification($user);
            
            return new JsonResponse([
                'message' => 'KYC submitted for verification',
                'status' => $user->getKycStatus()
            ]);
            
        } catch (\Exception $e) {
            return new JsonResponse(['error' => $e->getMessage()], 500);
        }
    }

    #[Route('/requirements', name: 'api_kyc_requirements', methods: ['GET'])]
    public function getKYCRequirements(): JsonResponse
    {
        $user = $this->getUser();
        
        if (!$user) {
            return new JsonResponse(['error' => 'Unauthorized'], 401);
        }
        
        $requirements = [
            'client' => [
                'required' => $this->getRequiredDocuments('client'),
                'description' => 'Vérification basique pour les clients'
            ],
            'vendor' => [
                'required' => $this->getRequiredDocuments('vendor'),
                'description' => 'Vérification complète pour les vendeurs'
            ],
            'supplier' => [
                'required' => $this->getRequiredDocuments('supplier'),
                'description' => 'Vérification avancée pour les fournisseurs'
            ]
        ];
        
        return new JsonResponse([
            'requirements' => $requirements,
            'userRole' => $user->getRole(),
            'documentTypes' => $this->getDocumentTypeDescriptions()
        ]);
    }

    private function getRequiredDocuments(string $role): array
    {
        return match($role) {
            'client' => ['identity_card', 'selfie'],
            'vendor' => ['identity_card', 'selfie', 'proof_of_address', 'business_registration'],
            'supplier' => ['identity_card', 'selfie', 'proof_of_address', 'business_registration', 'tax_certificate', 'bank_statement'],
            default => ['identity_card', 'selfie']
        };
    }

    private function canSubmitKYC(User $user): bool
    {
        return $user->getKycStatus() !== 'verified' && $user->getKycStatus() !== 'in_progress';
    }

    private function getDocumentTypeDescriptions(): array
    {
        return [
            'identity_card' => [
                'name' => 'Pièce d\'identité',
                'description' => 'Carte d\'identité, passeport ou permis de conduire',
                'formats' => 'JPG, PNG, PDF',
                'maxSize' => '5MB'
            ],
            'selfie' => [
                'name' => 'Selfie avec pièce d\'identité',
                'description' => 'Photo de vous tenant votre pièce d\'identité',
                'formats' => 'JPG, PNG',
                'maxSize' => '5MB'
            ],
            'proof_of_address' => [
                'name' => 'Justificatif de domicile',
                'description' => 'Facture d\'électricité, eau, gaz ou téléphone de moins de 3 mois',
                'formats' => 'JPG, PNG, PDF',
                'maxSize' => '5MB'
            ],
            'business_registration' => [
                'name' => 'Extrait Kbis',
                'description' => 'Document officiel d\'immatriculation de l\'entreprise de moins de 3 mois',
                'formats' => 'JPG, PNG, PDF',
                'maxSize' => '5MB'
            ],
            'tax_certificate' => [
                'name' => 'Attestation fiscale',
                'description' => 'Attestation de régularité fiscale de moins de 3 mois',
                'formats' => 'JPG, PNG, PDF',
                'maxSize' => '5MB'
            ],
            'bank_statement' => [
                'name' => 'Relevé bancaire',
                'description' => 'Relevé bancaire professionnel de moins de 3 mois',
                'formats' => 'JPG, PNG, PDF',
                'maxSize' => '5MB'
            ]
        ];
    }
}