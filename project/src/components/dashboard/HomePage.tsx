import React from 'react';
import { 
  ShoppingBag, 
  TrendingUp, 
  Users, 
  Package, 
  Star, 
  ArrowRight,
  Zap,
  Shield,
  Globe,
  MessageCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function HomePage() {
  const { user } = useAuth();

  const stats = {
    vendor: [
      { label: 'Produits vendus', value: '247', change: '+12%', icon: Package },
      { label: 'Revenus ce mois', value: '€3,450', change: '+8%', icon: TrendingUp },
      { label: 'Commandes actives', value: '15', change: '+3', icon: ShoppingBag },
      { label: 'Note moyenne', value: '4.8', change: '+0.2', icon: Star },
    ],
    supplier: [
      { label: 'Produits fournis', value: '1,234', change: '+15%', icon: Package },
      { label: 'Vendeurs partenaires', value: '67', change: '+5', icon: Users },
      { label: 'Commandes en cours', value: '23', change: '+7', icon: ShoppingBag },
      { label: 'Satisfaction', value: '96%', change: '+2%', icon: Star },
    ],
    client: [
      { label: 'Commandes passées', value: '12', change: '+3', icon: ShoppingBag },
      { label: 'Favoris', value: '34', change: '+8', icon: Star },
      { label: 'Économies réalisées', value: '€156', change: '+€23', icon: TrendingUp },
      { label: 'Vendeurs suivis', value: '8', change: '+2', icon: Users },
    ]
  };

  const currentStats = user?.role ? stats[user.role] || stats.client : stats.client;

  const features = [
    {
      icon: Shield,
      title: 'Sécurisé et Fiable',
      description: 'Transactions sécurisées, vendeurs vérifiés, paiements protégés'
    },
    {
      icon: Zap,
      title: 'Réactivité',
      description: 'Commandes traitées rapidement, livraisons express disponibles'
    },
    {
      icon: Globe,
      title: 'International',
      description: 'Expédition mondiale, support multi-devises et multi-langues'
    },
    {
      icon: MessageCircle,
      title: 'Support 24/7',
      description: 'Assistance client disponible à tout moment via chat et téléphone'
    }
  ];

  const recentActivities = [
    { type: 'order', message: 'Nouvelle commande de Sophie Bernard', time: '5 min' },
    { type: 'message', message: 'Message de TechSupply Co', time: '15 min' },
    { type: 'review', message: 'Nouvel avis 5 étoiles reçu', time: '1h' },
    { type: 'sale', message: 'Produit "Smartphone XY" vendu', time: '2h' },
  ];

  const getRoleWelcomeMessage = () => {
    switch (user?.role) {
      case 'vendor':
        return {
          title: `Bonjour ${user.firstName} ! Prêt à booster vos ventes ?`,
          subtitle: 'Découvrez de nouveaux produits à revendre et gérez vos commandes efficacement.'
        };
      case 'supplier':
        return {
          title: `Bonjour ${user.firstName} ! Vos partenaires vendeurs vous attendent`,
          subtitle: 'Gérez votre catalogue et développez votre réseau de revendeurs.'
        };
      case 'client':
        return {
          title: `Bonjour ${user.firstName} ! Découvrez les meilleures offres`,
          subtitle: 'Explorez notre marketplace et profitez des prix négociés par nos vendeurs.'
        };
      default:
        return {
          title: 'Bienvenue sur MarketLink Pro',
          subtitle: 'Votre plateforme B2B de mise en relation vendeur-fournisseur'
        };
    }
  };

  const { title, subtitle } = getRoleWelcomeMessage();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* En-tête de bienvenue */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 text-white mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{title}</h1>
            <p className="text-blue-100 text-lg">{subtitle}</p>
            {user?.isVerified && (
              <div className="mt-4 flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span className="text-sm">Compte vérifié</span>
              </div>
            )}
          </div>
          <div className="hidden lg:block">
            <div className="h-24 w-24 bg-white/10 rounded-full flex items-center justify-center">
              <span className="text-3xl font-bold">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {currentStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <p className="text-green-600 text-sm font-medium mt-1">{stat.change}</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Icon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Activités récentes */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Activités récentes</h2>
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center space-x-1">
                <span>Voir tout</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-gray-900 text-sm">{activity.message}</p>
                    <p className="text-gray-500 text-xs">Il y a {activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Actions rapides</h3>
            <div className="space-y-3">
              <button className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                {user?.role === 'vendor' ? 'Ajouter un produit' : 
                 user?.role === 'supplier' ? 'Mettre à jour le catalogue' : 
                 'Explorer la marketplace'}
              </button>
              <button className="w-full border border-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                Voir les messages
              </button>
              <button className="w-full border border-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                Gérer le profil
              </button>
            </div>
          </div>

          {/* Tip du jour */}
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
            <h3 className="text-lg font-bold text-orange-900 mb-2">💡 Conseil du jour</h3>
            <p className="text-orange-800 text-sm">
              {user?.role === 'vendor' 
                ? 'Mettez à jour régulièrement vos prix pour rester compétitif sur le marché.'
                : user?.role === 'supplier'
                ? 'Proposez des remises dégressives pour encourager les commandes en volume.'
                : 'Utilisez les filtres avancés pour trouver exactement ce que vous cherchez.'}
            </p>
          </div>
        </div>
      </div>

      {/* Fonctionnalités de la plateforme */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
          Pourquoi choisir MarketLink Pro ?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="text-center p-6 rounded-xl bg-white shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}