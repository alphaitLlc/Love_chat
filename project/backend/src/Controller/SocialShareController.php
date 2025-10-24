<?php

namespace App\Controller;

use App\Entity\Product;
use App\Entity\SocialShare;
use App\Service\AnalyticsService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;

#[Route('/api/social-share')]
class SocialShareController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private UrlGeneratorInterface $urlGenerator,
        private AnalyticsService $analyticsService
    ) {}

    #[Route('/product/{id}', name: 'api_social_share_product', methods: ['GET'])]
    public function getProductShareLinks(Product $product): JsonResponse
    {
        $user = $this->getUser();
        
        // Generate base URL for product
        $baseUrl = $this->generateUrl('app_product_show', ['id' => $product->getId()], UrlGeneratorInterface::ABSOLUTE_URL);
        
        // Add UTM parameters if user is logged in
        if ($user) {
            $baseUrl = $this->addUtmParameters($baseUrl, [
                'source' => 'user_share',
                'medium' => 'social',
                'campaign' => 'product_share',
                'content' => $user->getId()
            ]);
        }
        
        // Generate share links for different platforms
        $shareLinks = [
            'facebook' => $this->generateFacebookShareLink($baseUrl, $product->getTitle()),
            'twitter' => $this->generateTwitterShareLink($baseUrl, $product->getTitle()),
            'whatsapp' => $this->generateWhatsAppShareLink($baseUrl, $product->getTitle()),
            'telegram' => $this->generateTelegramShareLink($baseUrl, $product->getTitle()),
            'email' => $this->generateEmailShareLink($baseUrl, $product->getTitle(), $product->getDescription()),
            'linkedin' => $this->generateLinkedInShareLink($baseUrl, $product->getTitle()),
            'pinterest' => $this->generatePinterestShareLink($baseUrl, $product->getTitle(), $product->getImages()[0] ?? null),
            'copy' => $baseUrl
        ];
        
        return new JsonResponse([
            'shareLinks' => $shareLinks,
            'title' => $product->getTitle(),
            'description' => $product->getDescription(),
            'image' => $product->getImages()[0] ?? null
        ]);
    }

    #[Route('/track', name: 'api_social_share_track', methods: ['POST'])]
    public function trackShare(Request $request): JsonResponse
    {
        $user = $this->getUser();
        $data = json_decode($request->getContent(), true);
        
        $platform = $data['platform'] ?? null;
        $entityType = $data['entityType'] ?? null;
        $entityId = $data['entityId'] ?? null;
        
        if (!$platform || !$entityType || !$entityId) {
            return new JsonResponse(['error' => 'Missing required parameters'], 400);
        }
        
        // Record share in database
        $share = new SocialShare();
        $share->setPlatform($platform);
        $share->setEntityType($entityType);
        $share->setEntityId($entityId);
        $share->setUser($user);
        
        if (isset($data['url'])) {
            $share->setUrl($data['url']);
        }
        
        $this->entityManager->persist($share);
        $this->entityManager->flush();
        
        // Track analytics event
        $this->analyticsService->trackEvent(
            'social_share',
            'Social Share',
            [
                'platform' => $platform,
                'entity_type' => $entityType,
                'entity_id' => $entityId
            ],
            $user,
            $request
        );
        
        // Update share count on entity if it's a product
        if ($entityType === 'product') {
            $product = $this->entityManager->getRepository(Product::class)->find($entityId);
            if ($product) {
                $product->setShareCount($product->getShareCount() + 1);
                $this->entityManager->flush();
            }
        }
        
        return new JsonResponse([
            'message' => 'Share tracked successfully',
            'shareId' => $share->getId()
        ]);
    }

    #[Route('/stats', name: 'api_social_share_stats', methods: ['GET'])]
    public function getShareStats(Request $request): JsonResponse
    {
        $user = $this->getUser();
        
        if (!$user) {
            return new JsonResponse(['error' => 'Unauthorized'], 401);
        }
        
        $entityType = $request->query->get('entityType');
        $entityId = $request->query->get('entityId');
        
        if (!$entityType || !$entityId) {
            return new JsonResponse(['error' => 'Missing required parameters'], 400);
        }
        
        // Get share counts by platform
        $shares = $this->entityManager->getRepository(SocialShare::class)
            ->findByEntityTypeAndId($entityType, $entityId);
        
        $platformCounts = [];
        $totalShares = 0;
        
        foreach ($shares as $share) {
            $platform = $share->getPlatform();
            $platformCounts[$platform] = ($platformCounts[$platform] ?? 0) + 1;
            $totalShares++;
        }
        
        // Get click counts if available
        $clickCounts = $this->getClickCounts($entityType, $entityId);
        
        return new JsonResponse([
            'totalShares' => $totalShares,
            'platformCounts' => $platformCounts,
            'clickCounts' => $clickCounts,
            'conversionRate' => $this->calculateConversionRate($totalShares, $clickCounts['totalClicks'])
        ]);
    }

    #[Route('/popular', name: 'api_social_share_popular', methods: ['GET'])]
    public function getPopularShares(): JsonResponse
    {
        $user = $this->getUser();
        
        if (!$user || !in_array('ROLE_ADMIN', $user->getRoles())) {
            return new JsonResponse(['error' => 'Unauthorized'], 401);
        }
        
        // Get most shared entities
        $popularEntities = $this->entityManager->getRepository(SocialShare::class)
            ->findMostSharedEntities(10);
        
        $result = [];
        
        foreach ($popularEntities as $entity) {
            $entityType = $entity['entityType'];
            $entityId = $entity['entityId'];
            $shareCount = $entity['shareCount'];
            
            // Get entity details
            $entityDetails = $this->getEntityDetails($entityType, $entityId);
            
            if ($entityDetails) {
                $result[] = [
                    'entityType' => $entityType,
                    'entityId' => $entityId,
                    'shareCount' => $shareCount,
                    'details' => $entityDetails
                ];
            }
        }
        
        return new JsonResponse(['popularShares' => $result]);
    }

    private function addUtmParameters(string $url, array $params): string
    {
        $urlParts = parse_url($url);
        $query = [];
        
        if (isset($urlParts['query'])) {
            parse_str($urlParts['query'], $query);
        }
        
        foreach ($params as $key => $value) {
            $query['utm_' . $key] = $value;
        }
        
        $urlParts['query'] = http_build_query($query);
        
        return $this->buildUrl($urlParts);
    }

    private function buildUrl(array $parts): string
    {
        $scheme = isset($parts['scheme']) ? $parts['scheme'] . '://' : '';
        $host = $parts['host'] ?? '';
        $port = isset($parts['port']) ? ':' . $parts['port'] : '';
        $user = $parts['user'] ?? '';
        $pass = isset($parts['pass']) ? ':' . $parts['pass'] : '';
        $pass = ($user || $pass) ? "$pass@" : '';
        $path = $parts['path'] ?? '';
        $query = isset($parts['query']) ? '?' . $parts['query'] : '';
        $fragment = isset($parts['fragment']) ? '#' . $parts['fragment'] : '';
        
        return "$scheme$user$pass$host$port$path$query$fragment";
    }

    private function generateFacebookShareLink(string $url, string $title): string
    {
        return 'https://www.facebook.com/sharer/sharer.php?u=' . urlencode($url);
    }

    private function generateTwitterShareLink(string $url, string $title): string
    {
        return 'https://twitter.com/intent/tweet?url=' . urlencode($url) . '&text=' . urlencode($title);
    }

    private function generateWhatsAppShareLink(string $url, string $title): string
    {
        return 'https://wa.me/?text=' . urlencode($title . ' ' . $url);
    }

    private function generateTelegramShareLink(string $url, string $title): string
    {
        return 'https://t.me/share/url?url=' . urlencode($url) . '&text=' . urlencode($title);
    }

    private function generateEmailShareLink(string $url, string $title, string $description): string
    {
        $body = $title . "\n\n" . $description . "\n\n" . $url;
        return 'mailto:?subject=' . urlencode($title) . '&body=' . urlencode($body);
    }

    private function generateLinkedInShareLink(string $url, string $title): string
    {
        return 'https://www.linkedin.com/sharing/share-offsite/?url=' . urlencode($url);
    }

    private function generatePinterestShareLink(string $url, string $title, ?string $image): string
    {
        if (!$image) {
            return 'https://pinterest.com/pin/create/button/?url=' . urlencode($url) . '&description=' . urlencode($title);
        }
        
        return 'https://pinterest.com/pin/create/button/?url=' . urlencode($url) . '&media=' . urlencode($image) . '&description=' . urlencode($title);
    }

    private function getClickCounts(string $entityType, string $entityId): array
    {
        // This would typically come from analytics service
        // For now, return mock data
        $totalClicks = rand(10, 100);
        
        return [
            'totalClicks' => $totalClicks,
            'platforms' => [
                'facebook' => rand(1, 30),
                'twitter' => rand(1, 20),
                'whatsapp' => rand(1, 25),
                'email' => rand(1, 10),
                'other' => rand(1, 15)
            ]
        ];
    }

    private function calculateConversionRate(int $shares, int $clicks): float
    {
        if ($shares === 0) {
            return 0;
        }
        
        return round(($clicks / $shares) * 100, 2);
    }

    private function getEntityDetails(string $entityType, string $entityId): ?array
    {
        switch ($entityType) {
            case 'product':
                $product = $this->entityManager->getRepository(Product::class)->find($entityId);
                if ($product) {
                    return [
                        'title' => $product->getTitle(),
                        'image' => $product->getImages()[0] ?? null,
                        'price' => $product->getPrice(),
                        'url' => $this->generateUrl('app_product_show', ['id' => $product->getId()], UrlGeneratorInterface::ABSOLUTE_URL)
                    ];
                }
                break;
                
            case 'livestream':
                $livestream = $this->entityManager->getRepository(LiveStream::class)->find($entityId);
                if ($livestream) {
                    return [
                        'title' => $livestream->getTitle(),
                        'image' => $livestream->getThumbnail(),
                        'streamer' => $livestream->getStreamer()->getFullName(),
                        'url' => $this->generateUrl('app_livestream_show', ['id' => $livestream->getId()], UrlGeneratorInterface::ABSOLUTE_URL)
                    ];
                }
                break;
        }
        
        return null;
    }
}