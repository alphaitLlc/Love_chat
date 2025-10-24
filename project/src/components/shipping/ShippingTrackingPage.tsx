import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Truck, MapPin, Calendar, CheckCircle, Clock, AlertCircle, Printer } from 'lucide-react';
import { useOrders } from '../../contexts/OrderContext';
import { shippingService } from '../../services/api';
import toast from 'react-hot-toast';

interface ShippingEvent {
  status: string;
  description: string;
  location?: string;
  timestamp: string;
  details?: any;
}

interface ShippingInfo {
  id: string;
  orderId: string;
  carrier: string;
  trackingNumber: string;
  trackingUrl?: string;
  status: 'pending' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'failed' | 'returned';
  shippedAt?: string;
  estimatedDelivery?: string;
  deliveredAt?: string;
  trackingEvents: ShippingEvent[];
}

export default function ShippingTrackingPage() {
  const { id } = useParams<{ id: string }>();
  const { getOrderById } = useOrders();
  const navigate = useNavigate();
  
  const [shipping, setShipping] = useState<ShippingInfo | null>(null);
  const [order, setOrder] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (id) {
      fetchShippingInfo(id);
    }
  }, [id]);
  
  const fetchShippingInfo = async (trackingId: string) => {
    setIsLoading(true);
    
    try {
      // In a real implementation, fetch shipping info from API
      // For development, use mock data
      setTimeout(() => {
        const mockShipping: ShippingInfo = {
          id: trackingId,
          orderId: '1',
          carrier: 'Colissimo',
          trackingNumber: 'CP2024123456789',
          trackingUrl: 'https://www.colissimo.fr/portail_colissimo/suivreResultat.do?parcelnumber=CP2024123456789',
          status: 'in_transit',
          shippedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          trackingEvents: [
            {
              status: 'pending',
              description: 'Commande confirmée',
              timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
              status: 'picked_up',
              description: 'Colis pris en charge',
              location: 'Centre de tri Paris',
              timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
              status: 'in_transit',
              description: 'En transit vers le centre de distribution',
              location: 'Centre de tri Lyon',
              timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
            }
          ]
        };
        
        setShipping(mockShipping);
        
        // Get order info
        const orderData = getOrderById(mockShipping.orderId);
        setOrder(orderData);
        
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching shipping info:', error);
      toast.error('Erreur lors du chargement des informations de livraison');
      setIsLoading(false);
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-6 w-6 text-yellow-500" />;
      case 'picked_up':
        return <Package className="h-6 w-6 text-blue-500" />;
      case 'in_transit':
        return <Truck className="h-6 w-6 text-purple-500" />;
      case 'out_for_delivery':
        return <Truck className="h-6 w-6 text-orange-500" />;
      case 'delivered':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-6 w-6 text-red-500" />;
      case 'returned':
        return <ArrowLeft className="h-6 w-6 text-gray-500" />;
      default:
        return <Package className="h-6 w-6 text-gray-500" />;
    }
  };
  
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'En attente';
      case 'picked_up':
        return 'Pris en charge';
      case 'in_transit':
        return 'En transit';
      case 'out_for_delivery':
        return 'En cours de livraison';
      case 'delivered':
        return 'Livré';
      case 'failed':
        return 'Échec de livraison';
      case 'returned':
        return 'Retourné';
      default:
        return status;
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'picked_up':
        return 'bg-blue-100 text-blue-800';
      case 'in_transit':
        return 'bg-purple-100 text-purple-800';
      case 'out_for_delivery':
        return 'bg-orange-100 text-orange-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'returned':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
  
  if (!shipping) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            Informations de livraison non trouvées
          </h3>
          <p className="text-gray-600 mb-4">
            Les informations de livraison que vous recherchez n'existent pas ou ont été supprimées.
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
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            <span>Retour</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            Suivi de livraison
          </h1>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Tracking Info */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden mb-8">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Statut de la livraison</h2>
                <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(shipping.status)}`}>
                  {getStatusIcon(shipping.status)}
                  <span>{getStatusLabel(shipping.status)}</span>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                <div className="mb-4 md:mb-0">
                  <p className="text-sm text-gray-500 mb-1">Numéro de suivi</p>
                  <div className="flex items-center">
                    <p className="font-medium text-gray-900 mr-2">{shipping.trackingNumber}</p>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(shipping.trackingNumber);
                        toast.success('Numéro de suivi copié !');
                      }}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Copier
                    </button>
                  </div>
                </div>
                
                <div className="mb-4 md:mb-0">
                  <p className="text-sm text-gray-500 mb-1">Transporteur</p>
                  <p className="font-medium text-gray-900">{shipping.carrier}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 mb-1">Livraison estimée</p>
                  <p className="font-medium text-gray-900">
                    {shipping.estimatedDelivery ? formatDate(shipping.estimatedDelivery).split(' à ')[0] : 'Non disponible'}
                  </p>
                </div>
              </div>
              
              {/* Tracking Timeline */}
              <div className="relative">
                <div className="absolute top-0 bottom-0 left-6 w-0.5 bg-gray-200"></div>
                
                <div className="space-y-8">
                  {shipping.trackingEvents.map((event, index) => (
                    <div key={index} className="relative">
                      <div className="flex items-start">
                        <div className="absolute -left-1">
                          <div className={`h-14 w-14 rounded-full flex items-center justify-center ${
                            index === 0 ? 'bg-blue-100' : 'bg-gray-100'
                          }`}>
                            {getStatusIcon(event.status)}
                          </div>
                        </div>
                        
                        <div className="ml-20">
                          <h3 className="text-lg font-medium text-gray-900">
                            {event.description}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {formatDate(event.timestamp)}
                          </p>
                          {event.location && (
                            <p className="text-sm text-gray-600 mt-1 flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
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
          </div>
          
          {/* Actions */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Actions</h2>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {shipping.trackingUrl && (
                  <a
                    href={shipping.trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Truck className="h-5 w-5" />
                    <span>Suivre sur {shipping.carrier}</span>
                  </a>
                )}
                
                <button
                  onClick={() => {
                    // In a real implementation, this would generate and download a label
                    toast.success('Étiquette de retour téléchargée');
                  }}
                  className="flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Printer className="h-5 w-5" />
                  <span>Imprimer étiquette de retour</span>
                </button>
                
                {shipping.status === 'delivered' && (
                  <button
                    onClick={() => navigate('/returns')}
                    className="flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <ArrowLeft className="h-5 w-5" />
                    <span>Demander un retour</span>
                  </button>
                )}
                
                {shipping.status === 'in_transit' && (
                  <button
                    onClick={() => {
                      // In a real implementation, this would contact support
                      toast.success('Demande d\'assistance envoyée');
                    }}
                    className="flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <AlertCircle className="h-5 w-5" />
                    <span>Signaler un problème</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Order Info */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Détails de la commande</h2>
            </div>
            
            <div className="p-6">
              {order ? (
                <div className="space-y-6">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Numéro de commande</p>
                    <p className="font-medium text-gray-900">{order.orderNumber}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Produit</p>
                    <div className="flex items-center space-x-3">
                      <img
                        src={order.productImage}
                        alt={order.productTitle}
                        className="h-10 w-10 object-cover rounded-lg"
                      />
                      <div>
                        <p className="font-medium text-gray-900">{order.productTitle}</p>
                        <p className="text-sm text-gray-500">Quantité: {order.quantity}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Adresse de livraison</p>
                    <p className="font-medium">{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                    <p>{order.shippingAddress.street}</p>
                    <p>{order.shippingAddress.zipCode} {order.shippingAddress.city}</p>
                    <p>{order.shippingAddress.country}</p>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200">
                    <Link
                      to={`/orders/${order.id}`}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Voir les détails de la commande
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Informations de commande non disponibles</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Shipping Details */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden mt-6">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Informations d'expédition</h2>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Date d'expédition</p>
                  <p className="font-medium text-gray-900">
                    {shipping.shippedAt ? formatDate(shipping.shippedAt) : 'Non disponible'}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 mb-1">Méthode d'expédition</p>
                  <p className="font-medium text-gray-900">{shipping.carrier}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 mb-1">Livraison estimée</p>
                  <p className="font-medium text-gray-900">
                    {shipping.estimatedDelivery ? formatDate(shipping.estimatedDelivery).split(' à ')[0] : 'Non disponible'}
                  </p>
                </div>
                
                {shipping.deliveredAt && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Livré le</p>
                    <p className="font-medium text-green-600">
                      {formatDate(shipping.deliveredAt)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}