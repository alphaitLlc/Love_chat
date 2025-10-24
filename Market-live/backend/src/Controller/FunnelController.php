<?php

namespace App\Controller;

use App\Entity\SalesFunnel;
use App\Entity\FunnelStep;
use App\Service\AnalyticsService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/funnels')]
class FunnelController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private AnalyticsService $analyticsService
    ) {}

    #[Route('/view/{slug}', name: 'api_funnel_view', methods: ['GET'])]
    public function viewFunnelStep(string $slug, Request $request): JsonResponse
    {
        $step = $this->entityManager->getRepository(FunnelStep::class)->findBySlug($slug);
        
        if (!$step) {
            return new JsonResponse(['error' => 'Funnel step not found'], 404);
        }
        
        $funnel = $step->getFunnel();
        
        if ($funnel->getStatus() !== 'active') {
            return new JsonResponse(['error' => 'Funnel is not active'], 400);
        }
        
        // Track step view
        $this->analyticsService->trackFunnelStep(
            $funnel->getId(),
            $step->getId(),
            'view',
            $this->getUser(),
            $request
        );
        
        // Increment visitor count
        $step->setVisitors($step->getVisitors() + 1);
        $funnel->setTotalVisitors($funnel->getTotalVisitors() + 1);
        $this->entityManager->flush();
        
        // Return step content
        return new JsonResponse([
            'step' => [
                'id' => $step->getId(),
                'type' => $step->getType(),
                'name' => $step->getName(),
                'content' => $step->getContent(),
                'settings' => $step->getSettings()
            ],
            'funnel' => [
                'id' => $funnel->getId(),
                'name' => $funnel->getName()
            ]
        ]);
    }

    #[Route('/convert/{slug}', name: 'api_funnel_convert', methods: ['POST'])]
    public function convertFunnelStep(string $slug, Request $request): JsonResponse
    {
        $step = $this->entityManager->getRepository(FunnelStep::class)->findBySlug($slug);
        
        if (!$step) {
            return new JsonResponse(['error' => 'Funnel step not found'], 404);
        }
        
        $funnel = $step->getFunnel();
        $data = json_decode($request->getContent(), true);
        $action = $data['action'] ?? 'convert';
        $value = $data['value'] ?? null;
        
        // Track conversion
        $this->analyticsService->trackFunnelStep(
            $funnel->getId(),
            $step->getId(),
            $action,
            $this->getUser(),
            $request,
            $value
        );
        
        // Increment conversion count
        $step->setConversions($step->getConversions() + 1);
        
        // Update revenue if provided
        if ($value !== null) {
            $currentRevenue = (float)$step->getRevenue();
            $step->setRevenue((string)($currentRevenue + $value));
            
            $funnelRevenue = (float)$funnel->getTotalRevenue();
            $funnel->setTotalRevenue((string)($funnelRevenue + $value));
        }
        
        // If this is the last step, increment funnel conversions
        $nextStep = $this->entityManager->getRepository(FunnelStep::class)->findNextStep($step);
        if (!$nextStep) {
            $funnel->setTotalConversions($funnel->getTotalConversions() + 1);
        }
        
        $this->entityManager->flush();
        
        // Determine next step
        $nextStepData = null;
        
        if ($action === 'convert' && $nextStep) {
            $nextStepData = [
                'id' => $nextStep->getId(),
                'slug' => $nextStep->getSlug(),
                'type' => $nextStep->getType()
            ];
        } elseif ($action === 'alternative' && $step->getAlternativeStepId()) {
            $alternativeStep = $this->entityManager->getRepository(FunnelStep::class)->find($step->getAlternativeStepId());
            if ($alternativeStep) {
                $nextStepData = [
                    'id' => $alternativeStep->getId(),
                    'slug' => $alternativeStep->getSlug(),
                    'type' => $alternativeStep->getType()
                ];
            }
        }
        
        return new JsonResponse([
            'success' => true,
            'nextStep' => $nextStepData
        ]);
    }

    #[Route('/analytics/{id}', name: 'api_funnel_analytics', methods: ['GET'])]
    public function getFunnelAnalytics(SalesFunnel $funnel): JsonResponse
    {
        $user = $this->getUser();
        
        if ($funnel->getOwner() !== $user && !$this->isGranted('ROLE_ADMIN')) {
            return new JsonResponse(['error' => 'Unauthorized'], 403);
        }
        
        $steps = $this->entityManager->getRepository(FunnelStep::class)->findByFunnel($funnel);
        
        $stepData = [];
        foreach ($steps as $step) {
            $stepData[] = [
                'id' => $step->getId(),
                'name' => $step->getName(),
                'type' => $step->getType(),
                'visitors' => $step->getVisitors(),
                'conversions' => $step->getConversions(),
                'conversionRate' => $step->getConversionRate(),
                'dropOffRate' => $step->getDropOffRate(),
                'revenue' => $step->getRevenue()
            ];
        }
        
        $conversionRates = $this->entityManager->getRepository(FunnelStep::class)->getStepConversionRates($funnel);
        
        return new JsonResponse([
            'funnel' => [
                'id' => $funnel->getId(),
                'name' => $funnel->getName(),
                'status' => $funnel->getStatus(),
                'totalVisitors' => $funnel->getTotalVisitors(),
                'totalConversions' => $funnel->getTotalConversions(),
                'conversionRate' => $funnel->getConversionRate(),
                'totalRevenue' => $funnel->getTotalRevenue(),
                'averageOrderValue' => $funnel->getAverageOrderValue(),
                'createdAt' => $funnel->getCreatedAt()->format('c'),
                'updatedAt' => $funnel->getUpdatedAt()->format('c'),
                'publishedAt' => $funnel->getPublishedAt()?->format('c')
            ],
            'steps' => $stepData,
            'stepConversionRates' => $conversionRates
        ]);
    }

    #[Route('/duplicate/{id}', name: 'api_funnel_duplicate', methods: ['POST'])]
    public function duplicateFunnel(SalesFunnel $funnel): JsonResponse
    {
        $user = $this->getUser();
        
        if ($funnel->getOwner() !== $user && !$this->isGranted('ROLE_ADMIN')) {
            return new JsonResponse(['error' => 'Unauthorized'], 403);
        }
        
        try {
            // Create new funnel
            $newFunnel = new SalesFunnel();
            $newFunnel->setName($funnel->getName() . ' (Copy)');
            $newFunnel->setDescription($funnel->getDescription());
            $newFunnel->setOwner($user);
            $newFunnel->setStatus('draft');
            $newFunnel->setSettings($funnel->getSettings());
            $newFunnel->setTargetAudience($funnel->getTargetAudience());
            $newFunnel->setIntegrations($funnel->getIntegrations());
            
            $this->entityManager->persist($newFunnel);
            
            // Duplicate steps
            $steps = $this->entityManager->getRepository(FunnelStep::class)->findByFunnel($funnel);
            $stepMap = []; // Map old step IDs to new step IDs
            
            foreach ($steps as $step) {
                $newStep = new FunnelStep();
                $newStep->setFunnel($newFunnel);
                $newStep->setType($step->getType());
                $newStep->setName($step->getName());
                $newStep->setDescription($step->getDescription());
                $newStep->setSortOrder($step->getSortOrder());
                $newStep->setContent($step->getContent());
                $newStep->setSettings($step->getSettings());
                $newStep->setIsActive(true);
                
                $this->entityManager->persist($newStep);
                $stepMap[$step->getId()] = $newStep;
            }
            
            $this->entityManager->flush();
            
            // Update step relationships
            foreach ($steps as $step) {
                $newStep = $stepMap[$step->getId()];
                
                if ($step->getNextStepId() && isset($stepMap[$step->getNextStepId()])) {
                    $newStep->setNextStepId($stepMap[$step->getNextStepId()]->getId());
                }
                
                if ($step->getAlternativeStepId() && isset($stepMap[$step->getAlternativeStepId()])) {
                    $newStep->setAlternativeStepId($stepMap[$step->getAlternativeStepId()]->getId());
                }
            }
            
            $this->entityManager->flush();
            
            return new JsonResponse([
                'message' => 'Funnel duplicated successfully',
                'funnel' => [
                    'id' => $newFunnel->getId(),
                    'name' => $newFunnel->getName(),
                    'status' => $newFunnel->getStatus(),
                    'stepCount' => $newFunnel->getStepCount()
                ]
            ]);
            
        } catch (\Exception $e) {
            return new JsonResponse(['error' => $e->getMessage()], 500);
        }
    }

    #[Route('/reorder-steps/{id}', name: 'api_funnel_reorder_steps', methods: ['PUT'])]
    public function reorderSteps(SalesFunnel $funnel, Request $request): JsonResponse
    {
        $user = $this->getUser();
        
        if ($funnel->getOwner() !== $user && !$this->isGranted('ROLE_ADMIN')) {
            return new JsonResponse(['error' => 'Unauthorized'], 403);
        }
        
        $data = json_decode($request->getContent(), true);
        $stepOrder = $data['stepOrder'] ?? [];
        
        if (empty($stepOrder)) {
            return new JsonResponse(['error' => 'Step order is required'], 400);
        }
        
        try {
            foreach ($stepOrder as $index => $stepId) {
                $step = $this->entityManager->getRepository(FunnelStep::class)->find($stepId);
                
                if ($step && $step->getFunnel() === $funnel) {
                    $step->setSortOrder($index);
                }
            }
            
            $this->entityManager->flush();
            
            return new JsonResponse(['message' => 'Steps reordered successfully']);
            
        } catch (\Exception $e) {
            return new JsonResponse(['error' => $e->getMessage()], 500);
        }
    }

    #[Route('/publish/{id}', name: 'api_funnel_publish', methods: ['PUT'])]
    public function publishFunnel(SalesFunnel $funnel): JsonResponse
    {
        $user = $this->getUser();
        
        if ($funnel->getOwner() !== $user && !$this->isGranted('ROLE_ADMIN')) {
            return new JsonResponse(['error' => 'Unauthorized'], 403);
        }
        
        try {
            $funnel->setStatus('active');
            $funnel->setPublishedAt(new \DateTime());
            $this->entityManager->flush();
            
            return new JsonResponse([
                'message' => 'Funnel published successfully',
                'funnel' => [
                    'id' => $funnel->getId(),
                    'status' => $funnel->getStatus(),
                    'publishedAt' => $funnel->getPublishedAt()->format('c')
                ]
            ]);
            
        } catch (\Exception $e) {
            return new JsonResponse(['error' => $e->getMessage()], 500);
        }
    }

    #[Route('/pause/{id}', name: 'api_funnel_pause', methods: ['PUT'])]
    public function pauseFunnel(SalesFunnel $funnel): JsonResponse
    {
        $user = $this->getUser();
        
        if ($funnel->getOwner() !== $user && !$this->isGranted('ROLE_ADMIN')) {
            return new JsonResponse(['error' => 'Unauthorized'], 403);
        }
        
        try {
            $funnel->setStatus('paused');
            $this->entityManager->flush();
            
            return new JsonResponse([
                'message' => 'Funnel paused successfully',
                'funnel' => [
                    'id' => $funnel->getId(),
                    'status' => $funnel->getStatus()
                ]
            ]);
            
        } catch (\Exception $e) {
            return new JsonResponse(['error' => $e->getMessage()], 500);
        }
    }
}