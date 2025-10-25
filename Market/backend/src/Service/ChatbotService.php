<?php

namespace App\Service;

use App\Entity\User;
use App\Entity\Product;
use App\Entity\Order;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class ChatbotService
{
    private array $conversationHistory = [];

    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly HttpClientInterface $httpClient,
        private readonly string $openaiApiKey,
        private string $kycDirectory
    ) {
        $this->entityManager = $entityManager;
        $this->httpClient = $httpClient;
        $this->openaiApiKey = $openaiApiKey;
    }

    public function processMessage(string $message, ?User $user = null, string $sessionId = '', array $context = []): array
    {
        // Analyze message intent
        $intent = $this->analyzeIntent($message);
        
        // Get context-aware response
        $response = $this->generateResponse($message, $intent, $user, $context);
        
        // Store conversation history
        $this->storeConversationHistory($sessionId, $message, $response, $user);
        
        return $response;
    }

    private function analyzeIntent(string $message): string
    {
        $message = strtolower($message);
        
        // Product search intents
        if (preg_match('/\b(cherche|trouve|produit|article|acheter|vendre)\b/', $message)) {
            return 'product_search';
        }
        
        // Order related intents
        if (preg_match('/\b(commande|order|livraison|suivi|tracking)\b/', $message)) {
            return 'order_inquiry';
        }
        
        // Payment intents
        if (preg_match('/\b(paiement|payment|carte|paypal|stripe)\b/', $message)) {
            return 'payment_help';
        }
        
        // Account intents
        if (preg_match('/\b(compte|profil|inscription|connexion|mot de passe)\b/', $message)) {
            return 'account_help';
        }
        
        // Shipping intents
        if (preg_match('/\b(livraison|expédition|frais de port|délai)\b/', $message)) {
            return 'shipping_info';
        }
        
        // General help
        if (preg_match('/\b(aide|help|comment|pourquoi|quoi)\b/', $message)) {
            return 'general_help';
        }
        
        return 'general';
    }

    private function generateResponse(string $message, string $intent, ?User $user, array $context): array
    {
        switch ($intent) {
            case 'product_search':
                return $this->handleProductSearch($message, $user);
                
            case 'order_inquiry':
                return $this->handleOrderInquiry($message, $user);
                
            case 'payment_help':
                return $this->handlePaymentHelp($message, $user);
                
            case 'account_help':
                return $this->handleAccountHelp($message, $user);
                
            case 'shipping_info':
                return $this->handleShippingInfo($message, $user);
                
            case 'general_help':
                return $this->handleGeneralHelp($message, $user);
                
            default:
                return $this->handleGeneralResponse($message, $user);
        }
    }

    private function handleProductSearch(string $message, ?User $user): array
    {
        // Extract product keywords
        $keywords = $this->extractKeywords($message);
        
        // Search products
        $products = $this->searchProducts($keywords, 3);
        
        if (empty($products)) {
            return [
                'message' => "Je n'ai pas trouvé de produits correspondant à votre recherche. Voulez-vous que je vous aide à affiner votre recherche ?",
                'type' => 'text',
                'options' => [
                    'Voir toutes les catégories',
                    'Produits populaires',
                    'Nouveautés',
                    'Promotions'
                ]
            ];
        }
        
        $productList = '';
        foreach ($products as $product) {
            $productList .= "• {$product->getTitle()} - €{$product->getPrice()}\n";
        }
        
        return [
            'message' => "Voici quelques produits qui pourraient vous intéresser :\n\n{$productList}\nSouhaitez-vous voir plus de détails sur l'un de ces produits ?",
            'type' => 'product_list',
            'products' => array_map(function($product) {
                return [
                    'id' => $product->getId(),
                    'title' => $product->getTitle(),
                    'price' => $product->getPrice(),
                    'image' => $product->getImages()[0] ?? null
                ];
            }, $products),
            'options' => [
                'Voir plus de produits',
                'Affiner la recherche',
                'Contacter un vendeur'
            ]
        ];
    }

    private function handleOrderInquiry(string $message, ?User $user): array
    {
        if (!$user) {
            return [
                'message' => 'Pour consulter vos commandes, vous devez être connecté. Souhaitez-vous vous connecter ?',
                'type' => 'text',
                'actions' => ['login'],
                'options' => ['Se connecter', 'Créer un compte']
            ];
        }
        
        // Get user's recent orders
        $orders = $this->entityManager->getRepository(Order::class)
            ->findBy(['buyer' => $user], ['createdAt' => 'DESC'], 3);
        
        if (empty($orders)) {
            return [
                'message' => 'Vous n\'avez pas encore passé de commandes. Voulez-vous découvrir nos produits ?',
                'type' => 'text',
                'options' => [
                    'Voir les produits',
                    'Voir les promotions',
                    'Contacter le support'
                ]
            ];
        }
        
        $orderList = "Voici vos dernières commandes :\n\n";
        foreach ($orders as $order) {
            $orderList .= "• Commande {$order->getOrderNumber()} - {$order->getStatus()} - €{$order->getTotalAmount()}\n";
        }
        
        return [
            'message' => $orderList . "\nSur quelle commande avez-vous besoin d'aide ?",
            'type' => 'order_list',
            'orders' => array_map(function($order) {
                return [
                    'id' => $order->getId(),
                    'orderNumber' => $order->getOrderNumber(),
                    'status' => $order->getStatus(),
                    'totalAmount' => $order->getTotalAmount()
                ];
            }, $orders),
            'options' => [
                'Suivre une commande',
                'Problème de livraison',
                'Retourner un produit'
            ]
        ];
    }

    private function handlePaymentHelp(string $message, ?User $user): array
    {
        return [
            'message' => 'Je peux vous aider avec les paiements. Que souhaitez-vous savoir ?',
            'type' => 'text',
            'options' => [
                'Méthodes de paiement acceptées',
                'Sécurité des paiements',
                'Problème de paiement',
                'Demander un remboursement'
            ]
        ];
    }

    private function handleAccountHelp(string $message, ?User $user): array
    {
        if (!$user) {
            return [
                'message' => 'Je peux vous aider avec votre compte. Souhaitez-vous créer un compte ou vous connecter ?',
                'type' => 'text',
                'actions' => ['register', 'login'],
                'options' => [
                    'Créer un compte',
                    'Se connecter',
                    'Mot de passe oublié'
                ]
            ];
        }
        
        return [
            'message' => "Bonjour {$user->getFirstName()} ! Comment puis-je vous aider avec votre compte ?",
            'type' => 'text',
            'options' => [
                'Modifier mon profil',
                'Changer mon mot de passe',
                'Gérer mes préférences',
                'Supprimer mon compte'
            ]
        ];
    }

    private function handleShippingInfo(string $message, ?User $user): array
    {
        return [
            'message' => 'Voici les informations sur la livraison :

• Livraison gratuite dès 100€ d\'achat
• Délai standard : 2-5 jours ouvrés
• Livraison express : 24-48h (supplément)
• Suivi en temps réel disponible

Que souhaitez-vous savoir de plus ?',
            'type' => 'text',
            'options' => [
                'Calculer les frais de port',
                'Zones de livraison',
                'Suivre un colis',
                'Problème de livraison'
            ]
        ];
    }

    private function handleGeneralHelp(string $message, ?User $user): array
    {
        return [
            'message' => 'Je suis là pour vous aider ! Voici ce que je peux faire pour vous :',
            'type' => 'text',
            'options' => [
                'Trouver des produits',
                'Aide avec une commande',
                'Informations de livraison',
                'Support paiement',
                'Contacter un vendeur',
                'FAQ complète'
            ]
        ];
    }

    private function handleGeneralResponse(string $message, ?User $user): array
    {
        // Use OpenAI for general responses
        try {
            $aiResponse = $this->getOpenAIResponse($message, $user);
            return [
                'message' => $aiResponse,
                'type' => 'text'
            ];
        } catch (\Exception $e) {
            return [
                'message' => 'Je ne suis pas sûr de comprendre. Pouvez-vous reformuler votre question ou choisir une option ci-dessous ?',
                'type' => 'text',
                'options' => [
                    'Aide générale',
                    'Contacter le support',
                    'FAQ'
                ]
            ];
        }
    }

    private function getOpenAIResponse(string $message, ?User $user): string
    {
        $systemPrompt = "Tu es un assistant virtuel pour LinkMarket, une plateforme e-commerce B2B qui met en relation vendeurs et fournisseurs. Tu dois être utile, professionnel et concis. Réponds en français.";
        
        if ($user) {
            $systemPrompt .= " L'utilisateur s'appelle {$user->getFirstName()} et est un {$user->getRole()}.";
        }

        $response = $this->httpClient->request('POST', 'https://api.openai.com/v1/chat/completions', [
            'headers' => [
                'Authorization' => 'Bearer ' . $this->openaiApiKey,
                'Content-Type' => 'application/json',
            ],
            'json' => [
                'model' => 'gpt-3.5-turbo',
                'messages' => [
                    ['role' => 'system', 'content' => $systemPrompt],
                    ['role' => 'user', 'content' => $message]
                ],
                'max_tokens' => 150,
                'temperature' => 0.7
            ]
        ]);

        $data = $response->toArray();
        return $data['choices'][0]['message']['content'] ?? 'Désolé, je ne peux pas répondre pour le moment.';
    }

    private function extractKeywords(string $message): array
    {
        // Simple keyword extraction
        $words = explode(' ', strtolower($message));
        $stopWords = ['le', 'la', 'les', 'un', 'une', 'des', 'de', 'du', 'et', 'ou', 'je', 'tu', 'il', 'elle', 'nous', 'vous', 'ils', 'elles'];
        
        return array_filter($words, function($word) use ($stopWords) {
            return strlen($word) > 2 && !in_array($word, $stopWords);
        });
    }

    private function searchProducts(array $keywords, int $limit = 5): array
    {
        $qb = $this->entityManager->getRepository(Product::class)->createQueryBuilder('p');
        
        $orConditions = [];
        $parameters = [];
        
        foreach ($keywords as $i => $keyword) {
            $orConditions[] = "p.title LIKE :keyword{$i}";
            $orConditions[] = "p.description LIKE :keyword{$i}";
            $parameters["keyword{$i}"] = "%{$keyword}%";
        }
        
        if (!empty($orConditions)) {
            $qb->where(implode(' OR ', $orConditions));
            foreach ($parameters as $key => $value) {
                $qb->setParameter($key, $value);
            }
        }
        
        return $qb->andWhere('p.status = :status')
            ->setParameter('status', 'active')
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    }

    public function getSuggestions(?User $user, string $context = 'general'): array
    {
        $suggestions = [];
        
        switch ($context) {
            case 'product':
                $suggestions = [
                    'Quels sont vos produits les plus populaires ?',
                    'Avez-vous des promotions en cours ?',
                    'Comment puis-je contacter le vendeur ?',
                    'Quels sont les délais de livraison ?'
                ];
                break;
                
            case 'order':
                $suggestions = [
                    'Où en est ma commande ?',
                    'Comment modifier ma commande ?',
                    'Problème avec ma livraison',
                    'Comment retourner un produit ?'
                ];
                break;
                
            default:
                $suggestions = [
                    'Comment ça marche ?',
                    'Trouver des produits',
                    'Aide avec une commande',
                    'Contacter le support'
                ];
        }
        
        return $suggestions;
    }

    public function saveFeedback(string $sessionId, int $rating, ?string $comment, ?User $user): void
    {
        // Save feedback to database or analytics service
        // This could be implemented with a Feedback entity
    }

    private function storeConversationHistory(string $sessionId, string $message, array $response, ?User $user): void
    {
        if (!isset($this->conversationHistory[$sessionId])) {
            $this->conversationHistory[$sessionId] = [];
        }
        
        $this->conversationHistory[$sessionId][] = [
            'timestamp' => new \DateTime(),
            'user_message' => $message,
            'bot_response' => $response,
            'user_id' => $user?->getId()
        ];
    }
}