import React, { useState, useEffect } from 'react';
import { Heart, Trash2, Search, Filter, ChevronDown, Grid, List } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Product } from '../../types';
import ProductCard from '../marketplace/ProductCard';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function FavoritesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    fetchFavorites();
  }, []);
  
  const fetchFavorites = async () => {
    setIsLoading(true);
    
    try {
      // In a real implementation, fetch favorites from API
      // For development, use mock data
      setTimeout(() => {
        const mockFavorites = [
          {
            id: '1',
            title: 'Smartphone Galaxy Pro Max',
            description: 'Dernier modèle avec écran OLED 6.7", 256GB de stockage, triple caméra 108MP',
            price: 899.99,
            originalPrice: 1199.99,
            images: ['https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg'],
            category: 'Électronique',
            supplierId: '2',
            stock: 45,
            minOrder: 1,
            tags: ['smartphone', 'samsung', 'android', '5G'],
            rating: 4.8,
            reviewCount: 156,
            isPromoted: true
          },
          {
            id: '2',
            title: 'Laptop Business UltraBook',
            description: 'Ordinateur portable professionnel Intel i7, 16GB RAM, SSD 512GB, écran 14"',
            price: 1249.99,
            originalPrice: 1399.99,
            images: ['https://images.pexels.com/photos/18105/pexels-photo.jpg'],
            category: 'Informatique',
            supplierId: '2',
            stock: 23,
            minOrder: 1,
            tags: ['laptop', 'business', 'intel', 'ssd'],
            rating: 4.9,
            reviewCount: 89,
            isPromoted: false
          }
        ];
        
        setFavorites(mockFavorites);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      toast.error('Erreur lors du chargement des favoris');
      setIsLoading(false);
    }
  };
  
  const handleRemoveFavorite = (productId: string) => {
    setFavorites(prev => prev.filter(product => product.id !== productId));
    toast.success('Produit retiré des favoris');
  };
  
  const handleAddToCart = (product: Product) => {
    // This would be handled by the ProductCard component
    toast.success(`${product.title} ajouté au panier`);
  };
  
  const handleViewProduct = (product: Product) => {
    navigate(`/products/${product.id}`);
  };
  
  const filteredFavorites = favorites.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'price-asc':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      case 'name':
        return a.title.localeCompare(b.title);
      case 'rating':
        return b.rating - a.rating;
      default:
        return 0;
    }
  });
  
  // Get unique categories
  const categories = ['all', ...Array.from(new Set(favorites.map(product => product.category)))];
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Mes Favoris
        </h1>
        <p className="text-gray-600">
          Gérez votre liste de produits favoris
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
              placeholder="Rechercher dans vos favoris..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          {/* Filters */}
          <div className="flex items-center space-x-4">
            {/* Category Filter */}
            <div className="relative">
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-gray-400" />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="appearance-none px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Toutes catégories</option>
                  {categories.filter(cat => cat !== 'all').map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
              </div>
            </div>
            
            {/* Sort By */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="recent">Plus récents</option>
                <option value="price-asc">Prix croissant</option>
                <option value="price-desc">Prix décroissant</option>
                <option value="name">Nom</option>
                <option value="rating">Note</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
            </div>
            
            {/* View Mode */}
            <div className="flex items-center space-x-2 border border-gray-300 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-l-lg ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-r-lg ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Favorites List */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredFavorites.length > 0 ? (
        <div className={`grid gap-6 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
            : 'grid-cols-1'
        }`}>
          {filteredFavorites.map(product => (
            <div key={product.id} className="relative group">
              <ProductCard
                product={product}
                onView={handleViewProduct}
                onAddToCart={handleAddToCart}
                onToggleFavorite={() => handleRemoveFavorite(product.id)}
                isFavorite={true}
              />
              <button
                onClick={() => handleRemoveFavorite(product.id)}
                className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-md hover:bg-red-50 hover:text-red-600 transition-colors z-10"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl shadow-md border border-gray-100">
          <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            Aucun favori trouvé
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || categoryFilter !== 'all'
              ? 'Aucun favori ne correspond à vos critères de recherche.'
              : 'Vous n\'avez pas encore ajouté de produits à vos favoris.'}
          </p>
          <button
            onClick={() => navigate('/marketplace')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Explorer la marketplace
          </button>
        </div>
      )}
    </div>
  );
}