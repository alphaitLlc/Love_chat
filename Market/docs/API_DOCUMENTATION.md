# 📚 LinkMarket API - Documentation Complète

## 🌟 Vue d'ensemble

LinkMarket API est une plateforme B2B révolutionnaire qui combine e-commerce, live shopping et intelligence artificielle. Cette API RESTful offre toutes les fonctionnalités nécessaires pour créer une marketplace moderne et interactive.

## 🚀 Démarrage Rapide

### URL de Base
```
Production: https://api.linkmarket.com
Staging: https://staging-api.linkmarket.com
Développement: http://localhost:8000
```

### Authentification
Toutes les requêtes authentifiées nécessitent un token JWT dans l'en-tête:
```http
Authorization: Bearer {votre_token_jwt}
```

## 📋 Table des Matières

1. [Authentification](#authentification)
2. [Utilisateurs](#utilisateurs)
3. [Produits](#produits)
4. [Catégories](#catégories)
5. [Commandes](#commandes)
6. [Paiements](#paiements)
7. [Live Streaming](#live-streaming)
8. [Messagerie](#messagerie)
9. [Chatbot](#chatbot)
10. [Analytics](#analytics)
11. [Notifications](#notifications)
12. [Gestion des Erreurs](#gestion-des-erreurs)

---

## 🔐 Authentification

### Inscription
```http
POST /api/register
```

**Body:**
```json
{
  "email": "user@example.com",
  "password": "motdepasse123",
  "firstName": "Jean",
  "lastName": "Dupont",
  "role": "vendor",
  "company": "Ma Société",
  "phone": "+33123456789"
}
```

**Réponse:**
```json
{
  "message": "Utilisateur créé avec succès",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "Jean",
    "lastName": "Dupont",
    "role": "vendor",
    "isVerified": false,
    "subscription": "free",
    "joinedAt": "2024-01-15T10:30:00Z"
  },
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9..."
}
```

### Connexion
```http
POST /api/login_check
```

**Body:**
```json
{
  "username": "user@example.com",
  "password": "motdepasse123"
}
```

**Réponse:**
```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9...",
  "refresh_token": "def50200...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "Jean",
    "lastName": "Dupont",
    "role": "vendor"
  }
}
```

### Profil Utilisateur
```http
GET /api/profile
Authorization: Bearer {token}
```

**Réponse:**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "Jean",
    "lastName": "Dupont",
    "role": "vendor",
    "company": "Ma Société",
    "phone": "+33123456789",
    "rating": 4.8,
    "reviewCount": 156,
    "isVerified": true,
    "badges": ["Top Seller", "Verified"],
    "subscription": "premium",
    "preferences": {
      "language": "fr",
      "currency": "EUR",
      "notifications": {
        "email": true,
        "push": true
      }
    }
  }
}
```

---

## 👥 Utilisateurs

### Liste des Utilisateurs
```http
GET /api/users
Authorization: Bearer {token}
```

**Query Parameters:**
- `page`: Numéro de page (défaut: 1)
- `itemsPerPage`: Éléments par page (défaut: 20)
- `role`: Filtrer par rôle (vendor, supplier, client, admin)
- `verified`: Filtrer par statut de vérification (true/false)

### Utilisateur Public
```http
GET /api/users/{id}/public
```

**Réponse:**
```json
{
  "id": 1,
  "firstName": "Jean",
  "lastName": "Dupont",
  "company": "Ma Société",
  "rating": 4.8,
  "reviewCount": 156,
  "isVerified": true,
  "badges": ["Top Seller"],
  "joinedAt": "2024-01-15T10:30:00Z"
}
```

---

## 📦 Produits

### Liste des Produits
```http
GET /api/products
```

**Query Parameters:**
- `page`: Numéro de page
- `itemsPerPage`: Éléments par page
- `category`: ID de catégorie
- `search`: Recherche textuelle
- `minPrice`: Prix minimum
- `maxPrice`: Prix maximum
- `inStock`: Produits en stock uniquement
- `promoted`: Produits promus uniquement

**Réponse:**
```json
{
  "@context": "/api/contexts/Product",
  "@id": "/api/products",
  "@type": "hydra:Collection",
  "hydra:member": [
    {
      "@id": "/api/products/1",
      "@type": "Product",
      "id": 1,
      "title": "Smartphone Galaxy Pro",
      "description": "Dernier modèle avec écran OLED 6.7\"",
      "price": "899.99",
      "originalPrice": "1199.99",
      "images": [
        "https://cdn.linkmarket.com/products/smartphone-1.jpg"
      ],
      "category": {
        "@id": "/api/categories/1",
        "name": "Électronique"
      },
      "owner": {
        "@id": "/api/users/2",
        "firstName": "Marie",
        "lastName": "Martin"
      },
      "stock": 45,
      "rating": "4.8",
      "reviewCount": 156,
      "isPromoted": true,
      "status": "active",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "hydra:totalItems": 1250,
  "hydra:view": {
    "@id": "/api/products?page=1",
    "@type": "hydra:PartialCollectionView",
    "hydra:first": "/api/products?page=1",
    "hydra:last": "/api/products?page=63",
    "hydra:next": "/api/products?page=2"
  }
}
```

### Détail d'un Produit
```http
GET /api/products/{id}
```

### Créer un Produit
```http
POST /api/products
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "title": "Nouveau Smartphone",
  "description": "Description détaillée du produit",
  "price": "799.99",
  "originalPrice": "899.99",
  "category": "/api/categories/1",
  "stock": 100,
  "minOrder": 1,
  "maxOrder": 50,
  "images": [
    "https://cdn.linkmarket.com/products/new-phone-1.jpg",
    "https://cdn.linkmarket.com/products/new-phone-2.jpg"
  ],
  "tags": ["smartphone", "android", "5G"],
  "specifications": {
    "écran": "6.7 pouces OLED",
    "stockage": "256GB",
    "RAM": "12GB"
  },
  "shippingInfo": {
    "weight": "0.2",
    "dimensions": {
      "length": 15,
      "width": 7,
      "height": 1
    }
  },
  "status": "active"
}
```

### Mettre à Jour un Produit
```http
PUT /api/products/{id}
Authorization: Bearer {token}
```

### Supprimer un Produit
```http
DELETE /api/products/{id}
Authorization: Bearer {token}
```

---

## 🏷️ Catégories

### Liste des Catégories
```http
GET /api/categories
```

**Réponse:**
```json
{
  "@context": "/api/contexts/Category",
  "@id": "/api/categories",
  "@type": "hydra:Collection",
  "hydra:member": [
    {
      "@id": "/api/categories/1",
      "@type": "Category",
      "id": 1,
      "name": "Électronique",
      "description": "Appareils électroniques et gadgets",
      "slug": "electronique",
      "icon": "smartphone",
      "color": "#3B82F6",
      "isActive": true,
      "parent": null,
      "children": [
        {
          "@id": "/api/categories/2",
          "name": "Smartphones"
        }
      ],
      "productCount": 1250
    }
  ]
}
```

### Créer une Catégorie
```http
POST /api/categories
Authorization: Bearer {token} (Admin uniquement)
```

---

## 🛒 Commandes

### Liste des Commandes
```http
GET /api/orders
Authorization: Bearer {token}
```

**Query Parameters:**
- `status`: Filtrer par statut
- `buyer`: ID de l'acheteur
- `seller`: ID du vendeur

### Détail d'une Commande
```http
GET /api/orders/{id}
Authorization: Bearer {token}
```

**Réponse:**
```json
{
  "@id": "/api/orders/1",
  "@type": "Order",
  "id": 1,
  "orderNumber": "ORD-2024-001",
  "buyer": {
    "@id": "/api/users/3",
    "firstName": "Sophie",
    "lastName": "Bernard"
  },
  "seller": {
    "@id": "/api/users/1",
    "firstName": "Jean",
    "lastName": "Dupont"
  },
  "orderItems": [
    {
      "id": 1,
      "product": {
        "@id": "/api/products/1",
        "title": "Smartphone Galaxy Pro"
      },
      "quantity": 2,
      "unitPrice": "899.99",
      "totalPrice": "1799.98"
    }
  ],
  "subtotal": "1799.98",
  "shippingCost": "0.00",
  "taxAmount": "359.99",
  "totalAmount": "2159.97",
  "status": "confirmed",
  "paymentStatus": "paid",
  "paymentMethod": "stripe",
  "shippingAddress": {
    "firstName": "Sophie",
    "lastName": "Bernard",
    "street": "123 Rue de la Paix",
    "city": "Paris",
    "zipCode": "75001",
    "country": "France"
  },
  "trackingNumber": "TRK123456789",
  "estimatedDelivery": "2024-01-20T00:00:00Z",
  "timeline": [
    {
      "status": "pending",
      "timestamp": "2024-01-15T10:30:00Z",
      "description": "Commande créée"
    },
    {
      "status": "confirmed",
      "timestamp": "2024-01-15T11:00:00Z",
      "description": "Commande confirmée"
    }
  ],
  "createdAt": "2024-01-15T10:30:00Z"
}
```

### Créer une Commande
```http
POST /api/orders
Authorization: Bearer {token}
```

**Body:**
```json
{
  "orderItems": [
    {
      "product": "/api/products/1",
      "quantity": 2,
      "selectedVariant": {
        "color": "noir",
        "storage": "256GB"
      }
    }
  ],
  "shippingAddress": {
    "firstName": "Sophie",
    "lastName": "Bernard",
    "street": "123 Rue de la Paix",
    "city": "Paris",
    "zipCode": "75001",
    "country": "France",
    "phone": "+33123456789"
  },
  "paymentMethod": "stripe",
  "notes": "Livraison en point relais"
}
```

### Mettre à Jour le Statut
```http
PUT /api/orders/{id}
Authorization: Bearer {token}
```

**Body:**
```json
{
  "status": "shipped",
  "trackingNumber": "TRK123456789",
  "carrier": "Colissimo"
}
```

---

## 💳 Paiements

### Créer un Intent de Paiement
```http
POST /api/payments/create-intent
Authorization: Bearer {token}
```

**Body:**
```json
{
  "items": [
    {
      "productId": 1,
      "quantity": 2
    }
  ],
  "shippingAddress": {
    "firstName": "Sophie",
    "lastName": "Bernard",
    "street": "123 Rue de la Paix",
    "city": "Paris",
    "zipCode": "75001",
    "country": "France"
  },
  "paymentMethod": "stripe",
  "currency": "EUR"
}
```

**Réponse:**
```json
{
  "orderId": 1,
  "orderNumber": "ORD-2024-001",
  "clientSecret": "pi_1234567890_secret_abcdef",
  "paymentIntentId": "pi_1234567890",
  "totalAmount": "2159.97",
  "currency": "EUR"
}
```

### Confirmer un Paiement
```http
POST /api/payments/confirm/{orderId}
Authorization: Bearer {token}
```

**Body:**
```json
{
  "paymentIntentId": "pi_1234567890"
}
```

### Webhook Stripe
```http
POST /api/payments/webhook/stripe
Stripe-Signature: {signature}
```

---

## 📺 Live Streaming

### Liste des Lives Publics
```http
GET /api/live-streams/public
```

**Réponse:**
```json
{
  "@context": "/api/contexts/LiveStream",
  "@id": "/api/live-streams/public",
  "@type": "hydra:Collection",
  "hydra:member": [
    {
      "@id": "/api/live_streams/1",
      "@type": "LiveStream",
      "id": 1,
      "title": "Découverte Nouveaux Smartphones 2024",
      "description": "Présentation exclusive des derniers modèles",
      "streamer": {
        "@id": "/api/users/1",
        "firstName": "Jean",
        "lastName": "Dupont",
        "company": "TechStore Pro"
      },
      "status": "live",
      "scheduledAt": "2024-01-15T15:00:00Z",
      "startedAt": "2024-01-15T15:02:00Z",
      "thumbnail": "https://cdn.linkmarket.com/streams/thumb-1.jpg",
      "viewerCount": 1234,
      "maxViewers": 1456,
      "products": [
        {
          "@id": "/api/products/1",
          "title": "Smartphone Galaxy Pro",
          "price": "899.99"
        }
      ],
      "tags": ["smartphone", "tech", "nouveautés"],
      "isPublic": true,
      "allowChat": true,
      "isLive": true
    }
  ]
}
```

### Créer un Live Stream
```http
POST /api/live_streams
Authorization: Bearer {token}
```

**Body:**
```json
{
  "title": "Ma Session Live Shopping",
  "description": "Présentation de mes nouveaux produits",
  "scheduledAt": "2024-01-20T15:00:00Z",
  "products": ["/api/products/1", "/api/products/2"],
  "thumbnail": "https://cdn.linkmarket.com/streams/my-thumb.jpg",
  "tags": ["mode", "nouveautés", "promo"],
  "isPublic": true,
  "allowChat": true,
  "recordStream": true,
  "settings": {
    "maxViewers": 1000,
    "chatModeration": true,
    "allowGifts": true
  }
}
```

### Messages de Chat Live
```http
GET /api/live_stream_messages?liveStream={id}
```

```http
POST /api/live_stream_messages
Authorization: Bearer {token}
```

**Body:**
```json
{
  "liveStream": "/api/live_streams/1",
  "content": "Super produit ! 👍",
  "type": "text"
}
```

---

## 💬 Messagerie

### Liste des Messages
```http
GET /api/messages
Authorization: Bearer {token}
```

**Query Parameters:**
- `conversationId`: ID de conversation
- `sender`: ID de l'expéditeur
- `receiver`: ID du destinataire

### Envoyer un Message
```http
POST /api/messages
Authorization: Bearer {token}
```

**Body:**
```json
{
  "receiver": "/api/users/2",
  "content": "Bonjour, je suis intéressé par votre produit",
  "type": "text",
  "relatedProduct": "/api/products/1"
}
```

### Marquer comme Lu
```http
PUT /api/messages/{id}
Authorization: Bearer {token}
```

**Body:**
```json
{
  "isRead": true
}
```

---

## 🤖 Chatbot

### Envoyer un Message au Chatbot
```http
POST /api/chatbot/chat
```

**Body:**
```json
{
  "message": "Je cherche un smartphone pas cher",
  "sessionId": "session_abc123",
  "context": {
    "page": "marketplace",
    "category": "electronique",
    "userRole": "client"
  }
}
```

**Réponse:**
```json
{
  "response": "Voici quelques smartphones abordables qui pourraient vous intéresser :",
  "type": "product_list",
  "products": [
    {
      "id": 1,
      "title": "Smartphone Budget Pro",
      "price": "299.99",
      "image": "https://cdn.linkmarket.com/products/budget-phone.jpg"
    }
  ],
  "options": [
    "Voir plus de produits",
    "Comparer les prix",
    "Contacter un vendeur"
  ],
  "actions": ["product_search"],
  "sessionId": "session_abc123",
  "context": {
    "intent": "product_search",
    "category": "smartphones",
    "priceRange": "budget"
  }
}
```

### Suggestions du Chatbot
```http
GET /api/chatbot/suggestions?context=product
```

**Réponse:**
```json
{
  "suggestions": [
    "Quels sont vos produits les plus populaires ?",
    "Avez-vous des promotions en cours ?",
    "Comment contacter le vendeur ?",
    "Quels sont les délais de livraison ?"
  ]
}
```

### Feedback Chatbot
```http
POST /api/chatbot/feedback
```

**Body:**
```json
{
  "sessionId": "session_abc123",
  "rating": 5,
  "comment": "Très utile, merci !"
}
```

---

## 📊 Analytics

### Métriques Utilisateur
```http
GET /api/analytics/user-metrics
Authorization: Bearer {token}
```

**Réponse:**
```json
{
  "period": "month",
  "data": {
    "sales": [
      {"date": "2024-01-01", "value": 4000, "change": 12.5},
      {"date": "2024-01-02", "value": 4200, "change": 5.0}
    ],
    "orders": [
      {"date": "2024-01-01", "value": 24, "change": 8.2}
    ],
    "visitors": [
      {"date": "2024-01-01", "value": 1250, "change": 15.3}
    ]
  },
  "summary": {
    "totalSales": 45678.99,
    "totalOrders": 234,
    "conversionRate": 7.12,
    "averageOrderValue": 195.25
  }
}
```

### Métriques Produit
```http
GET /api/analytics/product-metrics/{productId}
Authorization: Bearer {token}
```

### Métriques Live Stream
```http
GET /api/analytics/live-stream-metrics/{streamId}
Authorization: Bearer {token}
```

---

## 🔔 Notifications

### Liste des Notifications
```http
GET /api/notifications
Authorization: Bearer {token}
```

### Marquer comme Lue
```http
PUT /api/notifications/{id}/read
Authorization: Bearer {token}
```

### Préférences de Notification
```http
PUT /api/users/{id}/notification-preferences
Authorization: Bearer {token}
```

**Body:**
```json
{
  "email": true,
  "push": true,
  "sms": false,
  "marketing": true
}
```

---

## ❌ Gestion des Erreurs

### Codes de Statut HTTP

- `200` - Succès
- `201` - Créé avec succès
- `400` - Requête invalide
- `401` - Non authentifié
- `403` - Accès refusé
- `404` - Ressource introuvable
- `422` - Erreur de validation
- `429` - Trop de requêtes
- `500` - Erreur serveur

### Format des Erreurs

```json
{
  "@context": "/api/contexts/Error",
  "@type": "hydra:Error",
  "hydra:title": "An error occurred",
  "hydra:description": "Email déjà utilisé",
  "type": "https://tools.ietf.org/html/rfc2616#section-10",
  "title": "Unprocessable Entity",
  "status": 422,
  "detail": "email: Cette adresse email est déjà utilisée.",
  "violations": [
    {
      "propertyPath": "email",
      "message": "Cette adresse email est déjà utilisée."
    }
  ]
}
```

### Erreurs de Validation

```json
{
  "type": "https://symfony.com/errors/validation",
  "title": "Validation Failed",
  "detail": "title: Cette valeur ne doit pas être vide.",
  "violations": [
    {
      "propertyPath": "title",
      "message": "Cette valeur ne doit pas être vide.",
      "code": "c1051bb4-d103-4f74-8988-acbcafc7fdc3"
    }
  ]
}
```

---

## 🔄 Pagination

Toutes les collections utilisent la pagination Hydra :

```json
{
  "@context": "/api/contexts/Product",
  "@id": "/api/products",
  "@type": "hydra:Collection",
  "hydra:member": [...],
  "hydra:totalItems": 1250,
  "hydra:view": {
    "@id": "/api/products?page=1",
    "@type": "hydra:PartialCollectionView",
    "hydra:first": "/api/products?page=1",
    "hydra:last": "/api/products?page=63",
    "hydra:previous": "/api/products?page=1",
    "hydra:next": "/api/products?page=3"
  }
}
```

---

## 🔍 Filtrage et Recherche

### Filtres Disponibles

La plupart des endpoints supportent les filtres suivants :

- **Recherche textuelle** : `?search=terme`
- **Filtres par propriété** : `?property=value`
- **Filtres de date** : `?createdAt[after]=2024-01-01`
- **Filtres numériques** : `?price[gte]=100&price[lte]=500`
- **Tri** : `?order[property]=asc|desc`

### Exemples

```http
GET /api/products?search=smartphone&category=1&price[gte]=100&order[price]=asc
GET /api/orders?status=pending&createdAt[after]=2024-01-01
GET /api/users?role=vendor&isVerified=true
```

---

## 📈 Rate Limiting

L'API implémente un système de limitation de taux :

- **Utilisateurs authentifiés** : 1000 requêtes/heure
- **Utilisateurs non authentifiés** : 100 requêtes/heure
- **Endpoints sensibles** : 10 requêtes/minute

Headers de réponse :
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

---

## 🔒 Sécurité

### CORS
L'API supporte CORS pour les domaines autorisés.

### HTTPS
Toutes les communications doivent utiliser HTTPS en production.

### Validation
Toutes les entrées sont validées côté serveur.

### Sanitisation
Les données utilisateur sont automatiquement nettoyées.

---

## 📞 Support

- **Documentation** : https://docs.linkmarket.com
- **Support** : support@linkmarket.com
- **Status** : https://status.linkmarket.com
- **GitHub** : https://github.com/linkmarket/api

---

*Cette documentation est mise à jour régulièrement. Version actuelle : 2.0.0*