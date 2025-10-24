<?php

namespace App\Service;

use App\Entity\User;
use App\Entity\Product;
use App\Entity\Order;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

class ChatbotService
{
    private EntityManagerInterface $entityManager;
    private HttpClientInterface $httpClient;
    private string $openaiApiKey;
    private array $conversationHistory = [];

    public function __construct(
        EntityManagerInterface $entityManager,
        HttpClientInterface $httpClient,
        #[Autowire('%env(OPENAI_API_KEY)%')]
        string $openaiApiKey
    ) {
        $this->entityManager = $entityManager;
        $this->httpClient = $httpClient;
        $this->openaiApiKey = $openaiApiKey;
    }

    public function processMessage(string $message, ?User $user = null, string $sessionId = '', array $context = []): array
    {
        $intent = $this->analyzeIntent($message);
        $response = $this->generateResponse($message, $intent, $user, $context);
        $this->storeConversationHistory($sessionId, $message, $response, $user);

        return $response;
    }

    private function analyzeIntent(string $message): string
    {
        $message = mb_strtolower($message);

        if (preg_match('/\b(cherche|trouve|produit|article|acheter|vendre)\b/', $message)) {
            return 'product_search';
        }

        if (preg_match('/\b(commande|order|livraison|suivi|tracking)\b/', $message)) {
            return 'order_inquiry';
        }

        if (preg_match('/\b(paiement|payment|carte|paypal|stripe)\b/', $message)) {
            return 'payment_help';
        }

        if (preg_match('/\b(compte|profil|inscription|connexion|mot de passe)\b/', $message)) {
            return 'account_help';
        }

        if (preg_match('/\b(livraison|expédition|frais de port|délai)\b/', $message)) {
            return 'shipping_info';
        }

        if (preg_match('/\b(aide|help|comment|pourquoi|quoi)\b/', $message)) {
            return 'general_help';
        }

        return 'general';
    }

    private function generateResponse(string $message, string $intent, ?User $user, array $context): array
    {
        return match ($intent) {
            'product_search' => $this->handleProductSearch($message, $user),
            'order_inquiry' => $this->handleOrderInquiry($message, $user),
            'payment_help' => $this->handlePaymentHelp($message, $user),
            'account_help' => $this->handleAccountHelp($message, $user),
            'shipping_info' => $this->handleShippingInfo($message, $user),
            'general_help' => $this->handleGeneralHelp($message, $user),
            default => $this->handleGeneralResponse($message, $user),
        };
    }

    private function handleProductSearch(string $message, ?User $user): array
    {
        $keywords = $this->extractKeywords($message);
        $products = $this->searchProducts($keywords, 3);

        if (empty($products)) {
            return [
                'message' => "Je n'ai pas trouvé de produits correspondant à votre recherche. Voulez-vous que je vous aide à affiner votre recherche ?",
                'type' => 'text',
                'options' => [
                    'Voir toutes les catégories',
                    'Produits populaires',
                    'Nouveautés',
                    'Promotions',
                ],
            ];
        }

        $productList = '';
        foreach ($products as $product) {
            $productList .= "• {$product->getTitle()} - €{$product->getPrice()}\n";
        }

        return [
            'message' => "Voici quelques produits qui pourraient vous intéresser :\n\n{$productList}\nSouhaitez-vous voir plus de détails sur l'un de ces produits ?",
            'type' => 'product_list',
            'products' => array_map(function (Product $product) {
                // Assure que getImages() renvoie un tableau (sinon [] par défaut)
                $images = $product->getImages() ?? [];
                $firstImage = $images[0] ?? null;

                return [
                    'id' => $product->getId(),
                    'title' => $product->getTitle(),
                    'price' => $product->getPrice(),
                    'image' => $firstImage,
                ];
            }, $products),
            'options' => [
                'Voir plus de produits',
                'Affiner la recherche',
                'Contacter un vendeur',
            ],
        ];
    }

    private function handleOrderInquiry(string $message, ?User $user): array
    {
        if (!$user) {
            return [
                'message' => 'Pour consulter vos commandes, vous devez être connecté. Souhaitez-vous vous connecter ?',
                'type' => 'text',
                'actions' => ['login'],
                'options' => ['Se connecter', 'Créer un compte'],
            ];
        }

        $orders = $this->entityManager->getRepository(Order::class)
            ->findBy(['buyer' => $user], ['createdAt' => 'DESC'], 3);

        if (empty($orders)) {
            return [
                'message' => 'Vous n\'avez pas encore passé de commandes. Voulez-vous découvrir nos produits ?',
                'type' => 'text',
                'options' => [
                    'Voir les produits',
                    'Voir les promotions',
                    'Contacter le support',
                ],
            ];
        }

        $orderList = "Voici vos dernières commandes :\n\n";
        foreach ($orders as $order) {
            $orderList .= "• Commande {$order->getOrderNumber()} - {$order->getStatus()} - €{$order->getTotalAmount()}\n";
        }

        return [
            'message' => $orderList . "\nSur quelle commande avez-vous besoin d'aide ?",
            'type' => 'order_list',
            'orders' => array_map(function (Order $order) {
                return [
                    'id' => $order->getId(),
                    'orderNumber' => $order->getOrderNumber(),
                    'status' => $order->getStatus(),
                    'totalAmount' => $order->getTotalAmount(),
                ];
            }, $orders),
            'options' => [
                'Suivre une commande',
                'Problème de livraison',
                'Retourner un produit',
            ],
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
                'Demander un remboursement',
            ],
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
                    'Mot de passe oublié',
                ],
            ];
        }

        return [
            'message' => "Bonjour {$user->getFirstName()} ! Comment puis-je vous aider avec votre compte ?",
            'type' => 'text',
            'options' => [
                'Modifier mon profil',
                'Changer mon mot de passe',
                'Gérer mes préférences',
                'Supprimer mon compte',
            ],
        ];
    }

    private function handleShippingInfo(string $message, ?User $user): array
    {
        return [
            'message' => "Voici les informations sur la livraison :\n\n" .
                "• Livraison gratuite dès 100€ d'achat\n" .
                "• Délai standard : 2-5 jours ouvrés\n" .
                "• Livraison express : 24-48h (supplément)\n" .
                "• Suivi en temps réel disponible\n\n" .
                "Que souhaitez-vous savoir de plus ?",
            'type' => 'text',
            'options' => [
                'Calculer les frais de port',
                'Zones de livraison',
                'Suivre un colis',
                'Problème de livraison',
            ],
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
                'FAQ complète',
            ],
        ];
    }

    private function handleGeneralResponse(string $message, ?User $user): array
    {
        try {
            $aiResponse = $this->getOpenAIResponse($message, $user);

            return [
                'message' => $aiResponse,
                'type' => 'text',
            ];
        } catch (\Exception $e) {
            return [
                'message' => 'Je ne suis pas sûr de comprendre. Pouvez-vous reformuler votre question ou choisir une option ci-dessous ?',
                'type' => 'text',
                'options' => [
                    'Aide générale',
                    'Contacter le support',
                    'FAQ',
                ],
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
                    ['role' => 'user', 'content' => $message],
                ],
                'max_tokens' => 150,
                'temperature' => 0.7,
            ],
        ]);

        $data = $response->toArray();

        return $data['choices'][0]['message']['content'] ?? 'Désolé, je ne peux pas répondre pour le moment.';
    }

    private function extractKeywords(string $message): array
    {
        $words = preg_split('/\s+/', mb_strtolower($message));
        $stopWords = ['le', 'la', 'les', 'un', 'une', 'des', 'de', 'du', 'et', 'ou', 'je', 'tu', 'il', 'elle', 'nous', 'vous', 'ils', 'elles'];

        return array_filter($words, function ($word) use ($stopWords) {
            return strlen($word) > 2 && !in_array($word, $stopWords, true);
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

        $qb->setMaxResults($limit);

        return $qb->getQuery()->getResult();
    }

    private function storeConversationHistory(string $sessionId, string $userMessage, array $botResponse, ?User $user): void
    {
        $this->conversationHistory[$sessionId][] = [
            'timestamp' => new \DateTime(),
            'user' => $user ? $user->getId() : null,
            'userMessage' => $userMessage,
            'botResponse' => $botResponse,
        ];

        // Optionnel : Persister dans la base de données ou un système de cache
    }
}
