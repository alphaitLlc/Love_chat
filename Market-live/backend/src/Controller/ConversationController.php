<?php

namespace App\Controller;

use App\Entity\Conversation;
use App\Entity\Message;
use App\Entity\User;
use App\Service\NotificationService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Mercure\HubInterface;
use Symfony\Component\Mercure\Update;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/conversations')]
class ConversationController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private HubInterface $mercureHub,
        private NotificationService $notificationService
    ) {}

    #[Route('', name: 'api_conversations_list', methods: ['GET'])]
    public function getConversations(): JsonResponse
    {
        $user = $this->getUser();
        
        if (!$user) {
            return new JsonResponse(['error' => 'Unauthorized'], 401);
        }
        
        $conversations = $this->entityManager->getRepository(Conversation::class)->findByParticipant($user);
        
        $data = [];
        foreach ($conversations as $conversation) {
            $participants = [];
            foreach ($conversation->getParticipants() as $participant) {
                if ($participant->getId() !== $user->getId()) {
                    $participants[] = [
                        'id' => $participant->getId(),
                        'firstName' => $participant->getFirstName(),
                        'lastName' => $participant->getLastName(),
                        'avatar' => $participant->getAvatar(),
                        'company' => $participant->getCompany(),
                        'isVerified' => $participant->isVerified()
                    ];
                }
            }
            
            $lastMessage = $conversation->getLastMessage();
            
            $data[] = [
                'id' => $conversation->getId(),
                'conversationId' => $conversation->getConversationId(),
                'title' => $conversation->getTitle(),
                'type' => $conversation->getType(),
                'participants' => $participants,
                'unreadCount' => $conversation->getUnreadCount($user),
                'lastMessage' => $lastMessage ? [
                    'id' => $lastMessage->getId(),
                    'content' => $lastMessage->getContent(),
                    'type' => $lastMessage->getType(),
                    'senderId' => $lastMessage->getSender()->getId(),
                    'senderName' => $lastMessage->getSender()->getFullName(),
                    'createdAt' => $lastMessage->getCreatedAt()->format('c')
                ] : null,
                'createdAt' => $conversation->getCreatedAt()->format('c'),
                'updatedAt' => $conversation->getUpdatedAt()->format('c')
            ];
        }
        
        return new JsonResponse(['conversations' => $data]);
    }

    #[Route('/{id}', name: 'api_conversation_get', methods: ['GET'])]
    public function getConversation(Conversation $conversation): JsonResponse
    {
        $user = $this->getUser();
        
        if (!$user) {
            return new JsonResponse(['error' => 'Unauthorized'], 401);
        }
        
        if (!$conversation->hasParticipant($user)) {
            return new JsonResponse(['error' => 'Unauthorized'], 403);
        }
        
        $participants = [];
        foreach ($conversation->getParticipants() as $participant) {
            $participants[] = [
                'id' => $participant->getId(),
                'firstName' => $participant->getFirstName(),
                'lastName' => $participant->getLastName(),
                'avatar' => $participant->getAvatar(),
                'company' => $participant->getCompany(),
                'role' => $participant->getRole(),
                'isVerified' => $participant->isVerified()
            ];
        }
        
        $messages = $this->entityManager->getRepository(Message::class)->findByConversation($conversation);
        
        $messageData = [];
        foreach ($messages as $message) {
            $messageData[] = [
                'id' => $message->getId(),
                'senderId' => $message->getSender()->getId(),
                'senderName' => $message->getSender()->getFullName(),
                'senderAvatar' => $message->getSender()->getAvatar(),
                'receiverId' => $message->getReceiver()->getId(),
                'content' => $message->getContent(),
                'type' => $message->getType(),
                'isRead' => $message->isRead(),
                'readAt' => $message->getReadAt()?->format('c'),
                'attachments' => $message->getAttachments(),
                'metadata' => $message->getMetadata(),
                'createdAt' => $message->getCreatedAt()->format('c')
            ];
            
            // Mark messages as read if user is the receiver
            if ($message->getReceiver() === $user && !$message->isRead()) {
                $message->setIsRead(true);
                $message->setReadAt(new \DateTime());
            }
        }
        
        $this->entityManager->flush();
        
        return new JsonResponse([
            'conversation' => [
                'id' => $conversation->getId(),
                'conversationId' => $conversation->getConversationId(),
                'title' => $conversation->getTitle(),
                'type' => $conversation->getType(),
                'participants' => $participants,
                'messages' => $messageData,
                'isArchived' => $conversation->isArchived(),
                'metadata' => $conversation->getMetadata(),
                'createdAt' => $conversation->getCreatedAt()->format('c'),
                'updatedAt' => $conversation->getUpdatedAt()->format('c')
            ]
        ]);
    }

    #[Route('', name: 'api_conversation_create', methods: ['POST'])]
    public function createConversation(Request $request): JsonResponse
    {
        $user = $this->getUser();
        
        if (!$user) {
            return new JsonResponse(['error' => 'Unauthorized'], 401);
        }
        
        $data = json_decode($request->getContent(), true);
        
        $participantIds = $data['participantIds'] ?? [];
        $title = $data['title'] ?? null;
        $type = $data['type'] ?? 'direct';
        $metadata = $data['metadata'] ?? null;
        
        if (empty($participantIds)) {
            return new JsonResponse(['error' => 'At least one participant is required'], 400);
        }
        
        // Check if direct conversation already exists
        if ($type === 'direct' && count($participantIds) === 1) {
            $otherUser = $this->entityManager->getRepository(User::class)->find($participantIds[0]);
            
            if (!$otherUser) {
                return new JsonResponse(['error' => 'Participant not found'], 404);
            }
            
            $existingConversation = $this->entityManager->getRepository(Conversation::class)
                ->findByParticipants($user, $otherUser);
            
            if ($existingConversation) {
                return new JsonResponse([
                    'message' => 'Conversation already exists',
                    'conversation' => [
                        'id' => $existingConversation->getId(),
                        'conversationId' => $existingConversation->getConversationId()
                    ]
                ]);
            }
        }
        
        // Create new conversation
        $conversation = new Conversation();
        $conversation->addParticipant($user);
        
        foreach ($participantIds as $participantId) {
            $participant = $this->entityManager->getRepository(User::class)->find($participantId);
            
            if ($participant) {
                $conversation->addParticipant($participant);
            }
        }
        
        if ($title) {
            $conversation->setTitle($title);
        }
        
        $conversation->setType($type);
        
        if ($metadata) {
            $conversation->setMetadata($metadata);
        }
        
        $this->entityManager->persist($conversation);
        $this->entityManager->flush();
        
        return new JsonResponse([
            'message' => 'Conversation created successfully',
            'conversation' => [
                'id' => $conversation->getId(),
                'conversationId' => $conversation->getConversationId(),
                'title' => $conversation->getTitle(),
                'type' => $conversation->getType()
            ]
        ], 201);
    }

    #[Route('/{id}/messages', name: 'api_conversation_send_message', methods: ['POST'])]
    public function sendMessage(Conversation $conversation, Request $request): JsonResponse
    {
        $user = $this->getUser();
        
        if (!$user) {
            return new JsonResponse(['error' => 'Unauthorized'], 401);
        }
        
        if (!$conversation->hasParticipant($user)) {
            return new JsonResponse(['error' => 'Unauthorized'], 403);
        }
        
        $data = json_decode($request->getContent(), true);
        
        $content = $data['content'] ?? null;
        $receiverId = $data['receiverId'] ?? null;
        $type = $data['type'] ?? 'text';
        $attachments = $data['attachments'] ?? null;
        $metadata = $data['metadata'] ?? null;
        
        if (!$content) {
            return new JsonResponse(['error' => 'Message content is required'], 400);
        }
        
        if (!$receiverId) {
            return new JsonResponse(['error' => 'Receiver ID is required'], 400);
        }
        
        $receiver = $this->entityManager->getRepository(User::class)->find($receiverId);
        
        if (!$receiver) {
            return new JsonResponse(['error' => 'Receiver not found'], 404);
        }
        
        if (!$conversation->hasParticipant($receiver)) {
            return new JsonResponse(['error' => 'Receiver is not a participant in this conversation'], 400);
        }
        
        $message = new Message();
        $message->setConversation($conversation);
        $message->setSender($user);
        $message->setReceiver($receiver);
        $message->setContent($content);
        $message->setType($type);
        
        if ($attachments) {
            $message->setAttachments($attachments);
        }
        
        if ($metadata) {
            $message->setMetadata($metadata);
        }
        
        $this->entityManager->persist($message);
        
        // Update conversation timestamp
        $conversation->setUpdatedAt(new \DateTime());
        
        $this->entityManager->flush();
        
        // Send real-time update via Mercure
        $update = new Update(
            "conversation/{$conversation->getId()}",
            json_encode([
                'type' => 'new_message',
                'message' => [
                    'id' => $message->getId(),
                    'conversationId' => $conversation->getId(),
                    'senderId' => $user->getId(),
                    'senderName' => $user->getFullName(),
                    'senderAvatar' => $user->getAvatar(),
                    'receiverId' => $receiver->getId(),
                    'content' => $message->getContent(),
                    'type' => $message->getType(),
                    'attachments' => $message->getAttachments(),
                    'metadata' => $message->getMetadata(),
                    'createdAt' => $message->getCreatedAt()->format('c')
                ]
            ])
        );
        
        $this->mercureHub->publish($update);
        
        // Send notification to receiver
        $this->notificationService->sendNewMessageNotification(
            $receiver,
            $user,
            $conversation->getConversationId()
        );
        
        return new JsonResponse([
            'message' => 'Message sent successfully',
            'data' => [
                'id' => $message->getId(),
                'conversationId' => $conversation->getId(),
                'senderId' => $user->getId(),
                'receiverId' => $receiver->getId(),
                'content' => $message->getContent(),
                'type' => $message->getType(),
                'createdAt' => $message->getCreatedAt()->format('c')
            ]
        ]);
    }

    #[Route('/{id}/read', name: 'api_conversation_mark_read', methods: ['PUT'])]
    public function markConversationAsRead(Conversation $conversation): JsonResponse
    {
        $user = $this->getUser();
        
        if (!$user) {
            return new JsonResponse(['error' => 'Unauthorized'], 401);
        }
        
        if (!$conversation->hasParticipant($user)) {
            return new JsonResponse(['error' => 'Unauthorized'], 403);
        }
        
        $messages = $this->entityManager->getRepository(Message::class)
            ->findUnreadByConversationAndReceiver($conversation, $user);
        
        foreach ($messages as $message) {
            $message->setIsRead(true);
            $message->setReadAt(new \DateTime());
        }
        
        $this->entityManager->flush();
        
        // Send real-time update via Mercure
        $update = new Update(
            "conversation/{$conversation->getId()}/read",
            json_encode([
                'type' => 'messages_read',
                'conversationId' => $conversation->getId(),
                'userId' => $user->getId(),
                'timestamp' => (new \DateTime())->format('c')
            ])
        );
        
        $this->mercureHub->publish($update);
        
        return new JsonResponse([
            'message' => 'Conversation marked as read',
            'count' => count($messages)
        ]);
    }

    #[Route('/{id}/archive', name: 'api_conversation_archive', methods: ['PUT'])]
    public function archiveConversation(Conversation $conversation): JsonResponse
    {
        $user = $this->getUser();
        
        if (!$user) {
            return new JsonResponse(['error' => 'Unauthorized'], 401);
        }
        
        if (!$conversation->hasParticipant($user)) {
            return new JsonResponse(['error' => 'Unauthorized'], 403);
        }
        
        $conversation->setIsArchived(true);
        $this->entityManager->flush();
        
        return new JsonResponse(['message' => 'Conversation archived']);
    }

    #[Route('/{id}/unarchive', name: 'api_conversation_unarchive', methods: ['PUT'])]
    public function unarchiveConversation(Conversation $conversation): JsonResponse
    {
        $user = $this->getUser();
        
        if (!$user) {
            return new JsonResponse(['error' => 'Unauthorized'], 401);
        }
        
        if (!$conversation->hasParticipant($user)) {
            return new JsonResponse(['error' => 'Unauthorized'], 403);
        }
        
        $conversation->setIsArchived(false);
        $this->entityManager->flush();
        
        return new JsonResponse(['message' => 'Conversation unarchived']);
    }

    #[Route('/unread-count', name: 'api_conversations_unread_count', methods: ['GET'])]
    public function getUnreadCount(): JsonResponse
    {
        $user = $this->getUser();
        
        if (!$user) {
            return new JsonResponse(['error' => 'Unauthorized'], 401);
        }
        
        $count = $this->entityManager->getRepository(Conversation::class)->countUnreadConversations($user);
        
        return new JsonResponse(['count' => $count]);
    }
}