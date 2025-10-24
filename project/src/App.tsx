import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { OrderProvider } from './contexts/OrderContext';
import { MessageProvider } from './contexts/MessageContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { LiveStreamProvider } from './contexts/LiveStreamContext';
import { ChatbotProvider } from './contexts/ChatbotContext';
import { AnalyticsProvider } from './contexts/AnalyticsContext';

// Layout
import DiscordLayout from './components/layout/DiscordLayout';
import ChatWidget from './components/chat/ChatWidget';
import InstallPrompt from './components/pwa/InstallPrompt';

// Auth Pages
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';

// Main Pages
import HomePage from './components/home/HomePage';
import MarketplacePage from './components/marketplace/MarketplacePage';
import ProductDetailPage from './components/marketplace/ProductDetailPage';
import MessagingPage from './components/messaging/MessagingPage';
import OrdersPage from './components/orders/OrdersPage';
import OrderDetailPage from './components/orders/OrderDetailPage';
import CartPage from './components/cart/CartPage';
import ProfilePage from './components/profile/ProfilePage';

// Importez les polices Discord
import './theme/discord.css';

// Composant wrapper pour la page de connexion
const LoginPage = () => {
  const navigate = useNavigate();
  return <LoginForm onSwitchToRegister={() => navigate('/register')} />;
};

// Composant wrapper pour la page d'inscription
const RegisterPage = () => {
  const navigate = useNavigate();
  return <RegisterForm onSwitchToLogin={() => navigate('/login')} />;
};

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-discord-darker">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-discord-accent"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return <>{children}</>;
};

// Role-based Route Component
const RoleRoute = ({ children, roles }: { children: React.ReactNode, roles: string[] }) => {
  const { user } = useAuth();
  const location = useLocation();
  
  if (!user || !roles.includes(user.role)) {
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }
  
  return <>{children}</>;
};

// Main App Component
const App = () => {
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  
  useEffect(() => {
    // Vérifier si l'application peut être installée
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setShowInstallPrompt(true);
    });
  }, []);

  return (
    <Router>
      <AuthProvider>
        <OrderProvider>
          <MessageProvider>
            <NotificationProvider>
              <LiveStreamProvider>
                <ChatbotProvider>
                  <AnalyticsProvider>
                    <Routes>
                      {/* Routes publiques */}
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/register" element={<RegisterPage />} />
                      
                      {/* Routes protégées */}
                      <Route path="/" element={
                        <ProtectedRoute>
                          <DiscordLayout>
                            <HomePage />
                          </DiscordLayout>
                        </ProtectedRoute>
                      } />
                      
                      <Route path="/marketplace" element={
                        <ProtectedRoute>
                          <DiscordLayout>
                            <MarketplacePage />
                          </DiscordLayout>
                        </ProtectedRoute>
                      } />
                      
                      <Route path="/product/:id" element={
                        <ProtectedRoute>
                          <DiscordLayout>
                            <ProductDetailPage />
                          </DiscordLayout>
                        </ProtectedRoute>
                      } />
                      
                      <Route path="/messages" element={
                        <ProtectedRoute>
                          <DiscordLayout>
                            <MessagingPage />
                          </DiscordLayout>
                        </ProtectedRoute>
                      } />
                      
                      <Route path="/orders" element={
                        <ProtectedRoute>
                          <DiscordLayout>
                            <OrdersPage />
                          </DiscordLayout>
                        </ProtectedRoute>
                      } />
                      
                      <Route path="/order/:id" element={
                        <ProtectedRoute>
                          <DiscordLayout>
                            <OrderDetailPage />
                          </DiscordLayout>
                        </ProtectedRoute>
                      } />
                      
                      <Route path="/cart" element={
                        <ProtectedRoute>
                          <DiscordLayout>
                            <CartPage />
                          </DiscordLayout>
                        </ProtectedRoute>
                      } />
                      
                      <Route path="/profile" element={
                        <ProtectedRoute>
                          <DiscordLayout>
                            <ProfilePage />
                          </DiscordLayout>
                        </ProtectedRoute>
                      } />
                    </Routes>
                    
                    {/* Widget de chat */}
                    <ChatWidget />
                    
                    {/* Invite d'installation PWA */}
                    {showInstallPrompt && (
                      <InstallPrompt 
                        onDismiss={() => setShowInstallPrompt(false)} 
                      />
                    )}
                    
                    {/* Toaster pour les notifications */}
                    <Toaster 
                      position="bottom-right"
                      toastOptions={{
                        style: {
                          background: '#36393f',
                          color: '#fff',
                          border: '1px solid #202225',
                        },
                        success: {
                          iconTheme: {
                            primary: '#3ba55c',
                            secondary: '#fff',
                          },
                        },
                        error: {
                          iconTheme: {
                            primary: '#ed4245',
                            secondary: '#fff',
                          },
                        },
                      }}
                    />
                  </AnalyticsProvider>
                </ChatbotProvider>
              </LiveStreamProvider>
            </NotificationProvider>
          </MessageProvider>
        </OrderProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;