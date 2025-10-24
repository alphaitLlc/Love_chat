# LinkMarket API - Documentation

## 🚀 Introduction

LinkMarket est une plateforme B2B révolutionnaire qui combine e-commerce, live shopping et intelligence artificielle pour connecter vendeurs, fournisseurs et clients.

## 📋 Fonctionnalités

### ✅ Authentification & Utilisateurs
- Inscription/Connexion sécurisée avec JWT
- Gestion des rôles (Client, Vendeur, Fournisseur, Admin)
- Profils utilisateurs complets avec KYC
- Système de badges et réputation

### ✅ Catalogue & Produits
- Gestion complète des produits
- Catégories hiérarchiques
- Upload d'images multiples
- Variantes de produits
- Gestion des stocks en temps réel

### ✅ Commandes & Paiements
- Système de commandes complet
- Intégration Stripe pour les paiements
- Support PayPal et Mobile Money
- Gestion des livraisons et tracking
- Facturation automatique

### ✅ Live Shopping
- Streaming en temps réel
- Chat interactif pendant les lives
- Produits présentés en overlay
- Analytics post-live
- Notifications push pour les lives

### ✅ Messagerie
- Chat temps réel entre utilisateurs
- Support fichiers et images
- Conversations groupées
- Notifications en temps réel

### ✅ Chatbot IA
- Assistant virtuel intelligent
- Intégration OpenAI GPT
- Réponses contextuelles
- Support multilingue

### ✅ Analytics & Reporting
- Tableaux de bord personnalisés
- Métriques de vente détaillées
- Rapports exportables
- Suivi des performances

## 🛠️ Installation

### Prérequis
- PHP 8.1+
- Composer
- MySQL 8.0+
- Node.js 18+ (pour le frontend)

### Configuration Backend

1. **Cloner le projet**
```bash
git clone https://github.com/linkmarket/api.git
cd linkmarket-api
```

2. **Installer les dépendances**
```bash
composer install
```

3. **Configuration de l'environnement**
```bash
cp .env.example .env
```

4. **Configurer la base de données**
```env
DATABASE_URL="mysql://user:password@127.0.0.1:3306/linkmarket_db"
```

5. **Générer les clés JWT**
```bash
mkdir -p config/jwt
openssl genpkey -out config/jwt/private.pem -aes256 -algorithm rsa -pkeyopt rsa_keygen_bits:4096
openssl pkey -in config/jwt/private.pem -out config/jwt/public.pem -pubout
```

6. **Créer la base de données**
```bash
php bin/console doctrine:database:create
php bin/console doctrine:migrations:migrate
```

7. **Charger les données de test**
```bash
php bin/console doctrine:fixtures:load
```

8. **Démarrer le serveur**
```bash
symfony server:start
```

## 🔧 Configuration des Services

### Stripe (Paiements)
```env
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

### OpenAI (Chatbot)
```env
OPENAI_API_KEY=your_openai_api_key
CHATBOT_MODEL=gpt-4
```

### Firebase (Notifications)
```env
FIREBASE_SERVER_KEY=your_firebase_server_key
```

### AWS S3 (Stockage)
```env
AWS_S3_BUCKET=linkmarket-storage
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
```

## 📚 API Documentation

### Authentification

#### POST /api/register
Inscription d'un nouvel utilisateur

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "vendor",
  "company": "My Company"
}
```

**Response:**
```json
{
  "message": "Utilisateur créé avec succès",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "vendor"
  },
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9..."
}
```

#### POST /api/login_check
Connexion utilisateur

**Body:**
```json
{
  "username": "user@example.com",
  "password": "password123"
}
```

### Produits

#### GET /api/products
Liste des produits avec pagination

**Query Parameters:**
- `page`: Numéro de page (défaut: 1)
- `itemsPerPage`: Nombre d'éléments par page (défaut: 20)
- `category`: Filtrer par catégorie
- `search`: Recherche textuelle

#### POST /api/products
Créer un nouveau produit

**Headers:**
```
Authorization: Bearer {token}
```

**Body:**
```json
{
  "title": "Smartphone Pro",
  "description": "Dernier modèle avec écran OLED",
  "price": 899.99,
  "originalPrice": 1199.99,
  "category": "/api/categories/1",
  "stock": 50,
  "images": ["image1.jpg", "image2.jpg"],
  "tags": ["smartphone", "tech"]
}
```

### Commandes

#### POST /api/orders
Créer une nouvelle commande

**Body:**
```json
{
  "items": [
    {
      "product": "/api/products/1",
      "quantity": 2,
      "unitPrice": 899.99
    }
  ],
  "shippingAddress": {
    "firstName": "John",
    "lastName": "Doe",
    "street": "123 Main St",
    "city": "Paris",
    "zipCode": "75001",
    "country": "France"
  },
  "paymentMethod": "stripe"
}
```

### Live Streaming

#### POST /api/live_streams
Créer un nouveau live stream

**Body:**
```json
{
  "title": "Découverte Nouveaux Produits",
  "description": "Présentation de notre nouvelle collection",
  "scheduledAt": "2024-02-01T15:00:00Z",
  "products": ["/api/products/1", "/api/products/2"],
  "isPublic": true,
  "allowChat": true
}
```

#### GET /api/live_streams/public
Liste des lives publics en cours

### Chatbot

#### POST /api/chatbot/chat
Envoyer un message au chatbot

**Body:**
```json
{
  "message": "Je cherche un smartphone",
  "sessionId": "session_123",
  "context": {
    "page": "products",
    "category": "electronics"
  }
}
```

**Response:**
```json
{
  "response": "Voici quelques smartphones qui pourraient vous intéresser...",
  "type": "product_list",
  "products": [...],
  "options": ["Voir plus", "Contacter vendeur"],
  "sessionId": "session_123"
}
```

## 🔒 Sécurité

### Authentification JWT
Toutes les routes protégées nécessitent un token JWT dans l'en-tête:
```
Authorization: Bearer {token}
```

### Rôles et Permissions
- **Client**: Peut acheter, commenter, favoriser
- **Vendor**: Peut vendre, gérer ses produits, faire du live shopping
- **Supplier**: Peut fournir des produits aux vendeurs
- **Admin**: Accès complet à toutes les fonctionnalités

### Validation des Données
Toutes les entrées sont validées côté serveur avec Symfony Validator.

## 📊 Monitoring & Analytics

### Métriques Disponibles
- Nombre d'utilisateurs actifs
- Volume des ventes
- Taux de conversion
- Performance des lives
- Engagement chatbot

### Logs
Les logs sont stockés dans `var/log/` et incluent:
- Erreurs applicatives
- Tentatives de connexion
- Transactions de paiement
- Activité API

## 🚀 Déploiement

### Production
1. Configurer les variables d'environnement
2. Optimiser l'autoloader: `composer dump-autoload --optimize`
3. Vider le cache: `php bin/console cache:clear --env=prod`
4. Migrer la base de données: `php bin/console doctrine:migrations:migrate --no-interaction`

### Docker
```bash
docker-compose up -d
```

## 🧪 Tests

### Lancer les tests
```bash
php bin/phpunit
```

### Tests d'API
```bash
php bin/phpunit tests/Api/
```

## 📞 Support

- **Documentation**: https://docs.linkmarket.com
- **Support**: support@linkmarket.com
- **Status**: https://status.linkmarket.com

## 🔄 Versions

- **v1.0.0**: Version initiale avec fonctionnalités de base
- **v1.1.0**: Ajout du live shopping
- **v1.2.0**: Intégration chatbot IA
- **v2.0.0**: Refonte complète avec nouvelles fonctionnalités

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.