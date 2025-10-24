import React, { useState } from 'react';
import { Package, Truck, CheckCircle, XCircle, Clock, Eye, Filter, Search } from 'lucide-react';
import { useOrders } from '../../contexts/OrderContext';
import { useAuth } from '../../contexts/AuthContext';
import { Order } from '../../types';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Link, useNavigate } from 'react-router-dom';

export default function OrdersPage() {
  const { user } = useAuth();
  const { orders, updateOrderStatus, getOrdersByUser } = useOrders();
  const [selectedStatus, setSelectedStatus] = useState<Order['status'] | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const navigate = useNavigate();

  const userOrders = getOrdersByUser(user?.id || '');
  
  const filteredOrders = userOrders.filter(order => {
    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.productTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.buyerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.sellerName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

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

  const handleStatusUpdate = async (orderId: string, newStatus: Order['status']) => {
    try {
      await updateOrderStatus(orderId, newStatus);
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const canUpdateStatus = (order: Order) => {
    // Vendors and suppliers can update order status
    return user?.role === 'vendor' || user?.role === 'supplier' || user?.role === 'admin';
  };

  const getNextStatus = (currentStatus: Order['status']): Order['status'] | null => {
    const statusFlow = {
      pending: 'confirmed',
      confirmed: 'processing',
      processing: 'shipped',
      shipped: 'delivered'
    } as const;
    
    return statusFlow[currentStatus] || null;
  };

  const viewOrderDetails = (orderId: string) => {
    navigate(`/orders/${orderId}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {user?.role === 'vendor' ? 'Mes Ventes' : 
           user?.role === 'supplier' ? 'Commandes Fournisseur' : 
           'Mes Commandes'}
        </h1>
        <p className="text-gray-600">
          Gérez et suivez toutes vos commandes en temps réel
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-100">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          {/* Search */}
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Rechercher par numéro, produit, client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as Order['status'] | 'all')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="confirmed">Confirmées</option>
              <option value="processing">En préparation</option>
              <option value="shipped">Expédiées</option>
              <option value="delivered">Livrées</option>
              <option value="cancelled">Annulées</option>
              <option value="refunded">Remboursées</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <Link to={`/products/${order.productId}`}>
                      <img
                        src={order.productImage}
                        alt={order.productTitle}
                        className="h-16 w-16 object-cover rounded-lg"
                      />
                    </Link>
                    <div>
                      <Link to={`/products/${order.productId}`} className="hover:text-blue-600 transition-colors">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {order.productTitle}
                        </h3>
                      </Link>
                      <p className="text-sm text-gray-600">
                        Commande #{order.orderNumber}
                      </p>
                      <p className="text-sm text-gray-500">
                        {user?.role === 'client' ? `Vendeur: ${order.sellerName}` : `Client: ${order.buyerName}`}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span>{getStatusLabel(order.status)}</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900 mt-2">
                      €{order.totalAmount.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Quantité</p>
                    <p className="font-medium">{order.quantity}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date de commande</p>
                    <p className="font-medium">
                      {formatDistanceToNow(new Date(order.createdAt), { 
                        addSuffix: true, 
                        locale: fr 
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Paiement</p>
                    <p className={`font-medium ${
                      order.paymentStatus === 'paid' ? 'text-green-600' : 
                      order.paymentStatus === 'failed' ? 'text-red-600' : 
                      'text-yellow-600'
                    }`}>
                      {order.paymentStatus === 'paid' ? 'Payé' :
                       order.paymentStatus === 'failed' ? 'Échec' :
                       order.paymentStatus === 'refunded' ? 'Remboursé' :
                       'En attente'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Livraison estimée</p>
                    <p className="font-medium">
                      {order.estimatedDelivery ? 
                        new Date(order.estimatedDelivery).toLocaleDateString('fr-FR') : 
                        'À définir'}
                    </p>
                  </div>
                </div>

                {order.trackingNumber && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Numéro de suivi:</strong> {order.trackingNumber}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <button
                    onClick={() => viewOrderDetails(order.id)}
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-medium"
                  >
                    <Eye className="h-4 w-4" />
                    <span>Voir détails</span>
                  </button>

                  <div className="flex items-center space-x-2">
                    {canUpdateStatus(order) && getNextStatus(order.status) && (
                      <button
                        onClick={() => handleStatusUpdate(order.id, getNextStatus(order.status)!)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        Passer à "{getStatusLabel(getNextStatus(order.status)!)}"
                      </button>
                    )}
                    
                    {order.status === 'pending' && (
                      <button
                        onClick={() => handleStatusUpdate(order.id, 'cancelled')}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                      >
                        Annuler
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              Aucune commande trouvée
            </h3>
            <p className="text-gray-600">
              {selectedStatus === 'all' 
                ? 'Vous n\'avez pas encore de commandes.'
                : `Aucune commande avec le statut "${getStatusLabel(selectedStatus as Order['status'])}".`}
            </p>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Détails de la commande
                </h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              {/* Order Timeline */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Suivi de commande</h3>
                <div className="space-y-4">
                  {selectedOrder.timeline.map((event, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        {getStatusIcon(event.status as Order['status'])}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{event.description}</p>
                        <p className="text-sm text-gray-500">
                          {formatDistanceToNow(new Date(event.timestamp), { 
                            addSuffix: true, 
                            locale: fr 
                          })}
                        </p>
                        {event.location && (
                          <p className="text-sm text-gray-600">{event.location}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Address */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Adresse de livraison</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-medium">
                    {selectedOrder.shippingAddress.firstName} {selectedOrder.shippingAddress.lastName}
                  </p>
                  {selectedOrder.shippingAddress.company && (
                    <p>{selectedOrder.shippingAddress.company}</p>
                  )}
                  <p>{selectedOrder.shippingAddress.street}</p>
                  {selectedOrder.shippingAddress.street2 && (
                    <p>{selectedOrder.shippingAddress.street2}</p>
                  )}
                  <p>
                    {selectedOrder.shippingAddress.zipCode} {selectedOrder.shippingAddress.city}
                  </p>
                  <p>{selectedOrder.shippingAddress.country}</p>
                  {selectedOrder.shippingAddress.phone && (
                    <p>Tél: {selectedOrder.shippingAddress.phone}</p>
                  )}
                </div>
              </div>

              {/* Order Summary */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span>Sous-total ({selectedOrder.quantity} × €{selectedOrder.unitPrice.toFixed(2)})</span>
                  <span>€{(selectedOrder.quantity * selectedOrder.unitPrice).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span>Livraison</span>
                  <span>Gratuite</span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold border-t pt-2">
                  <span>Total</span>
                  <span>€{selectedOrder.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}