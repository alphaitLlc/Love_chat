import React, { useState } from 'react';
import { Minus, Plus, Trash2, ShoppingBag, CreditCard, Truck } from 'lucide-react';
import { useOrders } from '../../contexts/OrderContext';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function CartPage() {
  const { user } = useAuth();
  const { cart, updateCartQuantity, removeFromCart, clearCart, createOrder } = useOrders();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const navigate = useNavigate();

  const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const shipping = subtotal > 100 ? 0 : 9.99;
  const total = subtotal + shipping;

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
    } else {
      updateCartQuantity(productId, newQuantity);
    }
  };

  const handleCheckout = async () => {
    if (!user) {
      toast.error('Veuillez vous connecter pour passer commande');
      navigate('/login');
      return;
    }

    if (cart.length === 0) {
      toast.error('Votre panier est vide');
      return;
    }

    setIsCheckingOut(true);

    try {
      // Create orders for each cart item
      for (const item of cart) {
        await createOrder({
          productId: item.product.id,
          productTitle: item.product.title,
          productImage: item.product.images[0],
          sellerId: item.product.supplierId,
          sellerName: 'Vendeur', // This would come from the product data
          quantity: item.quantity,
          unitPrice: item.product.price,
          totalAmount: item.product.price * item.quantity,
          commission: item.product.price * item.quantity * 0.05, // 5% commission
          paymentMethod: 'Carte bancaire',
          shippingAddress: user.address || {
            firstName: user.firstName,
            lastName: user.lastName,
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: 'France'
          }
        });
      }

      clearCart();
      toast.success('Commandes créées avec succès !');
      navigate('/my-orders');
    } catch (error) {
      toast.error('Erreur lors de la création des commandes');
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-16">
          <ShoppingBag className="h-24 w-24 text-gray-400 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Votre panier est vide</h2>
          <p className="text-gray-600 mb-8">
            Découvrez nos produits et ajoutez-les à votre panier pour commencer vos achats.
          </p>
          <Link to="/marketplace" className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">
            Continuer mes achats
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Mon Panier</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Articles ({cart.length})
                </h2>
                <button
                  onClick={clearCart}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Vider le panier
                </button>
              </div>

              <div className="space-y-6">
                {cart.map((item) => (
                  <div key={item.product.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                    <Link to={`/products/${item.product.id}`}>
                      <img
                        src={item.product.images[0]}
                        alt={item.product.title}
                        className="h-20 w-20 object-cover rounded-lg"
                      />
                    </Link>
                    
                    <div className="flex-1">
                      <Link to={`/products/${item.product.id}`} className="hover:text-blue-600 transition-colors">
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {item.product.title}
                        </h3>
                      </Link>
                      <p className="text-sm text-gray-600 mb-2">
                        {item.product.category}
                      </p>
                      <p className="text-lg font-bold text-blue-600">
                        €{item.product.price.toFixed(2)}
                      </p>
                    </div>

                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                        className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                      >
                        <Minus className="h-4 w-4 text-gray-600" />
                      </button>
                      
                      <span className="w-12 text-center font-medium">
                        {item.quantity}
                      </span>
                      
                      <button
                        onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                        className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                        disabled={item.quantity >= item.product.stock}
                      >
                        <Plus className="h-4 w-4 text-gray-600" />
                      </button>
                    </div>

                    <div className="text-right">
                      <p className="font-bold text-gray-900">
                        €{(item.product.price * item.quantity).toFixed(2)}
                      </p>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-red-600 hover:text-red-800 mt-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 sticky top-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Résumé de commande
            </h2>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Sous-total</span>
                <span className="font-medium">€{subtotal.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Livraison</span>
                <span className="font-medium">
                  {shipping === 0 ? 'Gratuite' : `€${shipping.toFixed(2)}`}
                </span>
              </div>
              
              {subtotal < 100 && (
                <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
                  <Truck className="h-4 w-4 inline mr-2" />
                  Livraison gratuite dès €100 d'achat
                </div>
              )}
              
              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>€{total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={isCheckingOut}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center space-x-2"
            >
              <CreditCard className="h-5 w-5" />
              <span>
                {isCheckingOut ? 'Traitement...' : 'Passer commande'}
              </span>
            </button>

            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Paiement sécurisé par Stripe
              </p>
            </div>

            {/* Payment Methods */}
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                Moyens de paiement acceptés
              </h3>
              <div className="flex space-x-2">
                <div className="bg-gray-100 px-3 py-2 rounded text-xs font-medium">
                  Visa
                </div>
                <div className="bg-gray-100 px-3 py-2 rounded text-xs font-medium">
                  Mastercard
                </div>
                <div className="bg-gray-100 px-3 py-2 rounded text-xs font-medium">
                  PayPal
                </div>
              </div>
            </div>

            {/* Security */}
            <div className="mt-4 text-center">
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                <div className="h-4 w-4 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
                <span>Paiement 100% sécurisé</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}