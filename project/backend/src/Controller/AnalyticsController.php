<?php

namespace App\Controller;

use App\Service\AnalyticsService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/analytics')]
class AnalyticsController extends AbstractController
{
    public function __construct(
        private AnalyticsService $analyticsService
    ) {}

    #[Route('/track', name: 'api_analytics_track', methods: ['POST'])]
    public function trackEvent(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        
        $eventType = $data['eventType'] ?? null;
        $eventName = $data['eventName'] ?? null;
        $properties = $data['properties'] ?? [];
        $value = isset($data['value']) ? (float)$data['value'] : null;
        $currency = $data['currency'] ?? 'EUR';
        
        if (!$eventType || !$eventName) {
            return new JsonResponse(['error' => 'eventType and eventName are required'], 400);
        }
        
        try {
            $analytics = $this->analyticsService->trackEvent(
                $eventType,
                $eventName,
                $properties,
                $this->getUser(),
                $request,
                $value,
                $currency
            );
            
            return new JsonResponse([
                'message' => 'Event tracked successfully',
                'id' => $analytics->getId()
            ]);
            
        } catch (\Exception $e) {
            return new JsonResponse(['error' => $e->getMessage()], 500);
        }
    }

    #[Route('/summary', name: 'api_analytics_summary', methods: ['GET'])]
    public function getSummary(Request $request): JsonResponse
    {
        $period = $request->query->get('period', 'month');
        $user = $this->getUser();
        
        // Only allow users to see their own analytics unless admin
        if (!$this->isGranted('ROLE_ADMIN')) {
            $targetUser = $user;
        } else {
            $userId = $request->query->get('userId');
            $targetUser = $userId ? $this->entityManager->getRepository('App\Entity\User')->find($userId) : null;
        }
        
        try {
            $summary = $this->analyticsService->getAnalyticsSummary($targetUser, $period);
            
            return new JsonResponse([
                'period' => $period,
                'summary' => $summary
            ]);
            
        } catch (\Exception $e) {
            return new JsonResponse(['error' => $e->getMessage()], 500);
        }
    }

    #[Route('/realtime', name: 'api_analytics_realtime', methods: ['GET'])]
    public function getRealtimeAnalytics(Request $request): JsonResponse
    {
        $user = $this->getUser();
        
        // Only allow users to see their own analytics unless admin
        if (!$this->isGranted('ROLE_ADMIN')) {
            $targetUser = $user;
        } else {
            $userId = $request->query->get('userId');
            $targetUser = $userId ? $this->entityManager->getRepository('App\Entity\User')->find($userId) : null;
        }
        
        try {
            $realtime = $this->analyticsService->getRealtimeAnalytics($targetUser);
            
            return new JsonResponse([
                'realtime' => $realtime,
                'timestamp' => (new \DateTime())->format('c')
            ]);
            
        } catch (\Exception $e) {
            return new JsonResponse(['error' => $e->getMessage()], 500);
        }
    }

    #[Route('/page-view', name: 'api_analytics_page_view', methods: ['POST'])]
    public function trackPageView(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $page = $data['page'] ?? null;
        
        if (!$page) {
            return new JsonResponse(['error' => 'page is required'], 400);
        }
        
        try {
            $this->analyticsService->trackPageView($page, $this->getUser(), $request);
            
            return new JsonResponse(['message' => 'Page view tracked']);
            
        } catch (\Exception $e) {
            return new JsonResponse(['error' => $e->getMessage()], 500);
        }
    }

    #[Route('/product-view', name: 'api_analytics_product_view', methods: ['POST'])]
    public function trackProductView(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $productId = $data['productId'] ?? null;
        
        if (!$productId) {
            return new JsonResponse(['error' => 'productId is required'], 400);
        }
        
        try {
            $this->analyticsService->trackProductView($productId, $this->getUser(), $request);
            
            return new JsonResponse(['message' => 'Product view tracked']);
            
        } catch (\Exception $e) {
            return new JsonResponse(['error' => $e->getMessage()], 500);
        }
    }

    #[Route('/add-to-cart', name: 'api_analytics_add_to_cart', methods: ['POST'])]
    public function trackAddToCart(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $productId = $data['productId'] ?? null;
        $quantity = $data['quantity'] ?? 1;
        $value = $data['value'] ?? null;
        
        if (!$productId || !$value) {
            return new JsonResponse(['error' => 'productId and value are required'], 400);
        }
        
        try {
            $this->analyticsService->trackAddToCart(
                $productId,
                $quantity,
                (float)$value,
                $this->getUser(),
                $request
            );
            
            return new JsonResponse(['message' => 'Add to cart tracked']);
            
        } catch (\Exception $e) {
            return new JsonResponse(['error' => $e->getMessage()], 500);
        }
    }

    #[Route('/purchase', name: 'api_analytics_purchase', methods: ['POST'])]
    public function trackPurchase(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $orderId = $data['orderId'] ?? null;
        $value = $data['value'] ?? null;
        $items = $data['items'] ?? [];
        
        if (!$orderId || !$value) {
            return new JsonResponse(['error' => 'orderId and value are required'], 400);
        }
        
        try {
            $this->analyticsService->trackPurchase(
                $orderId,
                (float)$value,
                $items,
                $this->getUser(),
                $request
            );
            
            return new JsonResponse(['message' => 'Purchase tracked']);
            
        } catch (\Exception $e) {
            return new JsonResponse(['error' => $e->getMessage()], 500);
        }
    }

    #[Route('/funnel-step', name: 'api_analytics_funnel_step', methods: ['POST'])]
    public function trackFunnelStep(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $funnelId = $data['funnelId'] ?? null;
        $stepId = $data['stepId'] ?? null;
        $action = $data['action'] ?? 'view';
        
        if (!$funnelId || !$stepId) {
            return new JsonResponse(['error' => 'funnelId and stepId are required'], 400);
        }
        
        try {
            $this->analyticsService->trackFunnelStep(
                $funnelId,
                $stepId,
                $action,
                $this->getUser(),
                $request
            );
            
            return new JsonResponse(['message' => 'Funnel step tracked']);
            
        } catch (\Exception $e) {
            return new JsonResponse(['error' => $e->getMessage()], 500);
        }
    }

    #[Route('', name: 'analytics_dashboard', methods: ['GET'])]
    public function dashboard(): Response
    {
        // Exemple de données à remplacer par vos vraies données d'analytics
        $stats = [
            'visitors' => [
                'current' => 24573,
                'change' => 12.5,
                'change_positive' => true
            ],
            'orders' => [
                'current' => 1234,
                'change' => 8.2,
                'change_positive' => true
            ],
            'revenue' => [
                'current' => 45678.90,
                'change' => 15.3,
                'change_positive' => true
            ],
            'conversion' => [
                'current' => 3.2,
                'change' => -1.2,
                'change_positive' => false
            ]
        ];

        // Données pour le graphique
        $chartData = [
            'labels' => ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil'],
            'visitors' => [65, 59, 80, 81, 56, 55, 40],
            'orders' => [28, 48, 40, 19, 86, 27, 90]
        ];

        // Activité récente (exemple)
        $recentActivity = [];
        for ($i = 1; $i <= 5; $i++) {
            $recentActivity[] = [
                'id' => 1000 + $i,
                'user' => [
                    'name' => 'Utilisateur ' . $i,
                    'email' => 'user' . $i . '@example.com',
                    'initials' => 'U' . $i
                ],
                'action' => 'A effectué une commande',
                'date' => new \DateTime('now - ' . $i . ' hours'),
                'status' => 'Complété'
            ];
        }

        return $this->render('analytics/index.html.twig', [
            'stats' => $stats,
            'chartData' => $chartData,
            'recentActivity' => $recentActivity
        ]);
    }
}