<?php

namespace App\Service;

use App\Entity\LiveStream;
use App\Entity\LiveStreamMessage;
use App\Entity\LiveStreamViewer;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Mercure\HubInterface;
use Symfony\Component\Mercure\Update;

class LiveStreamService
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private HubInterface $mercureHub,
        private NotificationService $notificationService
    ) {}

    public function startLiveStream(LiveStream $liveStream): void
    {
        $liveStream->setStatus('live');
        $liveStream->setStartedAt(new \DateTime());
        
        // Generate stream URLs (would integrate with actual streaming service)
        $streamKey = $liveStream->getStreamKey();
        $liveStream->setStreamUrl("rtmp://live.linkmarket.com/live/{$streamKey}");
        $liveStream->setPlaybackUrl("https://live.linkmarket.com/hls/{$streamKey}/index.m3u8");
        
        $this->entityManager->flush();
        
        // Notify followers
        $this->notifyFollowers($liveStream);
        
        // Broadcast live stream start
        $this->broadcastLiveStreamUpdate($liveStream, 'started');
    }

    public function endLiveStream(LiveStream $liveStream): void
    {
        $liveStream->setStatus('ended');
        $liveStream->setEndedAt(new \DateTime());
        $liveStream->setViewerCount(0);
        
        $this->entityManager->flush();
        
        // Broadcast live stream end
        $this->broadcastLiveStreamUpdate($liveStream, 'ended');
        
        // Generate analytics report
        $this->generateLiveStreamReport($liveStream);
    }

    public function addViewer(LiveStream $liveStream, ?User $user = null, string $sessionId = null): LiveStreamViewer
    {
        $viewer = new LiveStreamViewer();
        $viewer->setLiveStream($liveStream);
        $viewer->setUser($user);
        $viewer->setSessionId($sessionId ?: uniqid('viewer_', true));
        
        $this->entityManager->persist($viewer);
        
        // Update viewer count
        $currentCount = $liveStream->getViewerCount() + 1;
        $liveStream->setViewerCount($currentCount);
        $liveStream->setTotalViews($liveStream->getTotalViews() + 1);
        
        $this->entityManager->flush();
        
        // Broadcast viewer count update
        $this->broadcastViewerCountUpdate($liveStream);
        
        return $viewer;
    }

    public function removeViewer(LiveStream $liveStream, LiveStreamViewer $viewer): void
    {
        $viewer->setLeftAt(new \DateTime());
        $viewer->setIsActive(false);
        
        // Update viewer count
        $currentCount = max(0, $liveStream->getViewerCount() - 1);
        $liveStream->setViewerCount($currentCount);
        
        $this->entityManager->flush();
        
        // Broadcast viewer count update
        $this->broadcastViewerCountUpdate($liveStream);
    }

    public function sendMessage(LiveStream $liveStream, User $user, string $content, string $type = 'text'): LiveStreamMessage
    {
        $message = new LiveStreamMessage();
        $message->setLiveStream($liveStream);
        $message->setUser($user);
        $message->setContent($content);
        $message->setType($type);
        
        $this->entityManager->persist($message);
        $this->entityManager->flush();
        
        // Broadcast message to all viewers
        $this->broadcastChatMessage($liveStream, $message);
        
        return $message;
    }

    public function addProductToLiveStream(LiveStream $liveStream, int $productId): void
    {
        // This would be called when streamer highlights a product
        $this->broadcastProductHighlight($liveStream, $productId);
    }

    public function recordPurchase(LiveStream $liveStream, float $amount): void
    {
        $currentRevenue = (float)$liveStream->getRevenue();
        $liveStream->setRevenue((string)($currentRevenue + $amount));
        $liveStream->setOrdersCount($liveStream->getOrdersCount() + 1);
        
        $this->entityManager->flush();
        
        // Broadcast purchase notification
        $this->broadcastPurchaseNotification($liveStream, $amount);
    }

    private function notifyFollowers(LiveStream $liveStream): void
    {
        // Get streamer's followers (would need to implement follower system)
        $streamer = $liveStream->getStreamer();
        
        // Send push notifications
        $this->notificationService->sendLiveStreamNotification(
            $streamer,
            $liveStream->getTitle()
        );
    }

    private function broadcastLiveStreamUpdate(LiveStream $liveStream, string $action): void
    {
        $update = new Update(
            "live-stream/{$liveStream->getId()}",
            json_encode([
                'type' => 'stream_update',
                'action' => $action,
                'stream' => [
                    'id' => $liveStream->getId(),
                    'status' => $liveStream->getStatus(),
                    'viewerCount' => $liveStream->getViewerCount(),
                    'startedAt' => $liveStream->getStartedAt()?->format('c'),
                    'endedAt' => $liveStream->getEndedAt()?->format('c')
                ]
            ])
        );
        
        $this->mercureHub->publish($update);
    }

    private function broadcastViewerCountUpdate(LiveStream $liveStream): void
    {
        $update = new Update(
            "live-stream/{$liveStream->getId()}",
            json_encode([
                'type' => 'viewer_count_update',
                'viewerCount' => $liveStream->getViewerCount()
            ])
        );
        
        $this->mercureHub->publish($update);
    }

    private function broadcastChatMessage(LiveStream $liveStream, LiveStreamMessage $message): void
    {
        $update = new Update(
            "live-stream/{$liveStream->getId()}/chat",
            json_encode([
                'type' => 'chat_message',
                'message' => [
                    'id' => $message->getId(),
                    'user' => [
                        'id' => $message->getUser()->getId(),
                        'firstName' => $message->getUser()->getFirstName(),
                        'lastName' => $message->getUser()->getLastName(),
                        'avatar' => $message->getUser()->getAvatar()
                    ],
                    'content' => $message->getContent(),
                    'type' => $message->getType(),
                    'createdAt' => $message->getCreatedAt()->format('c')
                ]
            ])
        );
        
        $this->mercureHub->publish($update);
    }

    private function broadcastProductHighlight(LiveStream $liveStream, int $productId): void
    {
        $update = new Update(
            "live-stream/{$liveStream->getId()}",
            json_encode([
                'type' => 'product_highlight',
                'productId' => $productId
            ])
        );
        
        $this->mercureHub->publish($update);
    }

    private function broadcastPurchaseNotification(LiveStream $liveStream, float $amount): void
    {
        $update = new Update(
            "live-stream/{$liveStream->getId()}",
            json_encode([
                'type' => 'purchase_notification',
                'amount' => $amount,
                'totalRevenue' => $liveStream->getRevenue(),
                'ordersCount' => $liveStream->getOrdersCount()
            ])
        );
        
        $this->mercureHub->publish($update);
    }

    private function generateLiveStreamReport(LiveStream $liveStream): void
    {
        // Generate comprehensive analytics report
        $report = [
            'duration' => $liveStream->getDuration(),
            'maxViewers' => $liveStream->getMaxViewers(),
            'totalViews' => $liveStream->getTotalViews(),
            'revenue' => $liveStream->getRevenue(),
            'ordersCount' => $liveStream->getOrdersCount(),
            'messagesCount' => $liveStream->getMessages()->count(),
            'averageViewTime' => $this->calculateAverageViewTime($liveStream),
            'conversionRate' => $this->calculateConversionRate($liveStream)
        ];
        
        // Store report or send to analytics service
        // This could be saved to a separate LiveStreamReport entity
    }

    private function calculateAverageViewTime(LiveStream $liveStream): float
    {
        $viewers = $liveStream->getViewers();
        $totalViewTime = 0;
        $viewerCount = 0;
        
        foreach ($viewers as $viewer) {
            if ($viewer->getWatchDuration()) {
                $totalViewTime += $viewer->getWatchDuration();
                $viewerCount++;
            }
        }
        
        return $viewerCount > 0 ? $totalViewTime / $viewerCount : 0;
    }

    private function calculateConversionRate(LiveStream $liveStream): float
    {
        $totalViews = $liveStream->getTotalViews();
        $orders = $liveStream->getOrdersCount();
        
        return $totalViews > 0 ? ($orders / $totalViews) * 100 : 0;
    }
}