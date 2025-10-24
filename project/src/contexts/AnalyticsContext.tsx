import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useLocation } from 'react-router-dom';

interface AnalyticsContextType {
  trackEvent: (eventType: string, eventName: string, properties?: any, value?: number) => Promise<void>;
  trackPageView: (page: string) => Promise<void>;
  trackProductView: (productId: string) => Promise<void>;
  trackAddToCart: (productId: string, quantity: number, value: number) => Promise<void>;
  trackPurchase: (orderId: string, value: number, items?: any[]) => Promise<void>;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const location = useLocation();

  // Track page views automatically
  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);

  // Mock implementation for analytics tracking
  const trackEvent = async (eventType: string, eventName: string, properties: any = {}, value?: number) => {
    try {
      // Mock implementation - log to console instead of API call
      console.log('Analytics Event:', {
        eventType,
        eventName,
        properties,
        value,
        userId: user?.id,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  };

  const trackPageView = async (page: string) => {
    try {
      // Mock implementation - log to console instead of API call
      console.log('Page View:', {
        page,
        userId: user?.id,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error tracking page view:', error);
    }
  };

  const trackProductView = async (productId: string) => {
    try {
      // Mock implementation - log to console instead of API call
      console.log('Product View:', {
        productId,
        userId: user?.id,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error tracking product view:', error);
    }
  };

  const trackAddToCart = async (productId: string, quantity: number, value: number) => {
    try {
      // Mock implementation - log to console instead of API call
      console.log('Add to Cart:', {
        productId,
        quantity,
        value,
        userId: user?.id,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error tracking add to cart:', error);
    }
  };

  const trackPurchase = async (orderId: string, value: number, items: any[] = []) => {
    try {
      // Mock implementation - log to console instead of API call
      console.log('Purchase:', {
        orderId,
        value,
        items,
        userId: user?.id,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error tracking purchase:', error);
    }
  };

  return (
    <AnalyticsContext.Provider value={{
      trackEvent,
      trackPageView,
      trackProductView,
      trackAddToCart,
      trackPurchase
    }}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
}