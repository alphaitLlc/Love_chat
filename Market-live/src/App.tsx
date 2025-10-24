import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { OrderProvider } from './contexts/OrderContext';
import { MessageProvider } from './contexts/MessageContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { LiveStreamProvider } from './contexts/LiveStreamContext';
import { ChatbotProvider } from './contexts/ChatbotContext';
import { AnalyticsProvider } from './contexts/AnalyticsContext';

// Layout Components
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
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
import AnalyticsPage from './components/analytics/AnalyticsPage';
import FunnelBuilder from './components/marketing/FunnelBuilder';
import LiveStreamPage from './components/live/LiveStreamPage';
import ProductManagement from './components/products/ProductManagement';
import ProfilePage from './components/profile/ProfilePage';
import NotificationsPage from './components/notifications/NotificationsPage';
import SettingsPage from './components/settings/SettingsPage';
import KYCPage from './components/kyc/KYCPage';

// New Pages
import CheckoutPage from './components/payment/CheckoutPage';
import ReviewsPage from './components/reviews/ReviewsPage';
import FavoritesPage from './components/favorites/FavoritesPage';
import ReturnsPage from './components/returns/ReturnsPage';
import ShippingTrackingPage from './components/shipping/ShippingTrackingPage';

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Role-based Route Component
const RoleRoute = ({ children, roles }: { children: React.ReactNode, roles: string[] }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }
  
  if (!user || !roles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return <>{children}</>;
};

// Main App Layout
function AppLayout() {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Set active section based on current path
  const getActiveSection = () => {
    const path = location.pathname.split('/')[1] || 'home';
    return path;
  };

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginForm onSwitchToRegister={() => navigate('/register')} />} />
        <Route path="/register" element={<RegisterForm onSwitchToLogin={() => navigate('/login')} />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onMenuClick={() => setIsSidebarOpen(true)} />
      
      <div className="flex">
        <Sidebar
          activeSection={getActiveSection()}
          onSectionChange={(section) => {
            navigate(`/${section}`);
          }}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        
        <main className="flex-1 md:ml-64">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/marketplace" element={<MarketplacePage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/messages" element={
              <ProtectedRoute>
                <MessagingPage />
              </ProtectedRoute>
            } />
            <Route path="/my-orders" element={
              <ProtectedRoute>
                <OrdersPage />
              </ProtectedRoute>
            } />
            <Route path="/orders" element={
              <RoleRoute roles={['vendor', 'supplier', 'admin']}>
                <OrdersPage />
              </RoleRoute>
            } />
            <Route path="/orders/:id" element={
              <ProtectedRoute>
                <OrderDetailPage />
              </ProtectedRoute>
            } />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            } />
            <Route path="/analytics" element={
              <RoleRoute roles={['vendor', 'supplier', 'admin']}>
                <AnalyticsPage />
              </RoleRoute>
            } />
            <Route path="/marketing" element={
              <RoleRoute roles={['vendor', 'supplier', 'admin']}>
                <FunnelBuilder />
              </RoleRoute>
            } />
            <Route path="/live-shopping" element={<LiveStreamPage />} />
            <Route path="/live-shopping/:id" element={<LiveStreamPage />} />
            <Route path="/my-products" element={
              <RoleRoute roles={['vendor', 'admin']}>
                <ProductManagement />
              </RoleRoute>
            } />
            <Route path="/my-catalog" element={
              <RoleRoute roles={['supplier', 'admin']}>
                <ProductManagement />
              </RoleRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />
            <Route path="/notifications" element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            } />
            <Route path="/kyc" element={
              <ProtectedRoute>
                <KYCPage />
              </ProtectedRoute>
            } />
            <Route path="/reviews" element={
              <ProtectedRoute>
                <ReviewsPage />
              </ProtectedRoute>
            } />
            <Route path="/favorites" element={
              <ProtectedRoute>
                <FavoritesPage />
              </ProtectedRoute>
            } />
            <Route path="/returns" element={
              <ProtectedRoute>
                <ReturnsPage />
              </ProtectedRoute>
            } />
            <Route path="/shipping/:id" element={
              <ProtectedRoute>
                <ShippingTrackingPage />
              </ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      {/* Chat Widget */}
      <ChatWidget />
      
      {/* PWA Install Prompt */}
      <InstallPrompt />
      
      {/* Toast Notifications */}
      <Toaster position="top-right" />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <OrderProvider>
            <MessageProvider>
              <LiveStreamProvider>
                <ChatbotProvider>
                  <AnalyticsProvider>
                    <AppLayout />
                  </AnalyticsProvider>
                </ChatbotProvider>
              </LiveStreamProvider>
            </MessageProvider>
          </OrderProvider>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;