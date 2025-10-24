<?php

namespace App\Controller;

use App\Entity\Notification;
use App\Repository\NotificationRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/notifications')]
class NotificationController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private NotificationRepository $notificationRepository
    ) {}

    #[Route('', name: 'api_notifications_list', methods: ['GET'])]
    public function getNotifications(Request $request): JsonResponse
    {
        $user = $this->getUser();
        
        if (!$user) {
            return new JsonResponse(['error' => 'Unauthorized'], 401);
        }
        
        $page = $request->query->getInt('page', 1);
        $limit = $request->query->getInt('limit', 20);
        
        $notifications = $this->notificationRepository->findByUserPaginated($user, $page, $limit);
        $total = $this->notificationRepository->countUnreadByUser($user);
        
        $data = [];
        foreach ($notifications as $notification) {
            $data[] = [
                'id' => $notification->getId(),
                'type' => $notification->getType(),
                'title' => $notification->getTitle(),
                'message' => $notification->getMessage(),
                'isRead' => $notification->isRead(),
                'actionUrl' => $notification->getActionUrl(),
                'priority' => $notification->getPriority(),
                'createdAt' => $notification->getCreatedAt()->format('c'),
                'readAt' => $notification->getReadAt()?->format('c'),
                'isExpired' => $notification->isExpired()
            ];
        }
        
        return new JsonResponse([
            'notifications' => $data,
            'unreadCount' => $total,
            'page' => $page,
            'limit' => $limit,
            'totalPages' => ceil(count($notifications) / $limit)
        ]);
    }

    #[Route('/unread', name: 'api_notifications_unread', methods: ['GET'])]
    public function getUnreadNotifications(): JsonResponse
    {
        $user = $this->getUser();
        
        if (!$user) {
            return new JsonResponse(['error' => 'Unauthorized'], 401);
        }
        
        $notifications = $this->notificationRepository->findUnreadByUser($user);
        
        $data = [];
        foreach ($notifications as $notification) {
            $data[] = [
                'id' => $notification->getId(),
                'type' => $notification->getType(),
                'title' => $notification->getTitle(),
                'message' => $notification->getMessage(),
                'actionUrl' => $notification->getActionUrl(),
                'priority' => $notification->getPriority(),
                'createdAt' => $notification->getCreatedAt()->format('c')
            ];
        }
        
        return new JsonResponse([
            'notifications' => $data,
            'count' => count($notifications)
        ]);
    }

    #[Route('/count', name: 'api_notifications_count', methods: ['GET'])]
    public function getUnreadCount(): JsonResponse
    {
        $user = $this->getUser();
        
        if (!$user) {
            return new JsonResponse(['error' => 'Unauthorized'], 401);
        }
        
        $count = $this->notificationRepository->countUnreadByUser($user);
        
        return new JsonResponse(['count' => $count]);
    }

    #[Route('/{id}/read', name: 'api_notification_mark_read', methods: ['PUT'])]
    public function markAsRead(Notification $notification): JsonResponse
    {
        $user = $this->getUser();
        
        if (!$user) {
            return new JsonResponse(['error' => 'Unauthorized'], 401);
        }
        
        if ($notification->getUser() !== $user && !$this->isGranted('ROLE_ADMIN')) {
            return new JsonResponse(['error' => 'Unauthorized'], 403);
        }
        
        $notification->setIsRead(true);
        $this->entityManager->flush();
        
        return new JsonResponse(['message' => 'Notification marked as read']);
    }

    #[Route('/mark-all-read', name: 'api_notifications_mark_all_read', methods: ['PUT'])]
    public function markAllAsRead(): JsonResponse
    {
        $user = $this->getUser();
        
        if (!$user) {
            return new JsonResponse(['error' => 'Unauthorized'], 401);
        }
        
        $count = $this->notificationRepository->markAllAsReadForUser($user);
        
        return new JsonResponse([
            'message' => 'All notifications marked as read',
            'count' => $count
        ]);
    }

    #[Route('/{id}', name: 'api_notification_delete', methods: ['DELETE'])]
    public function deleteNotification(Notification $notification): JsonResponse
    {
        $user = $this->getUser();
        
        if (!$user) {
            return new JsonResponse(['error' => 'Unauthorized'], 401);
        }
        
        if ($notification->getUser() !== $user && !$this->isGranted('ROLE_ADMIN')) {
            return new JsonResponse(['error' => 'Unauthorized'], 403);
        }
        
        $this->entityManager->remove($notification);
        $this->entityManager->flush();
        
        return new JsonResponse(['message' => 'Notification deleted']);
    }

    #[Route('/delete-all', name: 'api_notifications_delete_all', methods: ['DELETE'])]
    public function deleteAllNotifications(): JsonResponse
    {
        $user = $this->getUser();
        
        if (!$user) {
            return new JsonResponse(['error' => 'Unauthorized'], 401);
        }
        
        $notifications = $this->notificationRepository->findByUser(['user' => $user]);
        
        foreach ($notifications as $notification) {
            $this->entityManager->remove($notification);
        }
        
        $this->entityManager->flush();
        
        return new JsonResponse(['message' => 'All notifications deleted']);
    }

    #[Route('/preferences', name: 'api_notifications_preferences', methods: ['GET'])]
    public function getNotificationPreferences(): JsonResponse
    {
        $user = $this->getUser();
        
        if (!$user) {
            return new JsonResponse(['error' => 'Unauthorized'], 401);
        }
        
        $preferences = $user->getPreferences()['notifications'] ?? [
            'email' => true,
            'push' => true,
            'sms' => false,
            'marketing' => true
        ];
        
        return new JsonResponse(['preferences' => $preferences]);
    }

    #[Route('/preferences', name: 'api_notifications_update_preferences', methods: ['PUT'])]
    public function updateNotificationPreferences(Request $request): JsonResponse
    {
        $user = $this->getUser();
        
        if (!$user) {
            return new JsonResponse(['error' => 'Unauthorized'], 401);
        }
        
        $data = json_decode($request->getContent(), true);
        $preferences = $data['preferences'] ?? null;
        
        if (!$preferences) {
            return new JsonResponse(['error' => 'Preferences are required'], 400);
        }
        
        $userPreferences = $user->getPreferences() ?? [];
        $userPreferences['notifications'] = $preferences;
        
        $user->setPreferences($userPreferences);
        $this->entityManager->flush();
        
        return new JsonResponse([
            'message' => 'Notification preferences updated',
            'preferences' => $preferences
        ]);
    }
}