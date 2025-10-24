<?php

namespace App\Controller;

use App\Service\ChatbotService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/chatbot')]
class ChatbotController extends AbstractController
{
    public function __construct(
        private ChatbotService $chatbotService
    ) {}

    #[Route('/chat', name: 'api_chatbot_chat', methods: ['POST'])]
    public function chat(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!isset($data['message'])) {
            return new JsonResponse(['error' => 'Message requis'], 400);
        }

        $user = $this->getUser();
        $sessionId = $data['sessionId'] ?? uniqid('session_', true);
        $context = $data['context'] ?? [];

        try {
            $response = $this->chatbotService->processMessage(
                $data['message'],
                $user,
                $sessionId,
                $context
            );

            return new JsonResponse([
                'response' => $response['message'],
                'type' => $response['type'] ?? 'text',
                'options' => $response['options'] ?? null,
                'actions' => $response['actions'] ?? null,
                'sessionId' => $sessionId,
                'context' => $response['context'] ?? $context
            ]);

        } catch (\Exception $e) {
            return new JsonResponse([
                'response' => 'Désolé, je rencontre un problème technique. Veuillez réessayer plus tard.',
                'type' => 'error',
                'sessionId' => $sessionId
            ], 500);
        }
    }

    #[Route('/suggestions', name: 'api_chatbot_suggestions', methods: ['GET'])]
    public function getSuggestions(Request $request): JsonResponse
    {
        $user = $this->getUser();
        $context = $request->query->get('context', 'general');

        $suggestions = $this->chatbotService->getSuggestions($user, $context);

        return new JsonResponse(['suggestions' => $suggestions]);
    }

    #[Route('/feedback', name: 'api_chatbot_feedback', methods: ['POST'])]
    public function feedback(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!isset($data['sessionId']) || !isset($data['rating'])) {
            return new JsonResponse(['error' => 'Session ID et rating requis'], 400);
        }

        try {
            $this->chatbotService->saveFeedback(
                $data['sessionId'],
                $data['rating'],
                $data['comment'] ?? null,
                $this->getUser()
            );

            return new JsonResponse(['message' => 'Merci pour votre retour !']);

        } catch (\Exception $e) {
            return new JsonResponse(['error' => 'Erreur lors de l\'enregistrement'], 500);
        }
    }
}