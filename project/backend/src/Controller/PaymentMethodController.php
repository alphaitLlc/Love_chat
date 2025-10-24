<?php

namespace App\Controller;

use App\Entity\PaymentMethod;
use App\Service\PaymentService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/payment-methods')]
class PaymentMethodController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private PaymentService $paymentService
    ) {}

    #[Route('', name: 'api_payment_methods_list', methods: ['GET'])]
    public function getPaymentMethods(): JsonResponse
    {
        $user = $this->getUser();
        
        if (!$user) {
            return new JsonResponse(['error' => 'Unauthorized'], 401);
        }
        
        $paymentMethods = $this->entityManager->getRepository(PaymentMethod::class)->findByUser($user);
        
        $data = [];
        foreach ($paymentMethods as $method) {
            $data[] = [
                'id' => $method->getId(),
                'type' => $method->getType(),
                'provider' => $method->getProvider(),
                'displayName' => $method->getDisplayName(),
                'last4' => $method->getLast4(),
                'expiryMonth' => $method->getExpiryMonth(),
                'expiryYear' => $method->getExpiryYear(),
                'brand' => $method->getBrand(),
                'isDefault' => $method->isDefault(),
                'isExpired' => $method->isExpired(),
                'maskedNumber' => $method->getMaskedNumber(),
                'icon' => $method->getIcon(),
                'createdAt' => $method->getCreatedAt()->format('c')
            ];
        }
        
        return new JsonResponse(['paymentMethods' => $data]);
    }

    #[Route('/setup-intent', name: 'api_payment_setup_intent', methods: ['POST'])]
    public function createSetupIntent(): JsonResponse
    {
        $user = $this->getUser();
        
        if (!$user) {
            return new JsonResponse(['error' => 'Unauthorized'], 401);
        }
        
        try {
            $setupIntent = $this->paymentService->createSetupIntent($user);
            
            return new JsonResponse([
                'clientSecret' => $setupIntent['client_secret']
            ]);
            
        } catch (\Exception $e) {
            return new JsonResponse(['error' => $e->getMessage()], 500);
        }
    }

    #[Route('', name: 'api_payment_method_create', methods: ['POST'])]
    public function createPaymentMethod(Request $request): JsonResponse
    {
        $user = $this->getUser();
        
        if (!$user) {
            return new JsonResponse(['error' => 'Unauthorized'], 401);
        }
        
        $data = json_decode($request->getContent(), true);
        $paymentMethodId = $data['paymentMethodId'] ?? null;
        $makeDefault = $data['makeDefault'] ?? false;
        
        if (!$paymentMethodId) {
            return new JsonResponse(['error' => 'Payment method ID is required'], 400);
        }
        
        try {
            $paymentMethod = $this->paymentService->attachPaymentMethod($user, $paymentMethodId, $makeDefault);
            
            return new JsonResponse([
                'message' => 'Payment method added successfully',
                'paymentMethod' => [
                    'id' => $paymentMethod->getId(),
                    'type' => $paymentMethod->getType(),
                    'provider' => $paymentMethod->getProvider(),
                    'displayName' => $paymentMethod->getDisplayName(),
                    'last4' => $paymentMethod->getLast4(),
                    'brand' => $paymentMethod->getBrand(),
                    'isDefault' => $paymentMethod->isDefault()
                ]
            ]);
            
        } catch (\Exception $e) {
            return new JsonResponse(['error' => $e->getMessage()], 500);
        }
    }

    #[Route('/{id}/default', name: 'api_payment_method_set_default', methods: ['PUT'])]
    public function setDefaultPaymentMethod(PaymentMethod $paymentMethod): JsonResponse
    {
        $user = $this->getUser();
        
        if (!$user) {
            return new JsonResponse(['error' => 'Unauthorized'], 401);
        }
        
        if ($paymentMethod->getUser() !== $user) {
            return new JsonResponse(['error' => 'Unauthorized'], 403);
        }
        
        try {
            // Clear default flag on all other payment methods
            $userPaymentMethods = $this->entityManager->getRepository(PaymentMethod::class)->findByUser($user);
            foreach ($userPaymentMethods as $method) {
                $method->setIsDefault(false);
            }
            
            // Set this payment method as default
            $paymentMethod->setIsDefault(true);
            $this->entityManager->flush();
            
            return new JsonResponse(['message' => 'Default payment method updated']);
            
        } catch (\Exception $e) {
            return new JsonResponse(['error' => $e->getMessage()], 500);
        }
    }

    #[Route('/{id}', name: 'api_payment_method_delete', methods: ['DELETE'])]
    public function deletePaymentMethod(PaymentMethod $paymentMethod): JsonResponse
    {
        $user = $this->getUser();
        
        if (!$user) {
            return new JsonResponse(['error' => 'Unauthorized'], 401);
        }
        
        if ($paymentMethod->getUser() !== $user) {
            return new JsonResponse(['error' => 'Unauthorized'], 403);
        }
        
        try {
            // If this is the default payment method, find another one to make default
            if ($paymentMethod->isDefault()) {
                $otherPaymentMethod = $this->entityManager->getRepository(PaymentMethod::class)
                    ->createQueryBuilder('pm')
                    ->where('pm.user = :user')
                    ->andWhere('pm.id != :id')
                    ->andWhere('pm.isActive = :active')
                    ->setParameter('user', $user)
                    ->setParameter('id', $paymentMethod->getId())
                    ->setParameter('active', true)
                    ->setMaxResults(1)
                    ->getQuery()
                    ->getOneOrNullResult();
                
                if ($otherPaymentMethod) {
                    $otherPaymentMethod->setIsDefault(true);
                }
            }
            
            // Detach from Stripe if needed
            if ($paymentMethod->getExternalId()) {
                $this->paymentService->detachPaymentMethod($paymentMethod->getExternalId());
            }
            
            // Remove from database
            $this->entityManager->remove($paymentMethod);
            $this->entityManager->flush();
            
            return new JsonResponse(['message' => 'Payment method deleted']);
            
        } catch (\Exception $e) {
            return new JsonResponse(['error' => $e->getMessage()], 500);
        }
    }

    #[Route('/validate-card', name: 'api_payment_validate_card', methods: ['POST'])]
    public function validateCard(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $cardNumber = $data['cardNumber'] ?? null;
        $expiryMonth = $data['expiryMonth'] ?? null;
        $expiryYear = $data['expiryYear'] ?? null;
        $cvc = $data['cvc'] ?? null;
        
        if (!$cardNumber || !$expiryMonth || !$expiryYear || !$cvc) {
            return new JsonResponse(['error' => 'All card details are required'], 400);
        }
        
        try {
            $validation = $this->paymentService->validateCardDetails($cardNumber, $expiryMonth, $expiryYear, $cvc);
            
            return new JsonResponse([
                'valid' => $validation['valid'],
                'brand' => $validation['brand'],
                'errors' => $validation['errors']
            ]);
            
        } catch (\Exception $e) {
            return new JsonResponse(['error' => $e->getMessage()], 500);
        }
    }

    #[Route('/mobile-money-providers', name: 'api_payment_mobile_money_providers', methods: ['GET'])]
    public function getMobileMoneyProviders(): JsonResponse
    {
        $providers = [
            [
                'code' => 'orange_money',
                'name' => 'Orange Money',
                'countries' => ['CI', 'SN', 'ML', 'BF', 'GN', 'NE', 'CM', 'CD', 'MG', 'EG'],
                'logo' => 'https://cdn.linkmarket.com/payment/orange_money.png'
            ],
            [
                'code' => 'mtn_mobile_money',
                'name' => 'MTN Mobile Money',
                'countries' => ['GH', 'UG', 'RW', 'ZA', 'CM', 'CI', 'BJ', 'ZM', 'CD'],
                'logo' => 'https://cdn.linkmarket.com/payment/mtn_money.png'
            ],
            [
                'code' => 'moov_money',
                'name' => 'Moov Money',
                'countries' => ['CI', 'BJ', 'TG', 'NE', 'ML', 'BF'],
                'logo' => 'https://cdn.linkmarket.com/payment/moov_money.png'
            ],
            [
                'code' => 'wave',
                'name' => 'Wave',
                'countries' => ['SN', 'CI'],
                'logo' => 'https://cdn.linkmarket.com/payment/wave.png'
            ]
        ];
        
        return new JsonResponse(['providers' => $providers]);
    }

    #[Route('/bank-transfer-info', name: 'api_payment_bank_transfer_info', methods: ['GET'])]
    public function getBankTransferInfo(): JsonResponse
    {
        $bankInfo = [
            'accountName' => 'LinkMarket SAS',
            'iban' => 'FR76 3000 4000 0400 0012 3456 789',
            'bic' => 'BNPAFRPPXXX',
            'bankName' => 'BNP Paribas',
            'reference' => 'LM-' . $this->getUser()->getId(),
            'instructions' => 'Please include your reference number in the transfer details to ensure proper allocation of your payment.'
        ];
        
        return new JsonResponse(['bankInfo' => $bankInfo]);
    }
}