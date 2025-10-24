import React from 'react';
import { Star, ShoppingCart, Heart, Eye, Package, Truck } from 'lucide-react';
import { Product } from '../../types';
import { Link } from 'react-router-dom';

interface ProductCardProps {
  product: Product;
  onView: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onToggleFavorite: (product: Product) => void;
  isFavorite?: boolean;
}

export default function ProductCard({ 
  product, 
  onView, 
  onAddToCart, 
  onToggleFavorite, 
  isFavorite = false 
}: ProductCardProps) {
  const discount = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 group">
      {/* Image du produit */}
      <Link to={`/products/${product.id}`} className="block relative aspect-square overflow-hidden">
        <img
          src={product.images[0] || 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg'}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col space-y-1">
          {discount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              -{discount}%
            </span>
          )}
          {product.isPromoted && (
            <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              Promo
            </span>
          )}
          {product.stock < 10 && product.stock > 0 && (
            <span className="bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              Stock faible
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="absolute top-3 right-3 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleFavorite(product);
            }}
            className={`p-2 rounded-full ${
              isFavorite ? 'bg-red-500 text-white' : 'bg-white/80 text-gray-600 hover:bg-red-50 hover:text-red-500'
            } transition-colors shadow-md`}
          >
            <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onView(product);
            }}
            className="p-2 bg-white/80 text-gray-600 rounded-full hover:bg-blue-50 hover:text-blue-500 transition-colors shadow-md"
          >
            <Eye className="h-4 w-4" />
          </button>
        </div>

        {/* Stock status */}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-white font-bold text-lg">Rupture de stock</span>
          </div>
        )}
      </Link>

      {/* Contenu */}
      <div className="p-4">
        {/* Catégorie */}
        <span className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded-full">
          {product.category}
        </span>

        {/* Titre */}
        <Link to={`/products/${product.id}`} className="block">
          <h3 className="text-lg font-bold text-gray-900 mt-2 mb-1 line-clamp-2 hover:text-blue-600 transition-colors">
            {product.title}
          </h3>
        </Link>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {product.description}
        </p>

        {/* Prix */}
        <div className="flex items-center space-x-2 mb-3">
          <span className="text-2xl font-bold text-gray-900">
            €{product.price.toFixed(2)}
          </span>
          {product.originalPrice && (
            <span className="text-lg text-gray-500 line-through">
              €{product.originalPrice.toFixed(2)}
            </span>
          )}
        </div>

        {/* Rating et reviews */}
        <div className="flex items-center space-x-2 mb-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < Math.floor(product.rating) 
                    ? 'text-yellow-400 fill-current' 
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-600">
            {product.rating.toFixed(1)} ({product.reviewCount} avis)
          </span>
        </div>

        {/* Informations de stock et commande minimum */}
        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
          <div className="flex items-center space-x-1">
            <Package className="h-4 w-4" />
            <span>Stock: {product.stock}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Truck className="h-4 w-4" />
            <span>Min: {product.minOrder}</span>
          </div>
        </div>

        {/* Tags */}
        {product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {product.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
            {product.tags.length > 3 && (
              <span className="text-xs text-gray-500">
                +{product.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Bouton d'action */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onAddToCart(product);
          }}
          disabled={product.stock === 0}
          className={`w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-colors ${
            product.stock === 0
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          <ShoppingCart className="h-4 w-4" />
          <span>
            {product.stock === 0 ? 'Rupture de stock' : 'Ajouter au panier'}
          </span>
        </button>
      </div>
    </div>
  );
}