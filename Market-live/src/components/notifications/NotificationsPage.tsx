import React, { useState, useEffect } from 'react';
import { Bell, Check, Trash2, Filter, Search, ChevronDown, ExternalLink } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Link, useNavigate } from 'react-router-dom';

export default function NotificationsPage() {
  const { notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead, deleteNotification, isLoading } = useNotifications();
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
          <Bell className="h-5 w-5 text-blue-600" />
        </div>;
      case 'message':
        return <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
          <Bell className="h-5 w-5 text-green-600" />
        </div>;
      case 'payment':
        return <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
          <Bell className="h-5 w-5 text-purple-600" />
        </div>;
      case 'system':
        return <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
          <Bell className="h-5 w-5 text-gray-600" />
        </div>;
      case 'marketing':
        return <div className="h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center">
          <Bell className="h-5 w-5 text-orange-600" />
        </div>;
      case 'live_stream':
        return <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
          <Bell className="h-5 w-5 text-red-600" />
        </div>;
      default:
        return <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
          <Bell className="h-5 w-5 text-gray-600" />
        </div>;
    }
  };

  const getNotificationTypeName = (type: string) => {
    switch (type) {
      case 'order': return 'Commande';
      case 'message': return 'Message';
      case 'payment': return 'Paiement';
      case 'system': return 'Système';
      case 'marketing': return 'Marketing';
      case 'live_stream': return 'Live Stream';
      case 'review': return 'Avis';
      default: return type;
    }
  };

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesType = selectedType === 'all' || notification.type === selectedType;
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleDelete = async (id: string) => {
    await deleteNotification(id);
  };

  const handleNotificationClick = (notification: any) => {
    // Mark as read
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    
    // Navigate to action URL if available
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-1">
            {unreadCount > 0 ? `${unreadCount} notification${unreadCount > 1 ? 's' : ''} non lue${unreadCount > 1 ? 's' : ''}` : 'Toutes les notifications ont été lues'}
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Check className="h-4 w-4" />
            <span>Tout marquer comme lu</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-100">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          {/* Search */}
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Rechercher dans les notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Type Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <div className="relative">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="appearance-none px-4 py-2 pr-8 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tous les types</option>
                <option value="order">Commandes</option>
                <option value="message">Messages</option>
                <option value="payment">Paiements</option>
                <option value="system">Système</option>
                <option value="marketing">Marketing</option>
                <option value="live_stream">Live Streams</option>
                <option value="review">Avis</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredNotifications.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredNotifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`p-6 hover:bg-gray-50 transition-colors cursor-pointer ${!notification.isRead ? 'bg-blue-50' : ''}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start space-x-4">
                  {getNotificationIcon(notification.type)}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityClass(notification.priority)}`}>
                          {getNotificationTypeName(notification.type)}
                        </span>
                        {!notification.isRead && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Nouveau
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: fr })}
                      </p>
                    </div>
                    
                    <h3 className="text-base font-semibold text-gray-900 mb-1">
                      {notification.title}
                    </h3>
                    
                    <p className="text-sm text-gray-600 mb-2">
                      {notification.message}
                    </p>
                    
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center space-x-4">
                        {notification.actionUrl && (
                          <Link 
                            to={notification.actionUrl}
                            className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Voir détails
                          </Link>
                        )}
                        
                        {!notification.isRead && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsRead(notification.id);
                            }}
                            className="text-sm font-medium text-gray-600 hover:text-gray-800"
                          >
                            <Check className="h-4 w-4 mr-1 inline" />
                            Marquer comme lu
                          </button>
                        )}
                      </div>
                      
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(notification.id);
                        }}
                        className="text-sm font-medium text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Bell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              Aucune notification
            </h3>
            <p className="text-gray-600">
              {searchTerm || selectedType !== 'all' 
                ? 'Aucune notification ne correspond à vos critères de recherche.' 
                : 'Vous n\'avez pas encore de notifications.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}