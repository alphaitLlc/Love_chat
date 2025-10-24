import React, { useState } from 'react';
import { Plus, Edit, Trash2, Eye, BarChart3, Settings, ArrowDown, ArrowRight } from 'lucide-react';
import { SalesFunnel, FunnelStep } from '../../types';

const mockFunnels: SalesFunnel[] = [
  {
    id: '1',
    name: 'Funnel Smartphone Premium',
    status: 'active',
    steps: [
      {
        id: 'step-1',
        type: 'landing',
        name: 'Page d\'atterrissage',
        content: { title: 'Découvrez le Smartphone du Futur', cta: 'Voir l\'offre' },
        nextStep: 'step-2'
      },
      {
        id: 'step-2',
        type: 'product',
        name: 'Page produit',
        content: { productId: '1' },
        nextStep: 'step-3',
        alternativeStep: 'step-4'
      },
      {
        id: 'step-3',
        type: 'upsell',
        name: 'Upsell - Accessoires',
        content: { products: ['case', 'charger', 'headphones'] },
        nextStep: 'step-5'
      },
      {
        id: 'step-4',
        type: 'downsell',
        name: 'Downsell - Modèle Standard',
        content: { productId: '2', discount: 20 },
        nextStep: 'step-5'
      },
      {
        id: 'step-5',
        type: 'checkout',
        name: 'Commande',
        content: {},
        nextStep: 'step-6'
      },
      {
        id: 'step-6',
        type: 'thankyou',
        name: 'Merci',
        content: { message: 'Merci pour votre commande !' }
      }
    ],
    metrics: {
      visitors: 1250,
      conversions: 89,
      revenue: 45670,
      conversionRate: 7.12,
      stepMetrics: {
        'step-1': { visitors: 1250, conversions: 890 },
        'step-2': { visitors: 890, conversions: 445 },
        'step-3': { visitors: 267, conversions: 89 },
        'step-4': { visitors: 178, conversions: 45 },
        'step-5': { visitors: 134, conversions: 89 },
        'step-6': { visitors: 89, conversions: 89 }
      }
    },
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-16T15:30:00Z'
  }
];

export default function FunnelBuilder() {
  const [funnels, setFunnels] = useState<SalesFunnel[]>(mockFunnels);
  const [selectedFunnel, setSelectedFunnel] = useState<SalesFunnel | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const getStepIcon = (type: FunnelStep['type']) => {
    switch (type) {
      case 'landing':
        return '🎯';
      case 'product':
        return '📱';
      case 'upsell':
        return '⬆️';
      case 'downsell':
        return '⬇️';
      case 'checkout':
        return '💳';
      case 'thankyou':
        return '🎉';
      default:
        return '📄';
    }
  };

  const getStepColor = (type: FunnelStep['type']) => {
    switch (type) {
      case 'landing':
        return 'bg-blue-100 text-blue-800';
      case 'product':
        return 'bg-green-100 text-green-800';
      case 'upsell':
        return 'bg-purple-100 text-purple-800';
      case 'downsell':
        return 'bg-orange-100 text-orange-800';
      case 'checkout':
        return 'bg-red-100 text-red-800';
      case 'thankyou':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateConversionRate = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current / previous) * 100).toFixed(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Constructeur de Tunnels de Vente
            </h1>
            <p className="text-gray-600">
              Créez et optimisez vos tunnels de conversion pour maximiser vos ventes
            </p>
          </div>
          
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>Nouveau Tunnel</span>
          </button>
        </div>
      </div>

      {!selectedFunnel ? (
        /* Funnels List */
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {funnels.map((funnel) => (
            <div key={funnel.id} className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{funnel.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    funnel.status === 'active' ? 'bg-green-100 text-green-800' :
                    funnel.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {funnel.status === 'active' ? 'Actif' :
                     funnel.status === 'paused' ? 'En pause' : 'Brouillon'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-gray-500">Visiteurs</p>
                    <p className="text-xl font-bold text-gray-900">{funnel.metrics.visitors.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Conversions</p>
                    <p className="text-xl font-bold text-green-600">{funnel.metrics.conversions}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Taux de conversion</p>
                    <p className="text-lg font-bold text-blue-600">{funnel.metrics.conversionRate}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Revenus</p>
                    <p className="text-lg font-bold text-purple-600">€{funnel.metrics.revenue.toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedFunnel(funnel)}
                      className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 font-medium"
                    >
                      <Eye className="h-4 w-4" />
                      <span>Voir</span>
                    </button>
                    <button className="flex items-center space-x-1 text-gray-600 hover:text-gray-800">
                      <Edit className="h-4 w-4" />
                      <span>Modifier</span>
                    </button>
                  </div>
                  
                  <button className="flex items-center space-x-1 text-green-600 hover:text-green-800">
                    <BarChart3 className="h-4 w-4" />
                    <span>Stats</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Funnel Detail View */
        <div>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSelectedFunnel(null)}
                className="text-gray-600 hover:text-gray-800"
              >
                ← Retour
              </button>
              <h2 className="text-2xl font-bold text-gray-900">{selectedFunnel.name}</h2>
            </div>
            
            <div className="flex items-center space-x-2">
              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Settings className="h-4 w-4" />
                <span>Paramètres</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <BarChart3 className="h-4 w-4" />
                <span>Analytics</span>
              </button>
            </div>
          </div>

          {/* Funnel Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Visiteurs totaux</h3>
              <p className="text-3xl font-bold text-gray-900">{selectedFunnel.metrics.visitors.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Conversions</h3>
              <p className="text-3xl font-bold text-green-600">{selectedFunnel.metrics.conversions}</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Taux global</h3>
              <p className="text-3xl font-bold text-blue-600">{selectedFunnel.metrics.conversionRate}%</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Revenus</h3>
              <p className="text-3xl font-bold text-purple-600">€{selectedFunnel.metrics.revenue.toLocaleString()}</p>
            </div>
          </div>

          {/* Funnel Steps */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Étapes du tunnel</h3>
            
            <div className="space-y-6">
              {selectedFunnel.steps.map((step, index) => {
                const stepMetrics = selectedFunnel.metrics.stepMetrics[step.id];
                const previousStepMetrics = index > 0 ? 
                  selectedFunnel.metrics.stepMetrics[selectedFunnel.steps[index - 1].id] : 
                  null;
                
                const conversionRate = previousStepMetrics ? 
                  calculateConversionRate(stepMetrics.conversions, previousStepMetrics.visitors) : 
                  '100.0';

                return (
                  <div key={step.id}>
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl">{getStepIcon(step.type)}</span>
                          <div>
                            <h4 className="font-medium text-gray-900">{step.name}</h4>
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStepColor(step.type)}`}>
                              {step.type}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-8">
                        <div className="text-center">
                          <p className="text-sm text-gray-500">Visiteurs</p>
                          <p className="text-lg font-bold text-gray-900">{stepMetrics.visitors.toLocaleString()}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-500">Conversions</p>
                          <p className="text-lg font-bold text-green-600">{stepMetrics.conversions}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-500">Taux</p>
                          <p className="text-lg font-bold text-blue-600">{conversionRate}%</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {index < selectedFunnel.steps.length - 1 && (
                      <div className="flex justify-center py-2">
                        <ArrowDown className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-6 pt-6 border-t">
              <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-medium">
                <Plus className="h-4 w-4" />
                <span>Ajouter une étape</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}