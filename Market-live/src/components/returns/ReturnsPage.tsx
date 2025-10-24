import React, { useState, useEffect } from 'react';
import { Package, ArrowLeft, Search, Filter, ChevronDown, Loader2, Check, X, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface ReturnRequest {
  id: string;
  orderId: string;
  orderNumber: string;
  productTitle: string;
  productImage: string;
  quantity: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  createdAt: string;
  refundAmount?: number;
  refundStatus?: 'pending' | 'processed';
  comments?: string;
}

export default function ReturnsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  
  // Mock orders for return form
  const [eligibleOrders, setEligibleOrders] = useState<any[]>([]);
  
  useEffect(() => {
    fetchReturns();
    fetchEligibleOrders();
  }, []);
  
  const fetchReturns = async () => {
    setIsLoading(true);
    
    try {
      // In a real implementation, fetch returns from API
      // For development, use mock data
      setTimeout(() => {
        const mockReturns = [
          {
            id: '1',
            orderId: '101',
            orderNumber: 'ORD-2024-101',
            productTitle: 'Smartphone Galaxy Pro Max',
            productImage: 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg',
            quantity: 1,
            reason: 'Produit défectueux',
            status: 'approved' as const,
            createdAt: '2024-01-15T10:30:00Z',
            refundAmount: 899.99,
            refundStatus: 'processed' as const
          },
          {
            id: '2',
            orderId: '102',
            orderNumber: 'ORD-2024-102',
            productTitle: 'Casque Audio Sans-Fil',
            productImage: 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg',
            quantity: 1,
            reason: 'Ne correspond pas à la description',
            status: 'pending' as const,
            createdAt: '2024-01-20T14:45:00Z'
          }
        ];
        
        setReturns(mockReturns);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching returns:', error);
      toast.error('Erreur lors du chargement des retours');
      setIsLoading(false);
    }
  };
  
  const fetchEligibleOrders = async () => {
    try {
      // In a real implementation, fetch eligible orders from API
      // For development, use mock data
      setTimeout(() => {
        const mockOrders = [
          {
            id: '103',
            orderNumber: 'ORD-2024-103',
            productTitle: 'Montre Connectée Sport',
            productImage: 'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg',
            quantity: 1,
            price: 149.99,
            purchaseDate: '2024-01-18T09:15:00Z'
          },
          {
            id: '104',
            orderNumber: 'ORD-2024-104',
            productTitle: 'Tablette Graphique Professionnelle',
            productImage: 'https://images.pexels.com/photos/1779487/pexels-photo-1779487.jpeg',
            quantity: 1,
            price: 599.99,
            purchaseDate: '2024-01-10T11:30:00Z'
          }
        ];
        
        setEligibleOrders(mockOrders);
      }, 500);
    } catch (error) {
      console.error('Error fetching eligible orders:', error);
    }
  };
  
  const handleCreateReturn = async (formData: any) => {
    try {
      // In a real implementation, submit return request to API
      // For development, add to local state
      const newReturn: ReturnRequest = {
        id: Date.now().toString(),
        orderId: formData.orderId,
        orderNumber: formData.orderNumber,
        productTitle: formData.productTitle,
        productImage: formData.productImage,
        quantity: formData.quantity,
        reason: formData.reason,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      
      setReturns(prev => [newReturn, ...prev]);
      setShowReturnForm(false);
      setSelectedOrder(null);
      
      toast.success('Demande de retour créée avec succès !');
    } catch (error) {
      console.error('Error creating return:', error);
      toast.error('Erreur lors de la création de la demande de retour');
    }
  };
  
  const handleCancelReturn = async (returnId: string) => {
    try {
      // In a real implementation, cancel return request via API
      // For development, update local state
      setReturns(prev => prev.filter(r => r.id !== returnId));
      
      toast.success('Demande de retour annulée');
    } catch (error) {
      console.error('Error canceling return:', error);
      toast.error('Erreur lors de l\'annulation de la demande');
    }
  };
  
  const getStatusLabel = (status: ReturnRequest['status']) => {
    switch (status) {
      case 'pending':
        return 'En attente';
      case 'approved':
        return 'Approuvé';
      case 'rejected':
        return 'Refusé';
      case 'completed':
        return 'Terminé';
      default:
        return status;
    }
  };
  
  const getStatusColor = (status: ReturnRequest['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getStatusIcon = (status: ReturnRequest['status']) => {
    switch (status) {
      case 'pending':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'approved':
        return <Check className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <X className="h-5 w-5 text-red-500" />;
      case 'completed':
        return <Check className="h-5 w-5 text-blue-500" />;
      default:
        return null;
    }
  };
  
  const filteredReturns = returns.filter(returnRequest => {
    const matchesSearch = returnRequest.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         returnRequest.productTitle.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || returnRequest.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Retours et Remboursements
            </h1>
            <p className="text-gray-600">
              Gérez vos demandes de retour et suivez vos remboursements
            </p>
          </div>
          
          <button
            onClick={() => setShowReturnForm(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Demander un retour
          </button>
        </div>
      </div>
      
      {/* Return Form */}
      {showReturnForm && (
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Nouvelle demande de retour</h2>
              <button
                onClick={() => {
                  setShowReturnForm(false);
                  setSelectedOrder(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>
          
          <div className="p-6">
            {!selectedOrder ? (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Sélectionnez une commande</h3>
                
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {eligibleOrders.map(order => (
                    <div
                      key={order.id}
                      className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <img
                        src={order.productImage}
                        alt={order.productTitle}
                        className="h-16 w-16 object-cover rounded-lg mr-4"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{order.productTitle}</h4>
                        <p className="text-sm text-gray-500">
                          Commande #{order.orderNumber} • {new Date(order.purchaseDate).toLocaleDateString('fr-FR')}
                        </p>
                        <p className="text-sm font-medium text-gray-900">€{order.price.toFixed(2)}</p>
                      </div>
                      <ArrowLeft className="h-5 w-5 text-gray-400" />
                    </div>
                  ))}
                  
                  {eligibleOrders.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Aucune commande éligible pour un retour</p>
                      <p className="text-sm mt-1">Les commandes sont éligibles pour un retour pendant 30 jours après l'achat</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  handleCreateReturn({
                    orderId: selectedOrder.id,
                    orderNumber: selectedOrder.orderNumber,
                    productTitle: selectedOrder.productTitle,
                    productImage: selectedOrder.productImage,
                    quantity: parseInt(formData.get('quantity') as string),
                    reason: formData.get('reason') as string,
                    comments: formData.get('comments') as string
                  });
                }}
              >
                <div className="mb-6">
                  <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                    <img
                      src={selectedOrder.productImage}
                      alt={selectedOrder.productTitle}
                      className="h-16 w-16 object-cover rounded-lg mr-4"
                    />
                    <div>
                      <h4 className="font-medium text-gray-900">{selectedOrder.productTitle}</h4>
                      <p className="text-sm text-gray-500">
                        Commande #{selectedOrder.orderNumber} • {new Date(selectedOrder.purchaseDate).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                      Quantité à retourner *
                    </label>
                    <select
                      id="quantity"
                      name="quantity"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      {Array.from({ length: selectedOrder.quantity }, (_, i) => i + 1).map(num => (
                        <option key={num} value={num}>{num}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
                      Raison du retour *
                    </label>
                    <select
                      id="reason"
                      name="reason"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Sélectionnez une raison</option>
                      <option value="Produit défectueux">Produit défectueux</option>
                      <option value="Ne correspond pas à la description">Ne correspond pas à la description</option>
                      <option value="Taille/couleur incorrecte">Taille/couleur incorrecte</option>
                      <option value="Produit endommagé">Produit endommagé</option>
                      <option value="Reçu par erreur">Reçu par erreur</option>
                      <option value="Autre">Autre</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="comments" className="block text-sm font-medium text-gray-700 mb-1">
                      Commentaires
                    </label>
                    <textarea
                      id="comments"
                      name="comments"
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Décrivez le problème en détail..."
                    />
                  </div>
                </div>
                
                <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setSelectedOrder(null)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Retour
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Soumettre la demande
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
      
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
              placeholder="Rechercher par numéro de commande ou produit..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          {/* Status Filter */}
          <div className="relative">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tous les statuts</option>
                <option value="pending">En attente</option>
                <option value="approved">Approuvé</option>
                <option value="rejected">Refusé</option>
                <option value="completed">Terminé</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Returns List */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredReturns.length > 0 ? (
        <div className="space-y-6">
          {filteredReturns.map(returnRequest => (
            <div key={returnRequest.id} className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <img
                      src={returnRequest.productImage}
                      alt={returnRequest.productTitle}
                      className="h-16 w-16 object-cover rounded-lg"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {returnRequest.productTitle}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Commande #{returnRequest.orderNumber}
                      </p>
                      <p className="text-sm text-gray-500">
                        Quantité: {returnRequest.quantity}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(returnRequest.status)}`}>
                      {getStatusIcon(returnRequest.status)}
                      <span>{getStatusLabel(returnRequest.status)}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(returnRequest.createdAt).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Raison</p>
                    <p className="font-medium">{returnRequest.reason}</p>
                  </div>
                  
                  {returnRequest.refundAmount && (
                    <div>
                      <p className="text-sm text-gray-500">Montant du remboursement</p>
                      <p className="font-medium">€{returnRequest.refundAmount.toFixed(2)}</p>
                    </div>
                  )}
                  
                  {returnRequest.refundStatus && (
                    <div>
                      <p className="text-sm text-gray-500">Statut du remboursement</p>
                      <p className={`font-medium ${
                        returnRequest.refundStatus === 'processed' ? 'text-green-600' : 'text-yellow-600'
                      }`}>
                        {returnRequest.refundStatus === 'processed' ? 'Traité' : 'En attente'}
                      </p>
                    </div>
                  )}
                </div>
                
                {returnRequest.status === 'pending' && (
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleCancelReturn(returnRequest.id)}
                      className="text-red-600 hover:text-red-800 font-medium"
                    >
                      Annuler la demande
                    </button>
                  </div>
                )}
                
                {returnRequest.status === 'approved' && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-blue-800 text-sm">
                      <strong>Instructions de retour :</strong> Veuillez emballer le produit dans son emballage d'origine et utiliser l'étiquette de retour fournie par email. Déposez le colis dans un point relais ou bureau de poste avant le {new Date(new Date(returnRequest.createdAt).getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR')}.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl shadow-md border border-gray-100">
          <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            Aucune demande de retour trouvée
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || statusFilter !== 'all'
              ? 'Aucune demande ne correspond à vos critères de recherche.'
              : 'Vous n\'avez pas encore effectué de demande de retour.'}
          </p>
          <button
            onClick={() => setShowReturnForm(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Demander un retour
          </button>
        </div>
      )}
    </div>
  );
}