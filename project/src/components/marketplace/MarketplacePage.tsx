import React, { useState, useMemo } from 'react';
import { Search, Filter, Grid, List, ChevronDown, Star, Package, Truck } from 'lucide-react';
import ProductCard from './ProductCard';
import { Product } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

// Mock products data
const mockProducts: Product[] = [
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
  },
  {
    id: '3',
    title: 'Casque Audio Sans-Fil Premium',
    description: 'Casque Bluetooth avec réduction de bruit active, autonomie 30h, qualité studio',
    price: 199.99,
    originalPrice: 299.99,
    images: ['https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg'],
    category: 'Audio',
    supplierId: '2',
    stock: 67,
    minOrder: 2,
    tags: ['casque', 'bluetooth', 'audio', 'sans-fil'],
    rating: 4.7,
    reviewCount: 234,
    isPromoted: true
  },
  {
    id: '4',
    title: 'Montre Connectée Sport',
    description: 'Montre intelligente avec GPS, capteur cardiaque, étanche, 7 jours d\'autonomie',
    price: 149.99,
    images: ['https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg'],
    category: 'Wearables',
    supplierId: '2',
    stock: 8,
    minOrder: 1,
    tags: ['montre', 'sport', 'gps', 'fitness'],
    rating: 4.5,
    reviewCount: 167,
    isPromoted: false
  },
  {
    id: '5',
    title: 'Appareil Photo Mirrorless',
    description: 'Appareil photo 24MP, objectif interchangeable, vidéo 4K, compact et léger',
    price: 799.99,
    originalPrice: 899.99,
    images: ['https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg'],
    category: 'Photo',
    supplierId: '2',
    stock: 15,
    minOrder: 1,
    tags: ['appareil-photo', 'mirrorless', '4k', 'compact'],
    rating: 4.9,
    reviewCount: 98,
    isPromoted: false
  },
  {
    id: '6',
    title: 'Tablette Graphique Professionnelle',
    description: 'Tablette pour créateurs, 15.6", 4K, stylet inclus, compatible Windows/Mac',
    price: 599.99,
    images: ['https://images.pexels.com/photos/1779487/pexels-photo-1779487.jpeg'],
    category: 'Design',
    supplierId: '2',
    stock: 34,
    minOrder: 1,
    tags: ['tablette', 'graphique', 'design', 'créatif'],
    rating: 4.6,
    reviewCount: 76,
    isPromoted: false
  }
];

export default function MarketplacePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 2000 });
  const [sortBy, setSortBy] = useState('relevance');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  const categories = [
    'Tous',
    'Électronique', 
    'Informatique', 
    'Audio', 
    'Wearables', 
    'Photo', 
    'Design'
  ];

  const sortOptions = [
    { value: 'relevance', label: 'Pertinence' },
    { value: 'price-asc', label: 'Prix croissant' },
    { value: 'price-desc', label: 'Prix décroissant' },
    { value: 'rating', label: 'Mieux notés' },
    { value: 'newest', label: 'Plus récents' }
  ];

  const filteredProducts = useMemo(() => {
    let filtered = mockProducts.filter(product => {
      const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = !selectedCategory || selectedCategory === 'Tous' || 
                            product.category === selectedCategory;
      
      const matchesPrice = product.price >= priceRange.min && product.price <= priceRange.max;
      
      return matchesSearch && matchesCategory && matchesPrice;
    });

    // Tri
    switch (sortBy) {
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        filtered.sort((a, b) => b.id.localeCompare(a.id));
        break;
      default:
        // Pertinence - produits promus en premier
        filtered.sort((a, b) => (b.isPromoted ? 1 : 0) - (a.isPromoted ? 1 : 0));
    }

    return filtered;
  }, [searchTerm, selectedCategory, priceRange, sortBy]);

  const handleAddToCart = (product: Product) => {
    console.log('Ajout au panier:', product);
    // Ici on implémenterait la logique d'ajout au panier
  };

  const handleViewProduct = (product: Product) => {
    navigate(`/products/${product.id}`);
  };

  const handleToggleFavorite = (product: Product) => {
    setFavorites(prev => 
      prev.includes(product.id) 
        ? prev.filter(id => id !== product.id)
        : [...prev, product.id]
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {user?.role === 'vendor' ? 'Catalogue Fournisseurs' : 
           user?.role === 'supplier' ? 'Vos Produits' : 
           'Marketplace'}
        </h1>
        <p className="text-gray-600">
          {user?.role === 'vendor' ? 'Découvrez les produits de nos fournisseurs partenaires' :
           user?.role === 'supplier' ? 'Gérez votre catalogue de produits' :
           'Explorez notre sélection de produits de qualité'}
        </p>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-100">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          
          {/* Recherche */}
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Rechercher des produits..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Catégories */}
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category === 'Tous' ? '' : category)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  (category === 'Tous' && !selectedCategory) || selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="h-4 w-4" />
              <span>Filtres</span>
            </button>

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

        {/* Filtres avancés */}
        {showFilters && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Prix */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gamme de prix
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, min: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-gray-500">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Tri */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trier par
                </label>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                  >
                    {sortOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Note minimum */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Note minimum
                </label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map(rating => (
                    <button
                      key={rating}
                      className="flex items-center space-x-1 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm">{rating}+</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Résultats */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-600">
          {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''} trouvé{filteredProducts.length > 1 ? 's' : ''}
        </p>
        
        {searchTerm && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Recherche pour:</span>
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
              "{searchTerm}"
            </span>
            <button
              onClick={() => setSearchTerm('')}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
        )}
      </div>

      {/* Grille de produits */}
      {filteredProducts.length > 0 ? (
        <div className={`grid gap-6 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
            : 'grid-cols-1'
        }`}>
          {filteredProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onView={handleViewProduct}
              onAddToCart={handleAddToCart}
              onToggleFavorite={handleToggleFavorite}
              isFavorite={favorites.includes(product.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            Aucun produit trouvé
          </h3>
          <p className="text-gray-600 mb-4">
            Essayez de modifier vos critères de recherche ou parcourez toutes les catégories.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('');
              setPriceRange({ min: 0, max: 2000 });
            }}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Réinitialiser les filtres
          </button>
        </div>
      )}
    </div>
  );
}