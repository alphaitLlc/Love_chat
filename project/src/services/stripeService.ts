import { loadStripe } from '@stripe/stripe-js';
import { apiWrapper } from './api';

// Initialize Stripe with your publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_TYooMQauvdEDq54NiTphI7jx');

export const stripeService = {
  // Get Stripe instance
  getStripe: async () => {
    return await stripePromise;
  },
  
  // Create payment intent
  createPaymentIntent: async (amount: number, currency: string = 'eur', metadata: any = {}) => {
    const response = await apiWrapper.post('/payments/create-intent', {
      amount,
      currency,
      metadata
    });
    return response.data;
  },
  
  // Confirm payment
  confirmPayment: async (paymentIntentId: string, paymentMethodId: string) => {
    const response = await apiWrapper.post(`/payments/confirm`, {
      paymentIntentId,
      paymentMethodId
    });
    return response.data;
  },
  
  // Create setup intent for saving cards
  createSetupIntent: async () => {
    const response = await apiWrapper.post('/payment-methods/setup-intent');
    return response.data;
  },
  
  // Save payment method
  savePaymentMethod: async (paymentMethodId: string, makeDefault: boolean = false) => {
    const response = await apiWrapper.post('/payment-methods', {
      paymentMethodId,
      makeDefault
    });
    return response.data;
  },
  
  // Process refund
  processRefund: async (paymentIntentId: string, amount?: number) => {
    const response = await apiWrapper.post('/payments/refund', {
      paymentIntentId,
      amount
    });
    return response.data;
  }
};

export default stripeService;