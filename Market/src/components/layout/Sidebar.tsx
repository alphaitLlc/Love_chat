import React from 'react';
import { 
  Home, 
  ShoppingBag, 
  Package, 
  Users, 
  MessageCircle, 
  BarChart3, 
  Settings,
  HelpCircle,
  Truck,
  Star,
  TrendingUp,
  Box,
  ShoppingCart,
  Heart,
  CreditCard,
  Megaphone,
  Target,
  Globe,
  Video,
  Zap
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useMessages } from '../../contexts/MessageContext';
import { useOrders } from '../../contexts/OrderContext';
import { Link } from 'react-router-dom';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ activeSection, onSectionChange, isOpen, onClose }: SidebarProps) {
  const { user } = useAuth();
  const { getUnreadCount } = useMessages();
  const { cart } = useOrders();

  const unreadMessages = getUnreadCount();
  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const getMenuItems = () => {
    const baseItems = [
      { id: 'home', label: 'Accueil', icon: Home, path: '/' },
      { id: 'marketplace', label: 'Marketplace', icon: ShoppingBag, path: '/marketplace' },
      { 
        id: 'messages', 
        label: 'Messages', 
        icon: MessageCircle,
        badge: unreadMessages > 0 ? unreadMessages : undefined,
        path: '/messages'
      },
      {
        id: 'cart',
        label: 'Panier',
        icon: ShoppingCart,
        badge: cartItemsCount > 0 ? cartItemsCount : undefined,
        path: '/cart'
      },
      { id: 'profile', label: 'Mon Profil', icon: Users, path: '/profile' },
    ];

    const roleSpecificItems = {
      vendor: [
        { id: 'my-products', label: 'Mes Produits', icon: Package, path: '/my-products' },
        { id: 'orders', label: 'Mes Ventes', icon: Box, path: '/orders' },
        { id: 'suppliers', label: 'Fournisseurs', icon: Truck, path: '/suppliers' },
        { id: 'analytics', label: 'Statistiques', icon: BarChart3, path: '/analytics' },
        { id: 'marketing', label: 'Marketing', icon: Megaphone, path: '/marketing' },
        { id: 'funnels', label: 'Tunnels de Vente', icon: Target, path: '/funnels' },
        { id: 'live-shopping', label: 'Live Shopping', icon: Video, path: '/live-shopping' },
      ],
      supplier: [
        { id: 'my-catalog', label: 'Mon Catalogue', icon: Package, path: '/my-catalog' },
        { id: 'vendor-orders', label: 'Commandes Vendeurs', icon: Box, path: '/orders' },
        { id: 'vendors', label: 'Mes Vendeurs', icon: Users, path: '/vendors' },
        { id: 'analytics', label: 'Statistiques', icon: BarChart3, path: '/analytics' },
        { id: 'shipping', label: 'Livraisons', icon: Truck, path: '/shipping' },
        { id: 'marketing', label: 'Marketing', icon: Megaphone, path: '/marketing' },
        { id: 'live-shopping', label: 'Live Shopping', icon: Video, path: '/live-shopping' },
      ],
      client: [
        { id: 'my-orders', label: 'Mes Commandes', icon: Package, path: '/my-orders' },
        { id: 'favorites', label: 'Favoris', icon: Heart, path: '/favorites' },
        { id: 'reviews', label: 'Mes Avis', icon: Star, path: '/reviews' },
        { id: 'payments', label: 'Paiements', icon: CreditCard, path: '/payments' },
        { id: 'live-shopping', label: 'Live Shopping', icon: Video, path: '/live-shopping' },
      ],
      admin: [
        { id: 'users', label: 'Utilisateurs', icon: Users, path: '/users' },
        { id: 'products', label: 'Produits', icon: Package, path: '/products' },
        { id: 'orders-admin', label: 'Toutes Commandes', icon: Box, path: '/orders-admin' },
        { id: 'analytics-admin', label: 'Analytics', icon: BarChart3, path: '/analytics-admin' },
        { id: 'marketing-admin', label: 'Marketing Global', icon: Megaphone, path: '/marketing-admin' },
        { id: 'social-admin', label: 'Réseaux Sociaux', icon: Globe, path: '/social-admin' },
        { id: 'live-admin', label: 'Live Streams', icon: Video, path: '/live-admin' },
        { id: 'settings-admin', label: 'Configuration', icon: Settings, path: '/settings-admin' },
      ]
    };

    const userRoleItems = user?.role ? roleSpecificItems[user.role] || [] : [];
    
    return [
      ...baseItems,
      ...userRoleItems,
      { id: 'settings', label: 'Paramètres', icon: Settings, path: '/settings' },
      { id: 'help', label: 'Aide', icon: HelpCircle, path: '/help' },
    ];
  };

  const menuItems = getMenuItems();

  return (
    <>
      {/* Overlay pour mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-30 w-64 bg-white shadow-lg border-r border-gray-200
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header de la sidebar */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Navigation</h2>
              <button
                onClick={onClose}
                className="md:hidden p-1 rounded-md text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            {user && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user.firstName?.[0]}{user.lastName?.[0]}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {user.firstName} {user.lastName}
                    </p>
                    <div className="flex items-center space-x-1">
                      <span className="text-xs text-blue-600 font-medium capitalize">
                        {user.role}
                      </span>
                      {user.isVerified && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                          ✓
                        </span>
                      )}
                      {user.subscription && user.subscription !== 'free' && (
                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full capitalize">
                          {user.subscription}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                {user.rating > 0 && (
                  <div className="mt-2 flex items-center space-x-1">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i < Math.floor(user.rating) 
                              ? 'text-yellow-400 fill-current' 
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-600">
                      {user.rating.toFixed(1)} ({user.reviewCount} avis)
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Menu items */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                
                return (
                  <li key={item.id}>
                    <Link
                      to={item.path}
                      onClick={() => {
                        onSectionChange(item.id);
                        onClose();
                      }}
                      className={`
                        w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left
                        transition-all duration-200 group
                        ${isActive 
                          ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-600' 
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                        }
                      `}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className={`h-5 w-5 ${isActive ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'}`} />
                        <span className="font-medium">{item.label}</span>
                      </div>
                      
                      {item.badge && (
                        <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {item.badge > 99 ? '99+' : item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="text-xs text-gray-500 text-center">
              <p>LinkMarket Pro v2.0</p>
              <p className="mt-1">© 2024 Tous droits réservés</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}