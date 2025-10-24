<?php

namespace App\Service;

use App\Entity\Analytics;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;

class AnalyticsService
{
    public function __construct(
        private EntityManagerInterface $entityManager
    ) {}

    public function trackEvent(
        string $eventType,
        string $eventName,
        array $properties = [],
        ?User $user = null,
        ?Request $request = null,
        ?float $value = null,
        ?string $currency = 'EUR'
    ): Analytics {
        $analytics = new Analytics();
        $analytics->setEventType($eventType);
        $analytics->setEventName($eventName);
        $analytics->setProperties($properties);
        $analytics->setUser($user);
        
        if ($value !== null) {
            $analytics->setValue((string)$value);
            $analytics->setCurrency($currency);
        }
        
        if ($request) {
            $this->enrichWithRequestData($analytics, $request);
        }
        
        $this->entityManager->persist($analytics);
        $this->entityManager->flush();
        
        return $analytics;
    }

    public function trackPageView(string $page, ?User $user = null, ?Request $request = null): Analytics
    {
        return $this->trackEvent(
            'page_view',
            'Page View',
            ['page' => $page],
            $user,
            $request
        );
    }

    public function trackProductView(int $productId, ?User $user = null, ?Request $request = null): Analytics
    {
        return $this->trackEvent(
            'product_view',
            'Product View',
            ['product_id' => $productId],
            $user,
            $request
        );
    }

    public function trackAddToCart(int $productId, int $quantity, float $value, ?User $user = null, ?Request $request = null): Analytics
    {
        return $this->trackEvent(
            'add_to_cart',
            'Add to Cart',
            [
                'product_id' => $productId,
                'quantity' => $quantity
            ],
            $user,
            $request,
            $value
        );
    }

    public function trackPurchase(int $orderId, float $value, array $items = [], ?User $user = null, ?Request $request = null): Analytics
    {
        return $this->trackEvent(
            'purchase',
            'Purchase',
            [
                'order_id' => $orderId,
                'items' => $items
            ],
            $user,
            $request,
            $value
        );
    }

    public function trackFunnelStep(int $funnelId, int $stepId, string $action, ?User $user = null, ?Request $request = null): Analytics
    {
        return $this->trackEvent(
            'funnel_step',
            'Funnel Step',
            [
                'funnel_id' => $funnelId,
                'step_id' => $stepId,
                'action' => $action
            ],
            $user,
            $request
        );
    }

    public function trackLiveStreamView(int $streamId, ?User $user = null, ?Request $request = null): Analytics
    {
        return $this->trackEvent(
            'live_stream_view',
            'Live Stream View',
            ['stream_id' => $streamId],
            $user,
            $request
        );
    }

    public function getAnalyticsSummary(?User $user = null, string $period = 'month'): array
    {
        $qb = $this->entityManager->createQueryBuilder();
        
        $dateCondition = $this->getDateCondition($period);
        
        $query = $qb->select('a')
            ->from(Analytics::class, 'a')
            ->where($dateCondition);
        
        if ($user) {
            $query->andWhere('a.user = :user')
                  ->setParameter('user', $user);
        }
        
        $analytics = $query->getQuery()->getResult();
        
        return [
            'total_events' => count($analytics),
            'page_views' => $this->countEventsByType($analytics, 'page_view'),
            'product_views' => $this->countEventsByType($analytics, 'product_view'),
            'add_to_cart' => $this->countEventsByType($analytics, 'add_to_cart'),
            'purchases' => $this->countEventsByType($analytics, 'purchase'),
            'total_revenue' => $this->sumValuesByType($analytics, 'purchase'),
            'conversion_rate' => $this->calculateConversionRate($analytics),
            'top_pages' => $this->getTopPages($analytics),
            'top_products' => $this->getTopProducts($analytics),
            'traffic_sources' => $this->getTrafficSources($analytics),
            'device_breakdown' => $this->getDeviceBreakdown($analytics),
            'hourly_distribution' => $this->getHourlyDistribution($analytics)
        ];
    }

    public function getRealtimeAnalytics(?User $user = null): array
    {
        $qb = $this->entityManager->createQueryBuilder();
        
        $query = $qb->select('a')
            ->from(Analytics::class, 'a')
            ->where('a.createdAt >= :since')
            ->setParameter('since', new \DateTime('-1 hour'));
        
        if ($user) {
            $query->andWhere('a.user = :user')
                  ->setParameter('user', $user);
        }
        
        $analytics = $query->getQuery()->getResult();
        
        return [
            'active_users' => $this->countUniqueUsers($analytics),
            'page_views_last_hour' => $this->countEventsByType($analytics, 'page_view'),
            'current_live_streams' => $this->getCurrentLiveStreams(),
            'recent_purchases' => $this->getRecentPurchases($analytics),
            'top_pages_now' => $this->getTopPages($analytics)
        ];
    }

    private function enrichWithRequestData(Analytics $analytics, Request $request): void
    {
        // UTM parameters
        $analytics->setSource($request->query->get('utm_source'));
        $analytics->setMedium($request->query->get('utm_medium'));
        $analytics->setCampaign($request->query->get('utm_campaign'));
        
        // Request data
        $analytics->setIpAddress($request->getClientIp());
        $analytics->setUserAgent($request->headers->get('User-Agent'));
        $analytics->setReferrer($request->headers->get('Referer'));
        
        // Session
        if ($request->hasSession()) {
            $analytics->setSessionId($request->getSession()->getId());
        }
        
        // Parse user agent for device/browser info
        $this->parseUserAgent($analytics, $request->headers->get('User-Agent', ''));
        
        // Geo location (would integrate with IP geolocation service)
        $this->enrichWithGeoData($analytics, $request->getClientIp());
    }

    private function parseUserAgent(Analytics $analytics, string $userAgent): void
    {
        // Simple user agent parsing (in production, use a proper library)
        if (preg_match('/Mobile|Android|iPhone|iPad/', $userAgent)) {
            $analytics->setDevice('mobile');
        } elseif (preg_match('/Tablet/', $userAgent)) {
            $analytics->setDevice('tablet');
        } else {
            $analytics->setDevice('desktop');
        }
        
        if (preg_match('/Chrome/', $userAgent)) {
            $analytics->setBrowser('Chrome');
        } elseif (preg_match('/Firefox/', $userAgent)) {
            $analytics->setBrowser('Firefox');
        } elseif (preg_match('/Safari/', $userAgent)) {
            $analytics->setBrowser('Safari');
        } elseif (preg_match('/Edge/', $userAgent)) {
            $analytics->setBrowser('Edge');
        }
        
        if (preg_match('/Windows/', $userAgent)) {
            $analytics->setOs('Windows');
        } elseif (preg_match('/Mac OS/', $userAgent)) {
            $analytics->setOs('macOS');
        } elseif (preg_match('/Linux/', $userAgent)) {
            $analytics->setOs('Linux');
        } elseif (preg_match('/Android/', $userAgent)) {
            $analytics->setOs('Android');
        } elseif (preg_match('/iOS/', $userAgent)) {
            $analytics->setOs('iOS');
        }
    }

    private function enrichWithGeoData(Analytics $analytics, ?string $ip): void
    {
        // In production, integrate with IP geolocation service
        // For now, set default values
        $analytics->setCountry('FR');
        $analytics->setCity('Paris');
    }

    private function getDateCondition(string $period): string
    {
        return match($period) {
            'day' => 'a.createdAt >= :since',
            'week' => 'a.createdAt >= :since',
            'month' => 'a.createdAt >= :since',
            'year' => 'a.createdAt >= :since',
            default => 'a.createdAt >= :since'
        };
    }

    private function countEventsByType(array $analytics, string $type): int
    {
        return count(array_filter($analytics, fn($a) => $a->getEventType() === $type));
    }

    private function sumValuesByType(array $analytics, string $type): float
    {
        $total = 0;
        foreach ($analytics as $analytic) {
            if ($analytic->getEventType() === $type && $analytic->getValue()) {
                $total += (float)$analytic->getValue();
            }
        }
        return $total;
    }

    private function calculateConversionRate(array $analytics): float
    {
        $pageViews = $this->countEventsByType($analytics, 'page_view');
        $purchases = $this->countEventsByType($analytics, 'purchase');
        
        return $pageViews > 0 ? ($purchases / $pageViews) * 100 : 0;
    }

    private function getTopPages(array $analytics): array
    {
        $pages = [];
        foreach ($analytics as $analytic) {
            if ($analytic->getEventType() === 'page_view') {
                $page = $analytic->getProperty('page') ?? 'unknown';
                $pages[$page] = ($pages[$page] ?? 0) + 1;
            }
        }
        arsort($pages);
        return array_slice($pages, 0, 10, true);
    }

    private function getTopProducts(array $analytics): array
    {
        $products = [];
        foreach ($analytics as $analytic) {
            if ($analytic->getEventType() === 'product_view') {
                $productId = $analytic->getProperty('product_id');
                if ($productId) {
                    $products[$productId] = ($products[$productId] ?? 0) + 1;
                }
            }
        }
        arsort($products);
        return array_slice($products, 0, 10, true);
    }

    private function getTrafficSources(array $analytics): array
    {
        $sources = [];
        foreach ($analytics as $analytic) {
            $source = $analytic->getSource() ?? 'direct';
            $sources[$source] = ($sources[$source] ?? 0) + 1;
        }
        arsort($sources);
        return $sources;
    }

    private function getDeviceBreakdown(array $analytics): array
    {
        $devices = [];
        foreach ($analytics as $analytic) {
            $device = $analytic->getDevice() ?? 'unknown';
            $devices[$device] = ($devices[$device] ?? 0) + 1;
        }
        return $devices;
    }

    private function getHourlyDistribution(array $analytics): array
    {
        $hours = array_fill(0, 24, 0);
        foreach ($analytics as $analytic) {
            $hour = $analytic->getEventHour() ?? 0;
            $hours[$hour]++;
        }
        return $hours;
    }

    private function countUniqueUsers(array $analytics): int
    {
        $users = [];
        foreach ($analytics as $analytic) {
            if ($analytic->getUser()) {
                $users[$analytic->getUser()->getId()] = true;
            } elseif ($analytic->getSessionId()) {
                $users[$analytic->getSessionId()] = true;
            }
        }
        return count($users);
    }

    private function getCurrentLiveStreams(): int
    {
        return $this->entityManager->createQueryBuilder()
            ->select('COUNT(ls.id)')
            ->from('App\Entity\LiveStream', 'ls')
            ->where('ls.status = :status')
            ->setParameter('status', 'live')
            ->getQuery()
            ->getSingleScalarResult();
    }

    private function getRecentPurchases(array $analytics): array
    {
        $purchases = array_filter($analytics, fn($a) => $a->getEventType() === 'purchase');
        usort($purchases, fn($a, $b) => $b->getCreatedAt() <=> $a->getCreatedAt());
        return array_slice($purchases, 0, 5);
    }
}