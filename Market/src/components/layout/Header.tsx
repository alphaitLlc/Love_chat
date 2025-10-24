import React, { useState } from 'react';
import { 
  User, 
  ShoppingCart, 
  MessageCircle, 
  Bell, 
  Search,
  Menu,
  LogOut,
  Settings,
  Package,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useMessages } from '../../contexts/MessageContext';
import { useOrders } from '../../contexts/OrderContext';
import { Link, useNavigate } from 'react-router-dom';
import NotificationBell from '../notifications/NotificationBell';

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();
  const { getUnreadCount } = useMessages();
  const { cart } = useOrders();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  const unreadMessages = getUnreadCount();
  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'vendor': return 'Vendeur';
      case 'supplier': return 'Fournisseur';
      case 'client': return 'Client';
      case 'admin': return 'Administrateur';
      default: return role;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'vendor': return <TrendingUp className="h-4 w-4" />;
      case 'supplier': return <Package className="h-4 w-4" />;
      case 'client': return <User className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo et Navigation Mobile */}
          <div className="flex items-center space-x-4">
            <button
              onClick={onMenuClick}
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>
            
            <Link to="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">B2B</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900 hidden sm:block">
                MarketLink Pro
              </h1>
            </Link>
          </div>

          {/* Barre de recherche */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Rechercher des produits, fournisseurs..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Actions utilisateur */}
          <div className="flex items-center space-x-4">
            {/* Panier */}
            <Link to="/cart" className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
              <ShoppingCart className="h-6 w-6" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center">
                  {cartItemsCount > 99 ? '99+' : cartItemsCount}
                </span>
              )}
            </Link>

            {/* Messages */}
            <Link to="/messages" className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
              <MessageCircle className="h-6 w-6" />
              {unreadMessages > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-green-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadMessages > 99 ? '99+' : unreadMessages}
                </span>
              )}
            </Link>

            {/* Notifications */}
            <NotificationBell />

            {/* Menu utilisateur */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </span>
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <div className="flex items-center space-x-1">
                    {getRoleIcon(user?.role || '')}
                    <p className="text-xs text-gray-500">
                      {getRoleLabel(user?.role || '')}
                    </p>
                    {user?.subscription && user.subscription !== 'free' && (
                      <span className="text-xs bg-purple-100 text-purple-800 px-1 py-0.5 rounded">
                        {user.subscription}
                      </span>
                    )}
                  </div>
                </div>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                    <div className="flex items-center space-x-1 mt-1">
                      {getRoleIcon(user?.role || '')}
                      <span className="text-xs text-gray-500">
                        {getRoleLabel(user?.role || '')}
                      </span>
                      {user?.isVerified && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                          Vérifié
                        </span>
                      )}
                      {user?.subscription && user.subscription !== 'free' && (
                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full capitalize">
                          {user.subscription}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="py-2">
                    <Link 
                      to="/profile"
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <User className="h-4 w-4" />
                      <span>Mon profil</span>
                    </Link>
                    <Link 
                      to="/settings"
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Settings className="h-4 w-4" />
                      <span>Paramètres</span>
                    </Link>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-2">
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Se déconnecter</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}