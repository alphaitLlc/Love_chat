<?php

namespace App\Controller;

use App\Entity\LiveStream;
use App\Entity\LiveStreamMessage;
use App\Service\LiveStreamService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/live-streams')]
class LiveStreamController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private LiveStreamService $liveStreamService
    ) {}

    #[Route('/start/{id}', name: 'api_live_stream_start', methods: ['POST'])]
    public function startLiveStream(LiveStream $liveStream): JsonResponse
    {
        $user = $this->getUser();
        
        if ($liveStream->getStreamer() !== $user) {
            return new JsonResponse(['error' => 'Unauthorized'], 403);
        }
        
        if ($liveStream->getStatus() !== 'scheduled') {
            return new JsonResponse(['error' => 'Stream cannot be started'], 400);
        }
        
        try {
            $this->liveStreamService->startLiveStream($liveStream);
            
            return new JsonResponse([
                'message' => 'Live stream started successfully',
                'stream' => [
                    'id' => $liveStream->getId(),
                    'status' => $liveStream->getStatus(),
                    'streamUrl' => $liveStream->getStreamUrl(),
                    'playbackUrl' => $liveStream->getPlaybackUrl(),
                    'streamKey' => $liveStream->getStreamKey()
                ]
            ]);
            
        } catch (\Exception $e) {
            return new JsonResponse(['error' => $e->getMessage()], 500);
        }
    }

    #[Route('/end/{id}', name: 'api_live_stream_end', methods: ['POST'])]
    public function endLiveStream(LiveStream $liveStream): JsonResponse
    {
        $user = $this->getUser();
        
        if ($liveStream->getStreamer() !== $user) {
            return new JsonResponse(['error' => 'Unauthorized'], 403);
        }
        
        if ($liveStream->getStatus() !== 'live') {
            return new JsonResponse(['error' => 'Stream is not live'], 400);
        }
        
        try {
            $this->liveStreamService->endLiveStream($liveStream);
            
            return new JsonResponse([
                'message' => 'Live stream ended successfully',
                'stream' => [
                    'id' => $liveStream->getId(),
                    'status' => $liveStream->getStatus(),
                    'duration' => $liveStream->getDuration(),
                    'maxViewers' => $liveStream->getMaxViewers(),
                    'totalViews' => $liveStream->getTotalViews(),
                    'revenue' => $liveStream->getRevenue()
                ]
            ]);
            
        } catch (\Exception $e) {
            return new JsonResponse(['error' => $e->getMessage()], 500);
        }
    }

    #[Route('/{id}/join', name: 'api_live_stream_join', methods: ['POST'])]
    public function joinLiveStream(LiveStream $liveStream, Request $request): JsonResponse
    {
        if ($liveStream->getStatus() !== 'live') {
            return new JsonResponse(['error' => 'Stream is not live'], 400);
        }
        
        $user = $this->getUser();
        $sessionId = $request->request->get('sessionId');
        
        try {
            $viewer = $this->liveStreamService->addViewer($liveStream, $user, $sessionId);
            
            return new JsonResponse([
                'message' => 'Joined live stream successfully',
                'viewer' => [
                    'id' => $viewer->getId(),
                    'sessionId' => $viewer->getSessionId()
                ],
                'stream' => [
                    'id' => $liveStream->getId(),
                    'playbackUrl' => $liveStream->getPlaybackUrl(),
                    'viewerCount' => $liveStream->getViewerCount(),
                    'allowChat' => $liveStream->isAllowChat()
                ]
            ]);
            
        } catch (\Exception $e) {
            return new JsonResponse(['error' => $e->getMessage()], 500);
        }
    }

    #[Route('/{id}/leave', name: 'api_live_stream_leave', methods: ['POST'])]
    public function leaveLiveStream(LiveStream $liveStream, Request $request): JsonResponse
    {
        $sessionId = $request->request->get('sessionId');
        
        if (!$sessionId) {
            return new JsonResponse(['error' => 'Session ID required'], 400);
        }
        
        try {
            $viewer = $this->entityManager->getRepository('App\Entity\LiveStreamViewer')
                ->findOneBy(['liveStream' => $liveStream, 'sessionId' => $sessionId, 'isActive' => true]);
            
            if ($viewer) {
                $this->liveStreamService->removeViewer($liveStream, $viewer);
            }
            
            return new JsonResponse(['message' => 'Left live stream successfully']);
            
        } catch (\Exception $e) {
            return new JsonResponse(['error' => $e->getMessage()], 500);
        }
    }

    #[Route('/{id}/chat', name: 'api_live_stream_chat', methods: ['POST'])]
    public function sendChatMessage(LiveStream $liveStream, Request $request): JsonResponse
    {
        $user = $this->getUser();
        
        if (!$user) {
            return new JsonResponse(['error' => 'Authentication required'], 401);
        }
        
        if (!$liveStream->isAllowChat()) {
            return new JsonResponse(['error' => 'Chat is disabled for this stream'], 403);
        }
        
        $data = json_decode($request->getContent(), true);
        $content = $data['content'] ?? '';
        $type = $data['type'] ?? 'text';
        
        if (empty($content)) {
            return new JsonResponse(['error' => 'Message content required'], 400);
        }
        
        try {
            $message = $this->liveStreamService->sendMessage($liveStream, $user, $content, $type);
            
            return new JsonResponse([
                'message' => 'Message sent successfully',
                'chatMessage' => [
                    'id' => $message->getId(),
                    'content' => $message->getContent(),
                    'type' => $message->getType(),
                    'user' => [
                        'id' => $user->getId(),
                        'firstName' => $user->getFirstName(),
                        'lastName' => $user->getLastName()
                    ],
                    'createdAt' => $message->getCreatedAt()->format('c')
                ]
            ]);
            
        } catch (\Exception $e) {
            return new JsonResponse(['error' => $e->getMessage()], 500);
        }
    }

    #[Route('/{id}/highlight-product', name: 'api_live_stream_highlight_product', methods: ['POST'])]
    public function highlightProduct(LiveStream $liveStream, Request $request): JsonResponse
    {
        $user = $this->getUser();
        
        if ($liveStream->getStreamer() !== $user) {
            return new JsonResponse(['error' => 'Unauthorized'], 403);
        }
        
        $data = json_decode($request->getContent(), true);
        $productId = $data['productId'] ?? null;
        
        if (!$productId) {
            return new JsonResponse(['error' => 'Product ID required'], 400);
        }
        
        try {
            $this->liveStreamService->addProductToLiveStream($liveStream, $productId);
            
            return new JsonResponse(['message' => 'Product highlighted successfully']);
            
        } catch (\Exception $e) {
            return new JsonResponse(['error' => $e->getMessage()], 500);
        }
    }

    #[Route('/{id}/analytics', name: 'api_live_stream_analytics', methods: ['GET'])]
    public function getAnalytics(LiveStream $liveStream): JsonResponse
    {
        $user = $this->getUser();
        
        if ($liveStream->getStreamer() !== $user && !$this->isGranted('ROLE_ADMIN')) {
            return new JsonResponse(['error' => 'Unauthorized'], 403);
        }
        
        return new JsonResponse([
            'analytics' => [
                'id' => $liveStream->getId(),
                'title' => $liveStream->getTitle(),
                'status' => $liveStream->getStatus(),
                'duration' => $liveStream->getDuration(),
                'viewerCount' => $liveStream->getViewerCount(),
                'maxViewers' => $liveStream->getMaxViewers(),
                'totalViews' => $liveStream->getTotalViews(),
                'revenue' => $liveStream->getRevenue(),
                'ordersCount' => $liveStream->getOrdersCount(),
                'messagesCount' => $liveStream->getMessages()->count(),
                'startedAt' => $liveStream->getStartedAt()?->format('c'),
                'endedAt' => $liveStream->getEndedAt()?->format('c'),
                'products' => $liveStream->getProducts()->map(fn($p) => [
                    'id' => $p->getId(),
                    'title' => $p->getTitle(),
                    'price' => $p->getPrice()
                ])->toArray()
            ]
        ]);
    }
}