<?php

namespace App\Service;

use App\Entity\Order;
use App\Entity\User;
use App\Entity\Notification;
use App\Entity\Shipping;
use App\Entity\LiveStream;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class NotificationService
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private MailerInterface $mailer,
        private HttpClientInterface $httpClient,
        private string $firebaseServerKey,
        private string $pusherAppId,
        private string $pusherKey,
        private string $pusherSecret,
        private string $pusherCluster
    ) {}

    public function sendOrderConfirmation(Order $order): void
    {
        // Create notification
        $notification = new Notification();
        $notification->setUser($order->getBuyer());
        $notification->setType('order');
        $notification->setTitle('Commande confirmée');
        $notification->setMessage("Votre commande {$order->getOrderNumber()} a été confirmée !");
        $notification->setActionUrl("/orders/{$order->getId()}");
        $notification->setPriority('high');
        
        $this->entityManager->persist($notification);
        $this->entityManager->flush();
        
        // Send email confirmation
        $this->sendOrderConfirmationEmail($order);
        
        // Send push notification
        $this->sendPushNotification(
            $order->getBuyer(),
            'Commande confirmée',
            "Votre commande {$order->getOrderNumber()} a été confirmée !"
        );
        
        // Send SMS if phone number available
        if ($order->getBuyer()->getPhone()) {
            $this->sendSMS(
                $order->getBuyer()->getPhone(),
                "LinkMarket: Votre commande {$order->getOrderNumber()} a été confirmée. Merci !"
            );
        }
    }

    public function sendNewOrderNotification(Order $order): void
    {
        if ($order->getSeller()) {
            // Create notification
            $notification = new Notification();
            $notification->setUser($order->getSeller());
            $notification->setType('order');
            $notification->setTitle('Nouvelle commande');
            $notification->setMessage("Nouvelle commande {$order->getOrderNumber()} reçue !");
            $notification->setActionUrl("/orders/{$order->getId()}");
            $notification->setPriority('high');
            
            $this->entityManager->persist($notification);
            $this->entityManager->flush();
            
            // Email to seller
            $this->sendNewOrderEmail($order);
            
            // Push notification to seller
            $this->sendPushNotification(
                $order->getSeller(),
                'Nouvelle commande',
                "Nouvelle commande {$order->getOrderNumber()} reçue !"
            );
        }
    }

    public function sendOrderStatusUpdate(Order $order, string $oldStatus): void
    {
        $statusMessages = [
            'confirmed' => 'Votre commande a été confirmée',
            'processing' => 'Votre commande est en préparation',
            'shipped' => 'Votre commande a été expédiée',
            'delivered' => 'Votre commande a été livrée',
            'cancelled' => 'Votre commande a été annulée'
        ];

        $message = $statusMessages[$order->getStatus()] ?? 'Statut de commande mis à jour';

        // Create notification
        $notification = new Notification();
        $notification->setUser($order->getBuyer());
        $notification->setType('order');
        $notification->setTitle('Mise à jour de commande');
        $notification->setMessage($message . " - {$order->getOrderNumber()}");
        $notification->setActionUrl("/orders/{$order->getId()}");
        
        $this->entityManager->persist($notification);
        $this->entityManager->flush();

        $this->sendPushNotification(
            $order->getBuyer(),
            'Mise à jour de commande',
            $message . " - {$order->getOrderNumber()}"
        );

        $this->sendOrderStatusEmail($order, $message);
    }

    public function sendPaymentFailureNotification(Order $order): void
    {
        // Create notification
        $notification = new Notification();
        $notification->setUser($order->getBuyer());
        $notification->setType('payment');
        $notification->setTitle('Problème de paiement');
        $notification->setMessage("Le paiement de votre commande {$order->getOrderNumber()} a échoué");
        $notification->setActionUrl("/orders/{$order->getId()}/retry-payment");
        $notification->setPriority('urgent');
        
        $this->entityManager->persist($notification);
        $this->entityManager->flush();

        $this->sendPushNotification(
            $order->getBuyer(),
            'Problème de paiement',
            "Le paiement de votre commande {$order->getOrderNumber()} a échoué"
        );

        $this->sendPaymentFailureEmail($order);
    }

    public function sendShippingUpdate(Shipping $shipping): void
    {
        $order = $shipping->getOrder();
        $buyer = $order->getBuyer();
        
        $statusMessages = [
            'picked_up' => 'Votre colis a été pris en charge',
            'in_transit' => 'Votre colis est en transit',
            'out_for_delivery' => 'Votre colis est en cours de livraison',
            'delivered' => 'Votre colis a été livré',
            'failed' => 'Échec de livraison de votre colis'
        ];
        
        $message = $statusMessages[$shipping->getStatus()] ?? 'Mise à jour de livraison';
        
        // Create notification
        $notification = new Notification();
        $notification->setUser($buyer);
        $notification->setType('order');
        $notification->setTitle('Mise à jour de livraison');
        $notification->setMessage($message . " - Commande {$order->getOrderNumber()}");
        $notification->setActionUrl("/orders/{$order->getId()}/tracking");
        
        if ($shipping->getStatus() === 'delivered' || $shipping->getStatus() === 'failed') {
            $notification->setPriority('high');
        }
        
        $this->entityManager->persist($notification);
        $this->entityManager->flush();
        
        // Send push notification
        $this->sendPushNotification(
            $buyer,
            'Mise à jour de livraison',
            $message . " - Commande {$order->getOrderNumber()}"
        );
        
        // Send email
        $this->sendShippingUpdateEmail($shipping, $message);
    }

    public function sendLiveStreamNotification(User $streamer, string $title): void
    {
        // Notify followers that streamer is going live
        // This would require a followers/subscribers system
        
        $message = "{$streamer->getFirstName()} est en direct : {$title}";
        
        // Get followers (mock implementation)
        $followers = $this->getMockFollowers($streamer);
        
        foreach ($followers as $follower) {
            // Create notification
            $notification = new Notification();
            $notification->setUser($follower);
            $notification->setType('live_stream');
            $notification->setTitle('Live en cours');
            $notification->setMessage($message);
            $notification->setActionUrl("/live/{$streamer->getId()}");
            
            $this->entityManager->persist($notification);
            
            // Send push notification
            $this->sendPushNotification($follower, 'Live en cours', $message);
        }
        
        $this->entityManager->flush();
    }

    public function sendNewMessageNotification(User $recipient, User $sender, string $conversationId): void
    {
        // Create notification
        $notification = new Notification();
        $notification->setUser($recipient);
        $notification->setType('message');
        $notification->setTitle('Nouveau message');
        $notification->setMessage("Vous avez reçu un message de {$sender->getFirstName()} {$sender->getLastName()}");
        $notification->setActionUrl("/messages/{$conversationId}");
        
        $this->entityManager->persist($notification);
        $this->entityManager->flush();
        
        // Send push notification
        $this->sendPushNotification(
            $recipient,
            'Nouveau message',
            "Vous avez reçu un message de {$sender->getFirstName()} {$sender->getLastName()}"
        );
    }

    public function sendNewReviewNotification(User $recipient, User $reviewer, string $targetType, int $targetId): void
    {
        // Create notification
        $notification = new Notification();
        $notification->setUser($recipient);
        $notification->setType('review');
        $notification->setTitle('Nouvel avis');
        $notification->setMessage("{$reviewer->getFirstName()} {$reviewer->getLastName()} a laissé un avis");
        
        if ($targetType === 'product') {
            $notification->setActionUrl("/products/{$targetId}#reviews");
        } elseif ($targetType === 'user') {
            $notification->setActionUrl("/profile/{$targetId}#reviews");
        }
        
        $this->entityManager->persist($notification);
        $this->entityManager->flush();
        
        // Send push notification
        $this->sendPushNotification(
            $recipient,
            'Nouvel avis',
            "{$reviewer->getFirstName()} {$reviewer->getLastName()} a laissé un avis"
        );
    }

    public function sendLowStockNotification(User $seller, int $productId, string $productTitle, int $currentStock): void
    {
        // Create notification
        $notification = new Notification();
        $notification->setUser($seller);
        $notification->setType('product');
        $notification->setTitle('Stock faible');
        $notification->setMessage("Le produit \"{$productTitle}\" n'a plus que {$currentStock} unités en stock");
        $notification->setActionUrl("/products/{$productId}/edit");
        $notification->setPriority('medium');
        
        $this->entityManager->persist($notification);
        $this->entityManager->flush();
        
        // Send push notification
        $this->sendPushNotification(
            $seller,
            'Stock faible',
            "Le produit \"{$productTitle}\" n'a plus que {$currentStock} unités en stock"
        );
    }

    public function sendSystemNotification(User $user, string $title, string $message, ?string $actionUrl = null, string $priority = 'medium'): void
    {
        // Create notification
        $notification = new Notification();
        $notification->setUser($user);
        $notification->setType('system');
        $notification->setTitle($title);
        $notification->setMessage($message);
        
        if ($actionUrl) {
            $notification->setActionUrl($actionUrl);
        }
        
        $notification->setPriority($priority);
        
        $this->entityManager->persist($notification);
        $this->entityManager->flush();
        
        // Send push notification for high priority
        if ($priority === 'high' || $priority === 'urgent') {
            $this->sendPushNotification($user, $title, $message);
        }
    }

    public function sendMarketingNotification(User $user, string $title, string $message, string $actionUrl, \DateTime $expiresAt): void
    {
        // Check user preferences
        $preferences = $user->getPreferences()['notifications'] ?? [];
        if (isset($preferences['marketing']) && $preferences['marketing'] === false) {
            return;
        }
        
        // Create notification
        $notification = new Notification();
        $notification->setUser($user);
        $notification->setType('marketing');
        $notification->setTitle($title);
        $notification->setMessage($message);
        $notification->setActionUrl($actionUrl);
        $notification->setPriority('low');
        $notification->setExpiresAt($expiresAt);
        
        $this->entityManager->persist($notification);
        $this->entityManager->flush();
    }

    private function sendOrderConfirmationEmail(Order $order): void
    {
        $itemsList = '';
        foreach ($order->getOrderItems() as $item) {
            $itemsList .= "<tr>
                <td>{$item->getProduct()->getTitle()}</td>
                <td>{$item->getQuantity()}</td>
                <td>€{$item->getUnitPrice()}</td>
                <td>€{$item->getTotalPrice()}</td>
            </tr>";
        }

        $email = (new Email())
            ->from('noreply@linkmarket.com')
            ->to($order->getBuyer()->getEmail())
            ->subject("Confirmation de commande - {$order->getOrderNumber()}")
            ->html($this->generateOrderConfirmationEmailTemplate($order));

        $this->mailer->send($email);
    }

    private function sendNewOrderEmail(Order $order): void
    {
        $email = (new Email())
            ->from('noreply@linkmarket.com')
            ->to($order->getSeller()->getEmail())
            ->subject("Nouvelle commande - {$order->getOrderNumber()}")
            ->html($this->generateNewOrderEmailTemplate($order));

        $this->mailer->send($email);
    }

    private function sendOrderStatusEmail(Order $order, string $message): void
    {
        $email = (new Email())
            ->from('noreply@linkmarket.com')
            ->to($order->getBuyer()->getEmail())
            ->subject("Mise à jour de commande - {$order->getOrderNumber()}")
            ->html($this->generateOrderStatusEmailTemplate($order, $message));

        $this->mailer->send($email);
    }

    private function sendPaymentFailureEmail(Order $order): void
    {
        $email = (new Email())
            ->from('noreply@linkmarket.com')
            ->to($order->getBuyer()->getEmail())
            ->subject("Problème de paiement - {$order->getOrderNumber()}")
            ->html($this->generatePaymentFailureEmailTemplate($order));

        $this->mailer->send($email);
    }

    private function sendShippingUpdateEmail(Shipping $shipping, string $message): void
    {
        $order = $shipping->getOrder();
        
        $email = (new Email())
            ->from('noreply@linkmarket.com')
            ->to($order->getBuyer()->getEmail())
            ->subject("Mise à jour de livraison - {$order->getOrderNumber()}")
            ->html($this->generateShippingUpdateEmailTemplate($shipping, $message));

        $this->mailer->send($email);
    }

    private function sendPushNotification(User $user, string $title, string $body): void
    {
        // Check user preferences
        $preferences = $user->getPreferences()['notifications'] ?? [];
        if (isset($preferences['push']) && $preferences['push'] === false) {
            return;
        }
        
        // Firebase Cloud Messaging implementation
        try {
            $this->httpClient->request('POST', 'https://fcm.googleapis.com/fcm/send', [
                'headers' => [
                    'Authorization' => 'key=' . $this->firebaseServerKey,
                    'Content-Type' => 'application/json',
                ],
                'json' => [
                    'to' => '/topics/user_' . $user->getId(), // Assuming user subscribed to their topic
                    'notification' => [
                        'title' => $title,
                        'body' => $body,
                        'icon' => '/icon-192x192.png',
                        'badge' => '/badge-72x72.png'
                    ],
                    'data' => [
                        'click_action' => 'https://linkmarket.com/notifications',
                        'user_id' => $user->getId()
                    ]
                ]
            ]);
        } catch (\Exception $e) {
            // Log error but don't fail the main process
            error_log('Push notification failed: ' . $e->getMessage());
        }
    }

    private function sendSMS(string $phoneNumber, string $message): void
    {
        // SMS implementation (could use Twilio, Nexmo, etc.)
        // For now, just log the SMS
        error_log("SMS to {$phoneNumber}: {$message}");
    }

    private function generateOrderConfirmationEmailTemplate(Order $order): string
    {
        $itemsList = '';
        foreach ($order->getOrderItems() as $item) {
            $itemsList .= "<tr>
                <td>{$item->getProduct()->getTitle()}</td>
                <td>{$item->getQuantity()}</td>
                <td>€{$item->getUnitPrice()}</td>
                <td>€{$item->getTotalPrice()}</td>
            </tr>";
        }

        return "
        <html>
        <body style='font-family: Arial, sans-serif;'>
            <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
                <h1 style='color: #2563eb;'>Confirmation de commande</h1>
                <p>Bonjour {$order->getBuyer()->getFirstName()},</p>
                <p>Votre commande <strong>{$order->getOrderNumber()}</strong> a été confirmée avec succès !</p>
                
                <h2>Détails de la commande :</h2>
                <table style='width: 100%; border-collapse: collapse; margin: 20px 0;'>
                    <thead>
                        <tr style='background-color: #f3f4f6;'>
                            <th style='padding: 10px; text-align: left; border: 1px solid #ddd;'>Produit</th>
                            <th style='padding: 10px; text-align: left; border: 1px solid #ddd;'>Quantité</th>
                            <th style='padding: 10px; text-align: left; border: 1px solid #ddd;'>Prix unitaire</th>
                            <th style='padding: 10px; text-align: left; border: 1px solid #ddd;'>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {$itemsList}
                    </tbody>
                </table>
                
                <div style='text-align: right; margin: 20px 0;'>
                    <p><strong>Sous-total: €{$order->getSubtotal()}</strong></p>
                    <p><strong>Livraison: €{$order->getShippingCost()}</strong></p>
                    <p><strong>Total: €{$order->getTotalAmount()}</strong></p>
                </div>
                
                <p>Vous recevrez un email de confirmation d'expédition dès que votre commande sera envoyée.</p>
                <p>Merci de votre confiance !</p>
                
                <hr style='margin: 30px 0;'>
                <p style='color: #6b7280; font-size: 12px;'>
                    LinkMarket - Votre plateforme B2B de confiance<br>
                    <a href='https://linkmarket.com'>www.linkmarket.com</a>
                </p>
            </div>
        </body>
        </html>";
    }

    private function generateNewOrderEmailTemplate(Order $order): string
    {
        return "
        <html>
        <body style='font-family: Arial, sans-serif;'>
            <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
                <h1 style='color: #2563eb;'>Nouvelle commande reçue !</h1>
                <p>Bonjour {$order->getSeller()->getFirstName()},</p>
                <p>Vous avez reçu une nouvelle commande <strong>{$order->getOrderNumber()}</strong>.</p>
                
                <h2>Détails :</h2>
                <ul>
                    <li><strong>Client :</strong> {$order->getBuyer()->getFirstName()} {$order->getBuyer()->getLastName()}</li>
                    <li><strong>Montant :</strong> €{$order->getTotalAmount()}</li>
                    <li><strong>Articles :</strong> {$order->getItemCount()}</li>
                </ul>
                
                <p>
                    <a href='https://linkmarket.com/orders/{$order->getId()}' 
                       style='background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;'>
                        Voir la commande
                    </a>
                </p>
                
                <p>Merci de traiter cette commande rapidement !</p>
            </div>
        </body>
        </html>";
    }

    private function generateOrderStatusEmailTemplate(Order $order, string $message): string
    {
        return "
        <html>
        <body style='font-family: Arial, sans-serif;'>
            <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
                <h1 style='color: #2563eb;'>Mise à jour de votre commande</h1>
                <p>Bonjour {$order->getBuyer()->getFirstName()},</p>
                <p>{$message} - <strong>{$order->getOrderNumber()}</strong></p>
                
                " . ($order->getTrackingNumber() ? "
                <p><strong>Numéro de suivi :</strong> {$order->getTrackingNumber()}</p>
                " : "") . "
                
                <p>
                    <a href='https://linkmarket.com/orders/{$order->getId()}' 
                       style='background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;'>
                        Suivre ma commande
                    </a>
                </p>
            </div>
        </body>
        </html>";
    }

    private function generatePaymentFailureEmailTemplate(Order $order): string
    {
        return "
        <html>
        <body style='font-family: Arial, sans-serif;'>
            <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
                <h1 style='color: #dc2626;'>Problème de paiement</h1>
                <p>Bonjour {$order->getBuyer()->getFirstName()},</p>
                <p>Le paiement de votre commande <strong>{$order->getOrderNumber()}</strong> a échoué.</p>
                
                <p>Veuillez réessayer le paiement ou contacter notre support.</p>
                
                <p>
                    <a href='https://linkmarket.com/orders/{$order->getId()}/retry-payment' 
                       style='background-color: #dc2626; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;'>
                        Réessayer le paiement
                    </a>
                </p>
            </div>
        </body>
        </html>";
    }

    private function generateShippingUpdateEmailTemplate(Shipping $shipping, string $message): string
    {
        $order = $shipping->getOrder();
        
        return "
        <html>
        <body style='font-family: Arial, sans-serif;'>
            <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
                <h1 style='color: #2563eb;'>Mise à jour de livraison</h1>
                <p>Bonjour {$order->getBuyer()->getFirstName()},</p>
                <p>{$message} - Commande <strong>{$order->getOrderNumber()}</strong></p>
                
                <div style='background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;'>
                    <p><strong>Transporteur :</strong> {$shipping->getCarrier()}</p>
                    <p><strong>Numéro de suivi :</strong> {$shipping->getTrackingNumber()}</p>
                    <p><strong>Statut :</strong> {$shipping->getStatus()}</p>
                    " . ($shipping->getEstimatedDelivery() ? "
                    <p><strong>Livraison estimée :</strong> {$shipping->getEstimatedDelivery()->format('d/m/Y')}</p>
                    " : "") . "
                </div>
                
                <p>
                    <a href='{$shipping->getTrackingUrl()}' 
                       style='background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;'>
                        Suivre mon colis
                    </a>
                </p>
                
                <p>
                    <a href='https://linkmarket.com/orders/{$order->getId()}' 
                       style='background-color: #4b5563; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;'>
                        Détails de la commande
                    </a>
                </p>
            </div>
        </body>
        </html>";
    }

    private function getMockFollowers(User $user): array
    {
        // This is a mock implementation
        // In a real app, you would query the database for followers
        
        $followers = [];
        
        // Create 5 mock followers
        for ($i = 1; $i <= 5; $i++) {
            $follower = new User();
            $follower->setId($i);
            $follower->setEmail("follower{$i}@example.com");
            $follower->setFirstName("Follower");
            $follower->setLastName("$i");
            
            $followers[] = $follower;
        }
        
        return $followers;
    }
}