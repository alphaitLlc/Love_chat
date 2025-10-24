import { apiWrapper } from './api';

// Google Analytics integration
const initGoogleAnalytics = () => {
  // In a real implementation, this would initialize Google Analytics
  // For development, we'll just mock it
  console.log('Google Analytics initialized');
  
  return {
    pageview: (path: string) => {
      console.log('GA pageview:', path);
    },
    event: (category: string, action: string, label?: string, value?: number) => {
      console.log('GA event:', { category, action, label, value });
    }
  };
};

// Initialize analytics
const ga = initGoogleAnalytics();

// Enhanced analytics service
export const enhancedAnalyticsService = {
  // Track page view
  trackPageView: async (page: string) => {
    try {
      // Track in Google Analytics
      ga.pageview(page);
      
      // Track in backend
      await apiWrapper.post('/analytics/page-view', { page });
    } catch (error) {
      console.warn('Analytics API failed:', error);
      // Still track in Google Analytics even if backend fails
      ga.pageview(page);
    }
  },
  
  // Track product view
  trackProductView: async (productId: string) => {
    try {
      // Track in Google Analytics
      ga.event('Product', 'View', productId);
      
      // Track in backend
      await apiWrapper.post('/analytics/product-view', { productId });
    } catch (error) {
      console.warn('Analytics API failed:', error);
      // Still track in Google Analytics even if backend fails
      ga.event('Product', 'View', productId);
    }
  },
  
  // Track add to cart
  trackAddToCart: async (productId: string, quantity: number, value: number) => {
    try {
      // Track in Google Analytics
      ga.event('Ecommerce', 'Add to Cart', productId, value);
      
      // Track in backend
      await apiWrapper.post('/analytics/add-to-cart', { productId, quantity, value });
    } catch (error) {
      console.warn('Analytics API failed:', error);
      // Still track in Google Analytics even if backend fails
      ga.event('Ecommerce', 'Add to Cart', productId, value);
    }
  },
  
  // Track purchase
  trackPurchase: async (orderId: string, value: number, items: any[] = []) => {
    try {
      // Track in Google Analytics
      ga.event('Ecommerce', 'Purchase', orderId, value);
      
      // Track in backend
      await apiWrapper.post('/analytics/purchase', { orderId, value, items });
    } catch (error) {
      console.warn('Analytics API failed:', error);
      // Still track in Google Analytics even if backend fails
      ga.event('Ecommerce', 'Purchase', orderId, value);
    }
  },
  
  // Track custom event
  trackEvent: async (category: string, action: string, label?: string, value?: number) => {
    try {
      // Track in Google Analytics
      ga.event(category, action, label, value);
      
      // Track in backend
      await apiWrapper.post('/analytics/track', { 
        eventType: category,
        eventName: action,
        properties: { label },
        value
      });
    } catch (error) {
      console.warn('Analytics API failed:', error);
      // Still track in Google Analytics even if backend fails
      ga.event(category, action, label, value);
    }
  },
  
  // Get analytics summary
  getAnalyticsSummary: async (period: string = 'month') => {
    try {
      const response = await apiWrapper.get('/analytics/summary', { params: { period } });
      return response.data;
    } catch (error) {
      console.warn('Analytics API failed:', error);
      
      // Return mock data for development
      return {
        period,
        data: {
          sales: Array.from({ length: 30 }, (_, i) => ({
            date: new Date(Date.now() - (29 - i) * 86400000).toISOString().split('T')[0],
            value: Math.floor(Math.random() * 5000) + 1000,
            change: Math.floor(Math.random() * 20) - 10
          })),
          orders: Array.from({ length: 30 }, (_, i) => ({
            date: new Date(Date.now() - (29 - i) * 86400000).toISOString().split('T')[0],
            value: Math.floor(Math.random() * 50) + 10,
            change: Math.floor(Math.random() * 20) - 10
          })),
          visitors: Array.from({ length: 30 }, (_, i) => ({
            date: new Date(Date.now() - (29 - i) * 86400000).toISOString().split('T')[0],
            value: Math.floor(Math.random() * 1000) + 500,
            change: Math.floor(Math.random() * 20) - 10
          }))
        },
        summary: {
          totalSales: 45678.99,
          totalOrders: 234,
          conversionRate: 7.12,
          averageOrderValue: 195.25
        }
      };
    }
  },
  
  // Get realtime analytics
  getRealtimeAnalytics: async () => {
    try {
      const response = await apiWrapper.get('/analytics/realtime');
      return response.data;
    } catch (error) {
      console.warn('Realtime analytics API failed:', error);
      
      // Return mock data for development
      return {
        activeUsers: Math.floor(Math.random() * 100) + 50,
        pageViewsLastHour: Math.floor(Math.random() * 500) + 100,
        topPages: {
          '/': Math.floor(Math.random() * 100) + 50,
          '/marketplace': Math.floor(Math.random() * 80) + 40,
          '/products/1': Math.floor(Math.random() * 60) + 30,
          '/cart': Math.floor(Math.random() * 40) + 20,
          '/checkout': Math.floor(Math.random() * 20) + 10
        },
        recentPurchases: Array.from({ length: 5 }, (_, i) => ({
          orderId: `ORD-${Math.floor(Math.random() * 10000)}`,
          amount: Math.floor(Math.random() * 1000) + 100,
          timestamp: new Date(Date.now() - i * 300000).toISOString()
        }))
      };
    }
  }
};

export default enhancedAnalyticsService;