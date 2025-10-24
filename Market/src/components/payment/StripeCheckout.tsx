import React, { useState, useEffect } from 'react';
import { CardElement, useStripe, useElements, Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Loader2, CreditCard, AlertCircle, CheckCircle } from 'lucide-react';
import { useOrders } from '../../contexts/OrderContext';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

// Load Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_TYooMQauvdEDq54NiTphI7jx');

interface CheckoutFormProps {
  clientSecret: string;
  orderId: string;
  amount: number;
  onSuccess: () => void;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ clientSecret, orderId, amount, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [succeeded, setSucceeded] = useState(false);
  const { updateOrderStatus } = useOrders();
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);

    const cardElement = elements.getElement(CardElement);
    
    if (!cardElement) {
      setError('Une erreur est survenue. Veuillez réessayer.');
      setProcessing(false);
      return;
    }

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: {
          name: 'Jenny Rosen', // This would come from the form
        },
      }
    });

    if (error) {
      setError(error.message || 'Une erreur est survenue lors du paiement.');
      setProcessing(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      setSucceeded(true);
      setError(null);
      
      // Update order status
      try {
        await updateOrderStatus(orderId, 'confirmed');
        toast.success('Paiement réussi !');
        onSuccess();
        
        // Redirect to order confirmation
        setTimeout(() => {
          navigate(`/orders/${orderId}`);
        }, 2000);
      } catch (err) {
        console.error('Error updating order status:', err);
      }
    }
    
    setProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations de paiement</h3>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Carte de crédit
          </label>
          <div className="border border-gray-300 rounded-lg p-4 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                  invalid: {
                    color: '#9e2146',
                  },
                },
              }}
            />
          </div>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2 mb-4">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        )}
        
        {succeeded && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-2 mb-4">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="text-green-700 text-sm">Paiement réussi !</span>
          </div>
        )}
        
        <button
          type="submit"
          disabled={!stripe || processing || succeeded}
          className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {processing ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Traitement...</span>
            </>
          ) : succeeded ? (
            <>
              <CheckCircle className="h-5 w-5" />
              <span>Payé</span>
            </>
          ) : (
            <>
              <CreditCard className="h-5 w-5" />
              <span>Payer {amount.toFixed(2)} €</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};

interface StripeCheckoutProps {
  orderId: string;
  amount: number;
  onSuccess: () => void;
}

export const StripeCheckout: React.FC<StripeCheckoutProps> = ({ orderId, amount, onSuccess }) => {
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    // In a real implementation, fetch the client secret from your backend
    const getPaymentIntent = async () => {
      try {
        // This would be an API call to your backend
        // const response = await apiWrapper.post('/payments/create-intent', {
        //   orderId,
        //   amount
        // });
        // setClientSecret(response.data.clientSecret);
        
        // For development, use a mock client secret
        setTimeout(() => {
          setClientSecret('mock_client_secret');
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error creating payment intent:', error);
        toast.error('Erreur lors de la préparation du paiement');
        setLoading(false);
      }
    };

    if (user) {
      getPaymentIntent();
    }
  }, [orderId, amount, user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm 
        clientSecret={clientSecret} 
        orderId={orderId} 
        amount={amount} 
        onSuccess={onSuccess} 
      />
    </Elements>
  );
};

export default StripeCheckout;