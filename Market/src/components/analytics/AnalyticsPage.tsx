import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Users, Package, ShoppingCart, Euro, Calendar, Filter } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const mockSalesData = [
  { name: 'Jan', ventes: 4000, commandes: 24, clients: 12 },
  { name: 'Fév', ventes: 3000, commandes: 18, clients: 15 },
  { name: 'Mar', ventes: 5000, commandes: 32, clients: 20 },
  { name: 'Avr', ventes: 4500, commandes: 28, clients: 18 },
  { name: 'Mai', ventes: 6000, commandes: 38, clients: 25 },
  { name: 'Jun', ventes: 5500, commandes: 35, clients: 22 },
];

const mockProductData = [
  { name: 'Électronique', value: 45, color: '#3B82F6' },
  { name: 'Mode', value: 25, color: '#10B981' },
  { name: 'Maison', value: 15, color: '#F59E0B' },
  { name: 'Sport', value: 10, color: '#EF4444' },
  { name: 'Autres', value: 5, color: '#8B5CF6' },
];

const mockTopProducts = [
  { name: 'Smartphone Galaxy Pro', ventes: 156, revenus: 89999.99 },
  { name: 'Laptop Business Ultra', ventes: 89, revenus: 67499.99 },
  { name: 'Casque Audio Premium', ventes: 234, revenus: 45999.99 },
  { name: 'Montre Connectée Sport', ventes: 167, revenus: 25999.99 },
  { name: 'Appareil Photo Mirrorless', ventes: 98, revenus: 78999.99 },
];

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  const stats = [
    {
      title: 'Chiffre d\'affaires',
      value: '€45,678',
      change: '+12.5%',
      trend: 'up',
      icon: Euro,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Commandes',
      value: '1,234',
      change: '+8.2%',
      trend: 'up',
      icon: ShoppingCart,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Nouveaux clients',
      value: '89',
      change: '+15.3%',
      trend: 'up',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Produits vendus',
      value: '2,567',
      change: '-2.1%',
      trend: 'down',
      icon: Package,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Tableau de bord analytique
            </h1>
            <p className="text-gray-600">
              Suivez vos performances et analysez vos données de vente
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-gray-400" />
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="week">7 derniers jours</option>
                <option value="month">30 derniers jours</option>
                <option value="quarter">3 derniers mois</option>
                <option value="year">12 derniers mois</option>
              </select>
            </div>
            
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter className="h-4 w-4" />
              <span>Filtres</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    {stat.trend === 'up' ? (
                      <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                    )}
                    <span className={`text-sm font-medium ${
                      stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change}
                    </span>
                    <span className="text-gray-500 text-sm ml-1">vs mois dernier</span>
                  </div>
                </div>
                <div className={`h-12 w-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Sales Chart */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Évolution des ventes</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mockSalesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'ventes' ? `€${value}` : value,
                  name === 'ventes' ? 'Ventes' : name === 'commandes' ? 'Commandes' : 'Clients'
                ]}
              />
              <Line 
                type="monotone" 
                dataKey="ventes" 
                stroke="#3B82F6" 
                strokeWidth={3}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Orders Chart */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Commandes par mois</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mockSalesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="commandes" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Categories */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Répartition par catégorie</h3>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={mockProductData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {mockProductData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, 'Part']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {mockProductData.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-sm text-gray-600">{item.name}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Produits les plus vendus</h3>
          <div className="space-y-4">
            {mockTopProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-sm">{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.ventes} ventes</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900 text-sm">
                    €{product.revenus.toLocaleString('fr-FR')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">💡 Insights & Recommandations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Tendance positive</h4>
            <p className="text-sm text-gray-600">
              Vos ventes ont augmenté de 12.5% ce mois-ci. Continuez sur cette lancée !
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Opportunité</h4>
            <p className="text-sm text-gray-600">
              La catégorie "Électronique" performe bien. Considérez étendre votre catalogue.
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Action recommandée</h4>
            <p className="text-sm text-gray-600">
              Relancez vos clients inactifs avec une offre spéciale pour booster les ventes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}