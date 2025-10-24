import React, { useState, useEffect, useRef } from 'react';
import { Bell, X } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useMercureNotifications from '../../hooks/useMercureNotifications';

export default function NotificationBell() {
  const { notifications: contextNotifications, markAsRead, markAllAsRead } = useNotifications();
  const { notifications: mercureNotifications, unreadCount, isConnected } = useMercureNotifications();
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [displayedNotifications, setDisplayedNotifications] = useState<any[]>([]);
  const notificationRef = useRef<HTMLDivElement>(null);
  
  // Combine notifications from context and Mercure
  useEffect(() => {
    const allNotifications = [...mercureNotifications, ...contextNotifications];
    
    // Sort by date (newest first)
    allNotifications.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    // Remove duplicates
    const uniqueNotifications = allNotifications.filter((notification, index, self) =>
      index === self.findIndex(n => n.id === notification.id)
    );
    
    setDisplayedNotifications(uniqueNotifications.slice(0, 5));
  }, [contextNotifications, mercureNotifications]);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleNotificationClick = (notificationId: string) => {
    markAsRead(notificationId);
    setShowNotifications(false);
  };
  
  const getNotificationIcon = (type: string) => {
    return <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
      <Bell className="h-4 w-4 text-blue-600" />
    </div>;
  };
  
  return (
    <div className="relative" ref={notificationRef}>
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {showNotifications && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50"
          >
            <div className="px-4 py-2 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllAsRead()}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Tout marquer comme lu
                  </button>
                )}
              </div>
            </div>
            
            <div className="max-h-64 overflow-y-auto">
              {displayedNotifications.length > 0 ? (
                displayedNotifications.map((notification) => (
                  <Link
                    key={notification.id}
                    to={notification.actionUrl || '/notifications'}
                    onClick={() => handleNotificationClick(notification.id)}
                    className={`block px-4 py-3 hover:bg-gray-50 transition-colors ${
                      !notification.isRead ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${!notification.isRead ? 'text-blue-900' : 'text-gray-900'}`}>
                          {notification.title}
                        </p>
                        <p className={`text-sm truncate ${!notification.isRead ? 'text-blue-800' : 'text-gray-600'}`}>
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDistanceToNow(new Date(notification.createdAt), { 
                            addSuffix: true, 
                            locale: fr 
                          })}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                      )}
                    </div>
                  </Link>
                ))
              ) : (
                <div className="px-4 py-6 text-center text-gray-500">
                  <p>Aucune notification</p>
                </div>
              )}
            </div>
            
            <div className="px-4 py-2 border-t border-gray-200">
              <Link
                to="/notifications"
                onClick={() => setShowNotifications(false)}
                className="block text-center text-sm text-blue-600 hover:text-blue-800"
              >
                Voir toutes les notifications
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}