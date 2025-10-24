import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CreditCard, Truck, Package, ArrowLeft, ChevronRight, ChevronDown, Check, Loader2 } from 'lucide-react';
import { useOrders } from '../../contexts/OrderContext';
import { useAuth } from '../../contexts/AuthContext';
import { StripeCheckout } from './StripeCheckout';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const { cart, clearCart } = useOrders();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [step, setStep] = useState(1);
  const [shippingAddress, setShippingAddress] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    company: user?.company || '',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    zipCode: user?.address?.zipCode || '',
    country: user?.address?.country || 'France',
    phone: user?.phone || ''
  });
  const [billingAddress, setBillingAddress] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    company: user?.company || '',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    zipCode: user?.address?.zipCode || '',
    country: user?.address?.country || 'France',
    phone: user?.phone || ''
  });
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  
  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const shipping = shippingMethod === 'express' ? 14.99 : (subtotal >= 100 ? 0 : 9.99);
  const tax = subtotal * 0.2; // 20% VAT
  const total = subtotal + shipping + tax;
  
  // Check if cart is empty
  useEffect(() => {
    if (cart.length === 0 && !location.state?.orderId) {
      navigate('/cart');
    }
    
    // If we have an orderId from location state, set it
    if (location.state?.orderId) {
      setOrderId(location.state.orderId);
      setStep(3); // Jump to payment step
    }
  }, [cart, navigate, location]);
  
  // Update billing address when shipping address changes if sameAsShipping is true
  useEffect(() => {
    if (sameAsShipping) {
      setBillingAddress(shippingAddress);
    }
  }, [shippingAddress, sameAsShipping]);
  
  const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({ ...prev, [name]: value }));
  };
  
  const handleBillingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setBillingAddress(prev => ({ ...prev, [name]: value }));
  };
  
  const validateShippingForm = () => {
    const requiredFields = ['firstName', 'lastName', 'street', 'city', 'zipCode', 'country'];
    for (const field of requiredFields) {
      if (!shippingAddress[field as keyof typeof shippingAddress]) {
        toast.error(`Le champ ${field} est requis`);
        return false;
      }
    }
    return true;
  };
  
  const validateBillingForm = () => {
    if (sameAsShipping) return true;
    
    const requiredFields = ['firstName', 'lastName', 'street', 'city', 'zipCode', 'country'];
    for (const field of requiredFields) {
      if (!billingAddress[field as keyof typeof billingAddress]) {
        toast.error(`Le champ ${field} est requis`);
        return false;
      }
    }
    return true;
  };
  
  const handleNextStep = () => {
    if (step === 1 && !validateShippingForm()) return;
    if (step === 2 && !validateBillingForm()) return;
    
    if (step === 2) {
      createOrder();
    } else {
      setStep(prev => prev + 1);
    }
  };
  
  const handlePrevStep = () => {
    setStep(prev => prev - 1);
  };
  
  const createOrder = async () => {
    if (!user) {
      toast.error('Vous devez être connecté pour passer commande');
      navigate('/login');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // In a real implementation, this would create an order via API
      // For development, we'll simulate it
      setTimeout(() => {
        const newOrderId = `order_${Date.now()}`;
        setOrderId(newOrderId);
        setStep(3);
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Erreur lors de la création de la commande');
      setIsLoading(false);
    }
  };
  
  const handlePaymentSuccess = () => {
    // Clear cart after successful payment
    clearCart();
    
    // Show success message
    toast.success('Commande confirmée avec succès !');
    
    // Redirect to order confirmation
    navigate(`/orders/${orderId}`);
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          <span>Retour</span>
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mt-4">Finaliser la commande</h1>
      </div>
      
      {/* Checkout Steps */}
      <div className="mb-8">
        <div className="flex items-center">
          <div className={`flex items-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
              step >= 1 ? 'bg-blue-100' : 'bg-gray-100'
            }`}>
              {step > 1 ? <Check className="h-5 w-5" /> : <span>1</span>}
            </div>
            <span className="ml-2 font-medium">Livraison</span>
          </div>
          
          <div className={`h-0.5 w-12 mx-2 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
          
          <div className={`flex items-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
              step >= 2 ? 'bg-blue-100' : 'bg-gray-100'
            }`}>
              {step > 2 ? <Check className="h-5 w-5" /> : <span>2</span>}
            </div>
            <span className="ml-2 font-medium">Récapitulatif</span>
          </div>
          
          <div className={`h-0.5 w-12 mx-2 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
          
          <div className={`flex items-center ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
              step >= 3 ? 'bg-blue-100' : 'bg-gray-100'
            }`}>
              <span>3</span>
            </div>
            <span className="ml-2 font-medium">Paiement</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Step 1: Shipping */}
          {step === 1 && (
            <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <Truck className="h-5 w-5 text-gray-500" />
                  <h2 className="text-xl font-semibold text-gray-900">Informations de livraison</h2>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                      Prénom *
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={shippingAddress.firstName}
                      onChange={handleShippingChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                      Nom *
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={shippingAddress.lastName}
                      onChange={handleShippingChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                      Entreprise
                    </label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      value={shippingAddress.company}
                      onChange={handleShippingChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={shippingAddress.phone}
                      onChange={handleShippingChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-1">
                      Adresse *
                    </label>
                    <input
                      type="text"
                      id="street"
                      name="street"
                      value={shippingAddress.street}
                      onChange={handleShippingChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                      Ville *
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={shippingAddress.city}
                      onChange={handleShippingChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                      Code postal *
                    </label>
                    <input
                      type="text"
                      id="zipCode"
                      name="zipCode"
                      value={shippingAddress.zipCode}
                      onChange={handleShippingChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                      Pays *
                    </label>
                    <select
                      id="country"
                      name="country"
                      value={shippingAddress.country}
                      onChange={handleShippingChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="France">France</option>
                      <option value="Belgique">Belgique</option>
                      <option value="Suisse">Suisse</option>
                      <option value="Luxembourg">Luxembourg</option>
                      <option value="Canada">Canada</option>
                    </select>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Méthode de livraison</h3>
                  
                  <div className="space-y-4">
                    <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      <input
                        type="radio"
                        name="shippingMethod"
                        value="standard"
                        checked={shippingMethod === 'standard'}
                        onChange={() => setShippingMethod('standard')}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <div className="ml-3 flex-1">
                        <p className="font-medium text-gray-900">Livraison standard</p>
                        <p className="text-sm text-gray-500">2-5 jours ouvrés</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          {subtotal >= 100 ? 'Gratuit' : '9,99 €'}
                        </p>
                      </div>
                    </label>
                    
                    <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      <input
                        type="radio"
                        name="shippingMethod"
                        value="express"
                        checked={shippingMethod === 'express'}
                        onChange={() => setShippingMethod('express')}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <div className="ml-3 flex-1">
                        <p className="font-medium text-gray-900">Livraison express</p>
                        <p className="text-sm text-gray-500">1-2 jours ouvrés</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">14,99 €</p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Step 2: Review */}
          {step === 2 && (
            <div className="space-y-6">
              {/* Shipping Address */}
              <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Truck className="h-5 w-5 text-gray-500" />
                      <h2 className="text-xl font-semibold text-gray-900">Adresse de livraison</h2>
                    </div>
                    <button
                      onClick={() => setStep(1)}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Modifier
                    </button>
                  </div>
                </div>
                
                <div className="p-6">
                  <p className="font-medium">{shippingAddress.firstName} {shippingAddress.lastName}</p>
                  {shippingAddress.company && <p>{shippingAddress.company}</p>}
                  <p>{shippingAddress.street}</p>
                  <p>{shippingAddress.zipCode} {shippingAddress.city}</p>
                  <p>{shippingAddress.country}</p>
                  {shippingAddress.phone && <p>Tél: {shippingAddress.phone}</p>}
                  
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="font-medium">Méthode de livraison:</p>
                    <p>{shippingMethod === 'standard' ? 'Livraison standard (2-5 jours ouvrés)' : 'Livraison express (1-2 jours ouvrés)'}</p>
                  </div>
                </div>
              </div>
              
              {/* Billing Address */}
              <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CreditCard className="h-5 w-5 text-gray-500" />
                      <h2 className="text-xl font-semibold text-gray-900">Adresse de facturation</h2>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="mb-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={sameAsShipping}
                        onChange={(e) => setSameAsShipping(e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-gray-700">Identique à l'adresse de livraison</span>
                    </label>
                  </div>
                  
                  {!sameAsShipping && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="billing-firstName" className="block text-sm font-medium text-gray-700 mb-1">
                          Prénom *
                        </label>
                        <input
                          type="text"
                          id="billing-firstName"
                          name="firstName"
                          value={billingAddress.firstName}
                          onChange={handleBillingChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="billing-lastName" className="block text-sm font-medium text-gray-700 mb-1">
                          Nom *
                        </label>
                        <input
                          type="text"
                          id="billing-lastName"
                          name="lastName"
                          value={billingAddress.lastName}
                          onChange={handleBillingChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="billing-company" className="block text-sm font-medium text-gray-700 mb-1">
                          Entreprise
                        </label>
                        <input
                          type="text"
                          id="billing-company"
                          name="company"
                          value={billingAddress.company}
                          onChange={handleBillingChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <label htmlFor="billing-street" className="block text-sm font-medium text-gray-700 mb-1">
                          Adresse *
                        </label>
                        <input
                          type="text"
                          id="billing-street"
                          name="street"
                          value={billingAddress.street}
                          onChange={handleBillingChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="billing-city" className="block text-sm font-medium text-gray-700 mb-1">
                          Ville *
                        </label>
                        <input
                          type="text"
                          id="billing-city"
                          name="city"
                          value={billingAddress.city}
                          onChange={handleBillingChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="billing-zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                          Code postal *
                        </label>
                        <input
                          type="text"
                          id="billing-zipCode"
                          name="zipCode"
                          value={billingAddress.zipCode}
                          onChange={handleBillingChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="billing-country" className="block text-sm font-medium text-gray-700 mb-1">
                          Pays *
                        </label>
                        <select
                          id="billing-country"
                          name="country"
                          value={billingAddress.country}
                          onChange={handleBillingChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        >
                          <option value="France">France</option>
                          <option value="Belgique">Belgique</option>
                          <option value="Suisse">Suisse</option>
                          <option value="Luxembourg">Luxembourg</option>
                          <option value="Canada">Canada</option>
                        </select>
                      </div>
                    </div>
                  )}
                  
                  {sameAsShipping && (
                    <div>
                      <p className="font-medium">{billingAddress.firstName} {billingAddress.lastName}</p>
                      {billingAddress.company && <p>{billingAddress.company}</p>}
                      <p>{billingAddress.street}</p>
                      <p>{billingAddress.zipCode} {billingAddress.city}</p>
                      <p>{billingAddress.country}</p>
                      {billingAddress.phone && <p>Tél: {billingAddress.phone}</p>}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Order Notes */}
              <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center space-x-2">
                    <Package className="h-5 w-5 text-gray-500" />
                    <h2 className="text-xl font-semibold text-gray-900">Notes de commande</h2>
                  </div>
                </div>
                
                <div className="p-6">
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Instructions spéciales pour la livraison ou autres remarques..."
                  />
                </div>
              </div>
            </div>
          )}
          
          {/* Step 3: Payment */}
          {step === 3 && (
            <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5 text-gray-500" />
                  <h2 className="text-xl font-semibold text-gray-900">Paiement</h2>
                </div>
              </div>
              
              <div className="p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Méthode de paiement</h3>
                  
                  <div className="space-y-4">
                    <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="card"
                        checked={paymentMethod === 'card'}
                        onChange={() => setPaymentMethod('card')}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <div className="ml-3 flex-1">
                        <p className="font-medium text-gray-900">Carte bancaire</p>
                        <p className="text-sm text-gray-500">Visa, Mastercard, American Express</p>
                      </div>
                      <div className="flex space-x-2">
                        <div className="h-8 w-12 bg-gray-100 rounded flex items-center justify-center text-xs font-medium">Visa</div>
                        <div className="h-8 w-12 bg-gray-100 rounded flex items-center justify-center text-xs font-medium">MC</div>
                        <div className="h-8 w-12 bg-gray-100 rounded flex items-center justify-center text-xs font-medium">Amex</div>
                      </div>
                    </label>
                    
                    <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="paypal"
                        checked={paymentMethod === 'paypal'}
                        onChange={() => setPaymentMethod('paypal')}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <div className="ml-3 flex-1">
                        <p className="font-medium text-gray-900">PayPal</p>
                        <p className="text-sm text-gray-500">Paiement sécurisé via PayPal</p>
                      </div>
                      <div className="h-8 w-12 bg-gray-100 rounded flex items-center justify-center text-xs font-medium">PayPal</div>
                    </label>
                  </div>
                </div>
                
                {paymentMethod === 'card' && orderId && (
                  <StripeCheckout 
                    orderId={orderId} 
                    amount={total} 
                    onSuccess={handlePaymentSuccess} 
                  />
                )}
                
                {paymentMethod === 'paypal' && (
                  <div className="bg-blue-50 p-6 rounded-lg text-center">
                    <p className="text-blue-800 mb-4">Vous serez redirigé vers PayPal pour finaliser votre paiement.</p>
                    <button
                      onClick={handlePaymentSuccess}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Payer avec PayPal
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Navigation Buttons */}
          {step < 3 && (
            <div className="mt-8 flex justify-between">
              {step > 1 ? (
                <button
                  onClick={handlePrevStep}
                  className="flex items-center space-x-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Retour</span>
                </button>
              ) : (
                <div></div>
              )}
              
              <button
                onClick={handleNextStep}
                disabled={isLoading}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Traitement...</span>
                  </>
                ) : (
                  <>
                    <span>{step === 2 ? 'Procéder au paiement' : 'Continuer'}</span>
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
        
        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 sticky top-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Récapitulatif de commande
            </h2>
            
            <div className="space-y-4 mb-6">
              {/* Products */}
              <div className="space-y-4 max-h-80 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.product.id} className="flex items-start space-x-4">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.title}
                      className="h-16 w-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.product.title}</h3>
                      <p className="text-sm text-gray-500">Quantité: {item.quantity}</p>
                      <p className="text-sm font-medium text-gray-900">€{(item.product.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Totals */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Sous-total</span>
                  <span className="font-medium">€{subtotal.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Livraison</span>
                  <span className="font-medium">
                    {shipping === 0 ? 'Gratuite' : `€${shipping.toFixed(2)}`}
                  </span>
                </div>
                
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">TVA (20%)</span>
                  <span className="font-medium">€{tax.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between text-lg font-bold mt-4 pt-4 border-t border-gray-200">
                  <span>Total</span>
                  <span>€{total.toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            {/* Promo Code */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center">
                <input
                  type="text"
                  placeholder="Code promo"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-r-lg hover:bg-gray-200 transition-colors">
                  Appliquer
                </button>
              </div>
            </div>
            
            {/* Security Info */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                <div className="h-4 w-4 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
                <span>Paiement 100% sécurisé</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <div className="h-4 w-4 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
                <span>Livraison gratuite dès 100€</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}