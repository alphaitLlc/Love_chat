import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Truck, Calendar, CreditCard, MapPin, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { useOrders } from '../../contexts/OrderContext';
import { Order } from '../../types';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getOrderById, updateOrderStatus } = useOrders();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const orderData = getOrderById(id);
      setOrder(orderData || null);
      setIsLoading(false);
    }
  }, [id, getOrderById]);

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'confirmed':
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
      case 'processing':
        return <Package className="h-5 w-5 text-orange-500" />;
      case 'shipped':
        return <Truck className="h-5 w-5 text-purple-500" />;
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'refunded':
        return <XCircle className="h-5 w-5 text-gray-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusLabel = (status: Order['status']) => {
    const labels = {
      pending: 'En attente',
      confirmed: 'Confirmée',
      processing: 'En préparation',
      shipped: 'Expédiée',
      delivered: 'Livrée',
      cancelled: 'Annulée',
      refunded: 'Remboursée'
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: Order['status']) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-orange-100 text-orange-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            Commande non trouvée
          </h3>
          <p className="text-gray-600 mb-4">
            La commande que vous recherchez n'existe pas ou a été supprimée.
          </p>
          <Link
            to="/orders"
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux commandes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              to="/orders"
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              <span>Retour aux commandes</span>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">
              Commande #{order.orderNumber}
            </h1>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
              {getStatusIcon(order.status)}
              <span className="ml-2">{getStatusLabel(order.status)}</span>
            </span>
          </div>
          
          <div className="text-right">
            <p className="text-sm text-gray-500">
              Commandé le {new Date(order.createdAt).toLocaleDateString('fr-FR')}
            </p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              €{order.totalAmount.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Timeline */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden mb-8">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Suivi de commande</h2>
            </div>
            
            <div className="p-6">
              <div className="space-y-8">
                {order.timeline.map((event, index) => (
                  <div key={index} className="relative">
                    {index < order.timeline.length - 1 && (
                      <div className="absolute top-7 left-5 h-full w-0.5 bg-gray-200"></div>
                    )}
                    
                    <div className="flex items-start space-x-4">
                      <div className="relative z-10 flex-shrink-0">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                          event.status === order.status ? 'bg-blue-100' : 'bg-gray-100'
                        }`}>
                          {getStatusIcon(event.status as Order['status'])}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {event.description}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {formatDistanceToNow(new Date(event.timestamp), { 
                            addSuffix: true, 
                            locale: fr 
                          })}
                        </p>
                        {event.location && (
                          <p className="text-sm text-gray-600 mt-1">
                            <MapPin className="h-4 w-4 inline mr-1" />
                            {event.location}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Détails de la commande</h2>
            </div>
            
            <div className="p-6">
              <div className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                <Link to={`/products/${order.productId}`}>
                  <img
                    src={order.productImage}
                    alt={order.productTitle}
                    className="h-20 w-20 object-cover rounded-lg"
                  />
                </Link>
                
                <div className="flex-1">
                  <Link to={`/products/${order.productId}`} className="hover:text-blue-600 transition-colors">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {order.productTitle}
                    </h3>
                  </Link>
                  <p className="text-sm text-gray-600 mb-2">
                    Quantité: {order.quantity}
                  </p>
                  <p className="text-sm text-gray-600">
                    Prix unitaire: €{order.unitPrice.toFixed(2)}
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-bold text-gray-900">
                    €{(order.quantity * order.unitPrice).toFixed(2)}
                  </p>
                </div>
              </div>
              
              <div className="mt-6 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Sous-total</span>
                  <span className="text-gray-900">€{(order.quantity * order.unitPrice).toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Livraison</span>
                  <span className="text-gray-900">Gratuite</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">TVA (20%)</span>
                  <span className="text-gray-900">€{(order.totalAmount - (order.quantity * order.unitPrice)).toFixed(2)}</span>
                </div>
                
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>€{order.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Info Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Shipping Info */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <Truck className="h-5 w-5 text-gray-500" />
                <h2 className="text-lg font-semibold text-gray-900">Livraison</h2>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Adresse de livraison</h3>
                  <p className="font-medium">
                    {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                  </p>
                  {order.shippingAddress.company && (
                    <p>{order.shippingAddress.company}</p>
                  )}
                  <p>{order.shippingAddress.street}</p>
                  {order.shippingAddress.street2 && (
                    <p>{order.shippingAddress.street2}</p>
                  )}
                  <p>
                    {order.shippingAddress.zipCode} {order.shippingAddress.city}
                  </p>
                  <p>{order.shippingAddress.country}</p>
                  {order.shippingAddress.phone && (
                    <p className="mt-1">Tél: {order.shippingAddress.phone}</p>
                  )}
                </div>
                
                {order.trackingNumber && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Numéro de suivi</h3>
                    <p className="font-medium">{order.trackingNumber}</p>
                    <a 
                      href="#" 
                      className="text-blue-600 hover:text-blue-800 text-sm inline-flex items-center mt-1"
                    >
                      <Truck className="h-4 w-4 mr-1" />
                      Suivre mon colis
                    </a>
                  </div>
                )}
                
                {order.estimatedDelivery && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Livraison estimée</h3>
                    <p className="font-medium">
                      {new Date(order.estimatedDelivery).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5 text-gray-500" />
                <h2 className="text-lg font-semibold text-gray-900">Paiement</h2>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Méthode de paiement</h3>
                  <p className="font-medium">{order.paymentMethod}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Statut du paiement</h3>
                  <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                    order.paymentStatus === 'failed' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.paymentStatus === 'paid' ? 'Payé' :
                     order.paymentStatus === 'failed' ? 'Échec' :
                     order.paymentStatus === 'refunded' ? 'Remboursé' :
                     'En attente'}
                  </div>
                </div>
                
                {order.billingAddress && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Adresse de facturation</h3>
                    <p className="font-medium">
                      {order.billingAddress.firstName} {order.billingAddress.lastName}
                    </p>
                    {order.billingAddress.company && (
                      <p>{order.billingAddress.company}</p>
                    )}
                    <p>{order.billingAddress.street}</p>
                    {order.billingAddress.street2 && (
                      <p>{order.billingAddress.street2}</p>
                    )}
                    <p>
                      {order.billingAddress.zipCode} {order.billingAddress.city}
                    </p>
                    <p>{order.billingAddress.country}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <Package className="h-5 w-5 text-gray-500" />
                <h2 className="text-lg font-semibold text-gray-900">Informations</h2>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Client</h3>
                  <p className="font-medium">{order.buyerName}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Vendeur</h3>
                  <p className="font-medium">{order.sellerName}</p>
                </div>
                
                {order.notes && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Notes</h3>
                    <p className="text-sm text-gray-700">{order.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {order.status === 'pending' && (
              <button
                onClick={() => updateOrderStatus(order.id, 'cancelled')}
                className="w-full flex items-center justify-center space-x-2 py-2 px-4 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
              >
                <XCircle className="h-4 w-4" />
                <span>Annuler la commande</span>
              </button>
            )}
            
            {order.status === 'delivered' && (
              <button className="w-full flex items-center justify-center space-x-2 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Package className="h-4 w-4" />
                <span>Signaler un problème</span>
              </button>
            )}
            
            <Link
              to={`/messages?order=${order.id}`}
              className="w-full flex items-center justify-center space-x-2 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Package className="h-4 w-4" />
              <span>Contacter le vendeur</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}