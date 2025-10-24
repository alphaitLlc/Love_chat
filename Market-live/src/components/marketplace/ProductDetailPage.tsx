import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Star, 
  ShoppingCart, 
  Heart, 
  Share2, 
  ChevronRight, 
  Truck, 
  Package, 
  Shield, 
  ArrowLeft, 
  Check, 
  Info, 
  MessageCircle,
  Clock,
  AlertTriangle,
  ThumbsUp,
  Tag,
  Bookmark,
  Zap,
  RefreshCw,
  Award
} from 'lucide-react';
import { useOrders } from '../../contexts/OrderContext';
import { useAuth } from '../../contexts/AuthContext';
import { useAnalytics } from '../../contexts/AnalyticsContext';
import { productService, socialShareService } from '../../services/api';
import { Product } from '../../types';
import toast from 'react-hot-toast';
import SocialShare from '../social/SocialShare';
import { motion } from 'framer-motion';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useOrders();
  const { user } = useAuth();
  const { trackProductView } = useAnalytics();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareLinks, setShareLinks] = useState<Record<string, string>>({});
  const [selectedVariant, setSelectedVariant] = useState<Record<string, string>>({});
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('description');
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProduct(id);
      trackProductView(id);
    }
  }, [id]);

  const fetchProduct = async (productId: string) => {
    setIsLoading(true);
    try {
      const response = await productService.getProduct(productId);
      setProduct(response);
      
      // Set initial quantity to min order if available
      if (response.minOrder && response.minOrder > 1) {
        setQuantity(response.minOrder);
      }
      
      // Fetch share links
      fetchShareLinks(productId);
      
      // Fetch related products
      fetchRelatedProducts(response.category);
      
      // Fetch reviews
      fetchProductReviews(productId);
      
      // Check if product is in favorites
      checkIfFavorite(productId);
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Erreur lors du chargement du produit');
      
      // Mock product for development
      setProduct({
        id: productId,
        title: 'Smartphone Galaxy Pro Max',
        description: 'Dernier modèle avec écran OLED 6.7", 256GB de stockage, triple caméra 108MP, processeur ultra-rapide et batterie longue durée. Ce smartphone haut de gamme offre une expérience utilisateur exceptionnelle avec son écran aux couleurs vibrantes et sa fluidité remarquable. Idéal pour les professionnels et les amateurs de photographie mobile.',
        price: 899.99,
        originalPrice: 1199.99,
        images: [
          'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg',
          'https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg',
          'https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg'
        ],
        category: 'Électronique',
        supplierId: '2',
        stock: 45,
        minOrder: 1,
        tags: ['smartphone', 'samsung', 'android', '5G', 'premium'],
        rating: 4.8,
        reviewCount: 156,
        isPromoted: true,
        specifications: {
          'Écran': 'OLED 6.7" 120Hz',
          'Processeur': 'Octa-core 2.9GHz',
          'RAM': '12GB',
          'Stockage': '256GB',
          'Batterie': '5000mAh',
          'Caméra principale': 'Triple 108MP + 12MP + 10MP',
          'Caméra frontale': '40MP',
          'Système': 'Android 14',
          'Dimensions': '165.1 x 75.6 x 8.9 mm',
          'Poids': '228g',
          'Résistance': 'IP68 (eau et poussière)'
        },
        variants: [
          {
            color: 'Noir',
            storage: '128GB',
            price: 799.99
          },
          {
            color: 'Noir',
            storage: '256GB',
            price: 899.99
          },
          {
            color: 'Bleu',
            storage: '128GB',
            price: 799.99
          },
          {
            color: 'Bleu',
            storage: '256GB',
            price: 899.99
          }
        ],
        shippingInfo: {
          weight: 0.3,
          dimensions: {
            length: 18,
            width: 9,
            height: 2
          },
          freeShippingThreshold: 100,
          processingTime: '1-2 jours ouvrés'
        }
      } as Product);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchShareLinks = async (productId: string) => {
    try {
      const response = await socialShareService.getProductShareLinks(productId);
      setShareLinks(response.shareLinks);
    } catch (error) {
      console.error('Error fetching share links:', error);
      // Mock share links
      setShareLinks({
        facebook: `https://www.facebook.com/sharer/sharer.php?u=https://example.com/products/${productId}`,
        twitter: `https://twitter.com/intent/tweet?url=https://example.com/products/${productId}`,
        whatsapp: `https://wa.me/?text=Check out this product: https://example.com/products/${productId}`,
        email: `mailto:?subject=Check out this product&body=https://example.com/products/${productId}`,
        copy: `https://example.com/products/${productId}`
      });
    }
  };
  
  const fetchRelatedProducts = async (category: string) => {
    try {
      const response = await productService.getProducts({ category });
      if (response && response['hydra:member']) {
        // Filter out current product and limit to 4 products
        const filtered = response['hydra:member']
          .filter((p: Product) => p.id !== id)
          .slice(0, 4);
        setRelatedProducts(filtered);
      }
    } catch (error) {
      console.error('Error fetching related products:', error);
      // Mock related products
      setRelatedProducts([
        {
          id: '2',
          title: 'Laptop Business UltraBook',
          description: 'Ordinateur portable professionnel Intel i7, 16GB RAM, SSD 512GB',
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
          description: 'Casque Bluetooth avec réduction de bruit active, autonomie 30h',
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
        }
      ] as Product[]);
    }
  };
  
  const fetchProductReviews = async (productId: string) => {
    try {
      // In a real implementation, fetch reviews from API
      // For development, use mock data
      setReviews([
        {
          id: '1',
          author: {
            id: '3',
            name: 'Pierre Client',
            avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?w=60&h=60&fit=crop&crop=face'
          },
          rating: 5,
          title: 'Excellent produit !',
          comment: 'Je suis très satisfait de ce smartphone. La qualité est au rendez-vous et la livraison a été rapide.',
          helpfulCount: 12,
          isVerified: true,
          createdAt: '2024-01-15T10:30:00Z',
          response: {
            content: 'Merci pour votre avis ! Nous sommes ravis que vous soyez satisfait de votre achat.',
            respondedAt: '2024-01-16T08:45:00Z'
          }
        },
        {
          id: '2',
          author: {
            id: '4',
            name: 'Sophie Martin',
            avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?w=60&h=60&fit=crop&crop=face'
          },
          rating: 4,
          comment: 'Bon produit dans l\'ensemble. Seul bémol : le délai de livraison un peu long.',
          helpfulCount: 5,
          isVerified: true,
          createdAt: '2024-01-10T14:20:00Z'
        },
        {
          id: '3',
          author: {
            id: '5',
            name: 'Thomas Dubois',
            avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?w=60&h=60&fit=crop&crop=face'
          },
          rating: 3,
          title: 'Mitigé',
          comment: 'Le produit est correct mais ne correspond pas tout à fait à la description. Le rapport qualité-prix n\'est pas optimal.',
          images: [
            'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?w=200&h=200&fit=crop',
            'https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg?w=200&h=200&fit=crop'
          ],
          helpfulCount: 8,
          isVerified: false,
          createdAt: '2024-01-05T09:15:00Z'
        }
      ]);
    } catch (error) {
      console.error('Error fetching product reviews:', error);
    }
  };
  
  const checkIfFavorite = async (productId: string) => {
    // In a real implementation, check if product is in user's favorites
    // For development, use mock data
    setIsFavorite(false);
  };

  const handleAddToCart = async () => {
    if (!product) return;
    
    setIsAddingToCart(true);
    
    try {
      // Get selected variant price if applicable
      let finalProduct = { ...product };
      
      if (Object.keys(selectedVariant).length > 0 && product.variants) {
        const variant = product.variants.find(v => 
          Object.entries(selectedVariant).every(([key, value]) => 
            v[key as keyof typeof v] === value
          )
        );
        
        if (variant) {
          finalProduct.price = variant.price;
        }
      }
      
      addToCart(finalProduct, quantity);
      toast.success(`${product.title} ajouté au panier`);
      
      // Redirect to cart after a short delay
      setTimeout(() => {
        navigate('/cart');
      }, 1000);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Erreur lors de l\'ajout au panier');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (!product) return;
    
    if (newQuantity < (product.minOrder || 1)) {
      setQuantity(product.minOrder || 1);
    } else if (product.maxOrder && newQuantity > product.maxOrder) {
      setQuantity(product.maxOrder);
    } else if (newQuantity > product.stock) {
      setQuantity(product.stock);
    } else {
      setQuantity(newQuantity);
    }
  };

  const toggleFavorite = async () => {
    if (!user) {
      toast.error('Veuillez vous connecter pour ajouter aux favoris');
      navigate('/login');
      return;
    }
    
    setIsFavorite(!isFavorite);
    
    try {
      // API call to toggle favorite
      // await favoriteService.toggleFavorite(product.id);
      toast.success(isFavorite ? 'Retiré des favoris' : 'Ajouté aux favoris');
    } catch (error) {
      console.error('Error toggling favorite:', error);
      setIsFavorite(!isFavorite); // Revert on error
      toast.error('Erreur lors de la modification des favoris');
    }
  };

  const handleShare = async (platform: string) => {
    if (!product) return;
    
    try {
      await socialShareService.trackShare(platform, 'product', product.id, shareLinks[platform]);
      
      // Open share link in new window
      if (platform !== 'copy') {
        window.open(shareLinks[platform], '_blank');
      } else {
        // Copy to clipboard
        await navigator.clipboard.writeText(shareLinks[platform]);
        toast.success('Lien copié dans le presse-papier');
      }
      
      setShowShareModal(false);
    } catch (error) {
      console.error('Error sharing product:', error);
    }
  };

  const contactSeller = () => {
    if (!user) {
      toast.error('Veuillez vous connecter pour contacter le vendeur');
      navigate('/login');
      return;
    }
    
    // Redirect to messaging page with seller conversation
    navigate(`/messages?seller=${product?.supplierId}`);
  };
  
  const handleVariantChange = (attribute: string, value: string) => {
    setSelectedVariant(prev => ({
      ...prev,
      [attribute]: value
    }));
  };
  
  const getVariantPrice = () => {
    if (!product || !product.variants || Object.keys(selectedVariant).length === 0) {
      return product?.price;
    }
    
    const variant = product.variants.find(v => 
      Object.entries(selectedVariant).every(([key, value]) => 
        v[key as keyof typeof v] === value
      )
    );
    
    return variant?.price || product.price;
  };
  
  const getUniqueVariantAttributes = () => {
    if (!product || !product.variants) return {};
    
    const attributes: Record<string, Set<string>> = {};
    
    product.variants.forEach(variant => {
      Object.entries(variant).forEach(([key, value]) => {
        if (key !== 'price') {
          if (!attributes[key]) {
            attributes[key] = new Set();
          }
          attributes[key].add(value);
        }
      });
    });
    
    // Convert Sets to Arrays
    const result: Record<string, string[]> = {};
    Object.entries(attributes).forEach(([key, values]) => {
      result[key] = Array.from(values);
    });
    
    return result;
  };
  
  const handleMarkReviewHelpful = (reviewId: string) => {
    setReviews(prev => 
      prev.map(review => 
        review.id === reviewId 
          ? { ...review, helpfulCount: review.helpfulCount + 1 } 
          : review
      )
    );
    
    toast.success('Merci pour votre retour !');
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

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            Produit non trouvé
          </h3>
          <p className="text-gray-600 mb-4">
            Le produit que vous recherchez n'existe pas ou a été supprimé.
          </p>
          <Link
            to="/marketplace"
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à la marketplace
          </Link>
        </div>
      </div>
    );
  }

  // Ensure images array exists and has at least one image
  const productImages = product.images && product.images.length > 0 
    ? product.images 
    : ['https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg'];

  // Ensure selectedImage index is valid
  const currentImageIndex = selectedImage < productImages.length ? selectedImage : 0;
  
  // Get variant attributes
  const variantAttributes = getUniqueVariantAttributes();
  
  // Calculate current price based on selected variant
  const currentPrice = getVariantPrice();
  const discount = product.originalPrice 
    ? Math.round(((product.originalPrice - currentPrice) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-gray-900">Accueil</Link>
        <ChevronRight className="h-4 w-4 mx-2" />
        <Link to="/marketplace" className="hover:text-gray-900">Marketplace</Link>
        <ChevronRight className="h-4 w-4 mx-2" />
        <Link to={`/marketplace?category=${product.category}`} className="hover:text-gray-900">{product.category}</Link>
        <ChevronRight className="h-4 w-4 mx-2" />
        <span className="text-gray-900 font-medium">{product.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Images */}
        <div>
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-4">
            <img
              src={productImages[currentImageIndex]}
              alt={product.title}
              className="w-full h-96 object-contain"
            />
          </div>
          
          {productImages.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {productImages.map((image, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`cursor-pointer rounded-lg overflow-hidden border-2 ${
                    currentImageIndex === index ? 'border-blue-500' : 'border-transparent'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.title} - Image ${index + 1}`}
                    className="w-full h-20 object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded-full">
                {product.category}
              </span>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleFavorite}
                  className={`p-2 rounded-full ${
                    isFavorite ? 'bg-red-50 text-red-500' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
                </button>
                
                <button
                  onClick={() => setShowShareModal(true)}
                  className="p-2 bg-gray-100 text-gray-500 rounded-full hover:bg-gray-200"
                >
                  <Share2 className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.title}</h1>
            
            <div className="flex items-center mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(product.rating) 
                        ? 'text-yellow-400 fill-current' 
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="ml-2 text-sm text-gray-600">
                {product.rating.toFixed(1)} ({product.reviewCount} avis)
              </span>
              <Link to="#reviews" className="ml-4 text-sm text-blue-600 hover:text-blue-800">
                Voir les avis
              </Link>
            </div>
            
            <div className="flex items-center space-x-4 mb-6">
              <span className="text-3xl font-bold text-gray-900">
                €{currentPrice.toFixed(2)}
              </span>
              
              {product.originalPrice && (
                <span className="text-xl text-gray-500 line-through">
                  €{product.originalPrice.toFixed(2)}
                </span>
              )}
              
              {discount > 0 && (
                <span className="bg-red-100 text-red-800 text-sm font-semibold px-2.5 py-0.5 rounded">
                  -{discount}%
                </span>
              )}
            </div>
            
            {/* Variants */}
            {product.variants && Object.keys(variantAttributes).length > 0 && (
              <div className="mb-6 space-y-4">
                {Object.entries(variantAttributes).map(([attribute, values]) => (
                  <div key={attribute}>
                    <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                      {attribute}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {values.map(value => (
                        <button
                          key={value}
                          onClick={() => handleVariantChange(attribute, value)}
                          className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                            selectedVariant[attribute] === value
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {value}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Stock Info */}
            <div className="flex items-center space-x-2 mb-6">
              {product.stock > 0 ? (
                <div className="flex items-center text-green-600">
                  <Check className="h-5 w-5 mr-1" />
                  <span className="font-medium">
                    {product.stock > 10 
                      ? 'En stock' 
                      : `Plus que ${product.stock} en stock`}
                  </span>
                </div>
              ) : (
                <div className="flex items-center text-red-600">
                  <Info className="h-5 w-5 mr-1" />
                  <span className="font-medium">Rupture de stock</span>
                </div>
              )}
              
              {product.stock > 0 && product.stock <= 10 && (
                <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                  Stock limité
                </span>
              )}
            </div>
            
            {/* Quantity Selector */}
            {product.stock > 0 && (
              <div className="mb-6">
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                  Quantité
                </label>
                <div className="flex items-center">
                  <button
                    onClick={() => handleQuantityChange(quantity - 1)}
                    className="p-2 border border-gray-300 rounded-l-lg hover:bg-gray-100"
                    disabled={quantity <= (product.minOrder || 1)}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    id="quantity"
                    value={quantity}
                    onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                    min={product.minOrder || 1}
                    max={Math.min(product.maxOrder || Infinity, product.stock)}
                    className="w-16 text-center border-y border-gray-300 py-2"
                  />
                  <button
                    onClick={() => handleQuantityChange(quantity + 1)}
                    className="p-2 border border-gray-300 rounded-r-lg hover:bg-gray-100"
                    disabled={quantity >= Math.min(product.maxOrder || Infinity, product.stock)}
                  >
                    +
                  </button>
                  
                  <div className="ml-4 text-sm text-gray-500">
                    {product.minOrder && product.minOrder > 1 && (
                      <span>Min: {product.minOrder}</span>
                    )}
                    {product.maxOrder && (
                      <span>{product.minOrder && product.minOrder > 1 ? ' • ' : ''}Max: {product.maxOrder}</span>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 mb-8">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddToCart}
                disabled={product.stock === 0 || isAddingToCart}
                className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAddingToCart ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                    <span>Ajout en cours...</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-5 w-5" />
                    <span>Ajouter au panier</span>
                  </>
                )}
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={contactSeller}
                className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <MessageCircle className="h-5 w-5" />
                <span>Contacter le vendeur</span>
              </motion.button>
            </div>
            
            {/* Key Features */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Points forts</h3>
              <ul className="space-y-2">
                {product.specifications && Object.entries(product.specifications).slice(0, 5).map(([key, value]) => (
                  <li key={key} className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span><strong>{key}:</strong> {value}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Shipping & Returns */}
            <div className="space-y-4 mb-8">
              <div className="flex items-start space-x-3">
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Truck className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Livraison</h3>
                  <p className="text-sm text-gray-600">
                    Livraison gratuite dès 100€ d'achat. Livraison standard en 2-5 jours ouvrés.
                    {product.shippingInfo?.processingTime && (
                      <span className="block mt-1">Temps de préparation: {product.shippingInfo.processingTime}</span>
                    )}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <RefreshCw className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Retours</h3>
                  <p className="text-sm text-gray-600">
                    Retours gratuits sous 30 jours. Voir conditions.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Shield className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Garantie</h3>
                  <p className="text-sm text-gray-600">
                    Garantie 2 ans. Protection acheteur LinkMarket.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag, index) => (
                    <Link
                      key={index}
                      to={`/marketplace?search=${tag}`}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors"
                    >
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </Link>
                  ))}
                </div>
              </div>
            )}
            
            {/* Seller Info */}
            <div className="border-t pt-6">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Vendeur</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium">VP</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Vendeur Pro</p>
                    <div className="flex items-center">
                      <Star className="h-3 w-3 text-yellow-400 fill-current" />
                      <span className="text-xs text-gray-600 ml-1">4.9 (120 avis)</span>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={contactSeller}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Voir profil
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <div className="mt-12">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('description')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'description'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Description
            </button>
            <button
              onClick={() => setActiveTab('specifications')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'specifications'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Spécifications
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'reviews'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Avis ({reviews.length})
            </button>
            <button
              onClick={() => setActiveTab('shipping')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'shipping'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Livraison & Retours
            </button>
          </nav>
        </div>
        
        <div className="py-6">
          {/* Description Tab */}
          {activeTab === 'description' && (
            <div className="prose prose-blue max-w-none">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Description du produit</h2>
              <div className="text-gray-700 space-y-4">
                <p>{product.description}</p>
                
                {/* Additional description content */}
                <p>
                  Ce smartphone haut de gamme est conçu pour répondre aux besoins des utilisateurs les plus exigeants. 
                  Avec son écran OLED de 6.7 pouces, vous profiterez d'une qualité d'image exceptionnelle et de couleurs vibrantes.
                </p>
                
                <p>
                  La triple caméra arrière de 108MP vous permettra de capturer des photos d'une netteté impressionnante, 
                  même dans des conditions de faible luminosité. Le mode nuit avancé et la stabilisation optique 
                  vous garantissent des clichés parfaits en toutes circonstances.
                </p>
                
                <p>
                  Grâce à sa batterie de 5000mAh, vous pourrez utiliser votre appareil toute la journée sans vous soucier 
                  de la recharge. Et lorsque vous aurez besoin de recharger, la charge rapide 45W vous permettra 
                  de récupérer 50% de batterie en seulement 20 minutes.
                </p>
                
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">Points forts</h3>
                  <ul className="list-disc pl-5 text-blue-800 space-y-1">
                    <li>Écran OLED 6.7" avec taux de rafraîchissement 120Hz</li>
                    <li>Triple caméra arrière 108MP avec zoom optique 5x</li>
                    <li>Processeur ultra-rapide pour des performances exceptionnelles</li>
                    <li>Batterie 5000mAh avec charge rapide 45W</li>
                    <li>Résistance à l'eau et à la poussière (IP68)</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
          
          {/* Specifications Tab */}
          {activeTab === 'specifications' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Spécifications techniques</h2>
              
              <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
                <div className="divide-y divide-gray-200">
                  {product.specifications && Object.entries(product.specifications).map(([key, value], index) => (
                    <div 
                      key={key}
                      className={`flex ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}
                    >
                      <div className="w-1/3 px-6 py-4 font-medium text-gray-900">
                        {key}
                      </div>
                      <div className="w-2/3 px-6 py-4 text-gray-700">
                        {value}
                      </div>
                    </div>
                  ))}
                  
                  {!product.specifications && (
                    <div className="p-6 text-center text-gray-500">
                      Aucune spécification disponible pour ce produit.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div id="reviews">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Avis clients</h2>
                <Link 
                  to={user ? "/reviews?write=true" : "/login?redirect=/reviews?write=true"}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Écrire un avis
                </Link>
              </div>
              
              {/* Reviews Summary */}
              <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Overall Rating */}
                  <div className="text-center">
                    <div className="text-5xl font-bold text-gray-900 mb-2">{product.rating.toFixed(1)}</div>
                    <div className="flex items-center justify-center mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${
                            i < Math.floor(product.rating) 
                              ? 'text-yellow-400 fill-current' 
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-gray-600">{product.reviewCount} avis</p>
                  </div>
                  
                  {/* Rating Distribution */}
                  <div className="col-span-2">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Distribution des notes</h3>
                    <div className="space-y-2">
                      {[5, 4, 3, 2, 1].map(rating => {
                        // Calculate percentage (mock data)
                        const percentage = rating === 5 ? 70 : 
                                          rating === 4 ? 20 : 
                                          rating === 3 ? 5 : 
                                          rating === 2 ? 3 : 2;
                        
                        return (
                          <div key={rating} className="flex items-center">
                            <div className="flex items-center w-24">
                              <span className="text-sm text-gray-600">{rating}</span>
                              <Star className="h-4 w-4 text-yellow-400 fill-current ml-1" />
                            </div>
                            <div className="flex-1 h-2 bg-gray-200 rounded-full mx-2">
                              <div 
                                className="h-2 bg-yellow-400 rounded-full" 
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600 w-12">{percentage}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Reviews List */}
              <div className="space-y-6">
                {reviews.length > 0 ? (
                  reviews.map((review) => (
                    <div key={review.id} className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
                      <div className="p-6">
                        <div className="flex items-start">
                          {/* Author Avatar */}
                          <div className="flex-shrink-0 mr-4">
                            {review.author.avatar ? (
                              <img
                                src={review.author.avatar}
                                alt={review.author.name}
                                className="h-12 w-12 rounded-full"
                              />
                            ) : (
                              <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                                <span className="text-white font-medium">
                                  {review.author.name.split(' ').map((n: string) => n[0]).join('')}
                                </span>
                              </div>
                            )}
                          </div>
                          
                          {/* Review Content */}
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="flex items-center">
                                  <h3 className="font-medium text-gray-900">{review.author.name}</h3>
                                  {review.isVerified && (
                                    <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                                      Achat vérifié
                                    </span>
                                  )}
                                </div>
                                
                                <div className="flex items-center mt-1">
                                  <div className="flex">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <Star
                                        key={star}
                                        className={`h-4 w-4 ${
                                          star <= review.rating
                                            ? 'text-yellow-400 fill-current'
                                            : 'text-gray-300'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  <span className="ml-2 text-sm text-gray-500">
                                    {new Date(review.createdAt).toLocaleDateString('fr-FR', {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric'
                                    })}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            {review.title && (
                              <h4 className="font-semibold text-gray-900 mt-3">{review.title}</h4>
                            )}
                            
                            <p className="text-gray-700 mt-2">{review.comment}</p>
                            
                            {/* Review Images */}
                            {review.images && review.images.length > 0 && (
                              <div className="flex space-x-2 mt-4">
                                {review.images.map((image: string, index: number) => (
                                  <img
                                    key={index}
                                    src={image}
                                    alt={`Review image ${index + 1}`}
                                    className="h-20 w-20 object-cover rounded-lg"
                                  />
                                ))}
                              </div>
                            )}
                            
                            {/* Review Actions */}
                            <div className="flex items-center space-x-4 mt-4">
                              <button
                                onClick={() => handleMarkReviewHelpful(review.id)}
                                className="flex items-center space-x-1 text-gray-600 hover:text-gray-900"
                              >
                                <ThumbsUp className="h-4 w-4" />
                                <span className="text-sm">Utile ({review.helpfulCount})</span>
                              </button>
                            </div>
                            
                            {/* Seller Response */}
                            {review.response && (
                              <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                                <div className="flex items-start">
                                  <div className="flex-shrink-0 mr-3">
                                    <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                                      <MessageCircle className="h-4 w-4 text-blue-600" />
                                    </div>
                                  </div>
                                  <div>
                                    <div className="flex items-center">
                                      <h4 className="font-medium text-gray-900">Réponse du vendeur</h4>
                                      <span className="ml-2 text-xs text-gray-500">
                                        {new Date(review.response.respondedAt).toLocaleDateString('fr-FR', {
                                          year: 'numeric',
                                          month: 'long',
                                          day: 'numeric'
                                        })}
                                      </span>
                                    </div>
                                    <p className="text-gray-700 mt-1">{review.response.content}</p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 bg-white rounded-xl shadow-md border border-gray-100">
                    <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Star className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-medium text-gray-900 mb-2">
                      Aucun avis pour le moment
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Soyez le premier à donner votre avis sur ce produit !
                    </p>
                    <Link 
                      to={user ? "/reviews?write=true" : "/login?redirect=/reviews?write=true"}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Écrire un avis
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Shipping Tab */}
          {activeTab === 'shipping' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Livraison & Retours</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Shipping Info */}
                <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Truck className="h-5 w-5 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Informations de livraison</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900">Délais de livraison</h4>
                      <p className="text-gray-600 mt-1">
                        <span className="block">• Livraison standard: 2-5 jours ouvrés</span>
                        <span className="block">• Livraison express: 1-2 jours ouvrés (supplément)</span>
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900">Frais de livraison</h4>
                      <p className="text-gray-600 mt-1">
                        <span className="block">• Livraison gratuite dès 100€ d'achat</span>
                        <span className="block">• Livraison standard: 9,99€</span>
                        <span className="block">• Livraison express: 14,99€</span>
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900">Zones de livraison</h4>
                      <p className="text-gray-600 mt-1">
                        <span className="block">• France métropolitaine</span>
                        <span className="block">• Belgique, Luxembourg, Suisse</span>
                        <span className="block">• Autres pays de l'UE (délais supplémentaires)</span>
                      </p>
                    </div>
                    
                    {product.shippingInfo && (
                      <div>
                        <h4 className="font-medium text-gray-900">Informations supplémentaires</h4>
                        <p className="text-gray-600 mt-1">
                          <span className="block">• Poids: {product.shippingInfo.weight}kg</span>
                          {product.shippingInfo.dimensions && (
                            <span className="block">
                              • Dimensions: {product.shippingInfo.dimensions.length} x {product.shippingInfo.dimensions.width} x {product.shippingInfo.dimensions.height} cm
                            </span>
                          )}
                          <span className="block">• Temps de préparation: {product.shippingInfo.processingTime}</span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Returns Info */}
                <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <RefreshCw className="h-5 w-5 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Politique de retour</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900">Conditions de retour</h4>
                      <p className="text-gray-600 mt-1">
                        <span className="block">• Retours acceptés sous 30 jours après réception</span>
                        <span className="block">• Produit non utilisé, dans son emballage d'origine</span>
                        <span className="block">• Étiquettes et accessoires intacts</span>
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900">Procédure de retour</h4>
                      <p className="text-gray-600 mt-1">
                        <span className="block">1. Contactez le service client</span>
                        <span className="block">2. Recevez une étiquette de retour par email</span>
                        <span className="block">3. Emballez le produit avec soin</span>
                        <span className="block">4. Déposez le colis dans un point relais</span>
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900">Remboursements</h4>
                      <p className="text-gray-600 mt-1">
                        <span className="block">• Traitement sous 5-7 jours après réception du retour</span>
                        <span className="block">• Remboursement sur le mode de paiement initial</span>
                        <span className="block">• Frais de livraison initiaux non remboursés</span>
                      </p>
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-900">Protection acheteur LinkMarket</h4>
                      <p className="text-blue-700 mt-1 text-sm">
                        Tous les achats sur notre plateforme sont couverts par notre protection acheteur, 
                        vous garantissant un remboursement en cas de non-livraison ou de produit non conforme.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Produits similaires</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {relatedProducts.map(relatedProduct => (
            <div key={relatedProduct.id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-300">
              <Link to={`/products/${relatedProduct.id}`} className="block">
                <div className="aspect-square overflow-hidden">
                  <img
                    src={relatedProduct.images[0]}
                    alt={relatedProduct.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 mb-1 hover:text-blue-600 transition-colors line-clamp-2">
                    {relatedProduct.title}
                  </h3>
                  
                  <div className="flex items-center space-x-1 mb-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i < Math.floor(relatedProduct.rating) 
                              ? 'text-yellow-400 fill-current' 
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">
                      ({relatedProduct.reviewCount})
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-gray-900">
                      €{relatedProduct.price.toFixed(2)}
                    </span>
                    {relatedProduct.originalPrice && (
                      <span className="text-sm text-gray-500 line-through">
                        €{relatedProduct.originalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Partager ce produit</h3>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                onClick={() => handleShare('facebook')}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg"
              >
                <span>Facebook</span>
              </button>
              
              <button
                onClick={() => handleShare('twitter')}
                className="flex items-center space-x-2 px-4 py-2 bg-sky-500 text-white rounded-lg"
              >
                <span>Twitter</span>
              </button>
              
              <button
                onClick={() => handleShare('whatsapp')}
                className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg"
              >
                <span>WhatsApp</span>
              </button>
              
              <button
                onClick={() => handleShare('email')}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg"
              >
                <span>Email</span>
              </button>
            </div>
            
            <div className="flex items-center space-x-2 mb-4">
              <input
                type="text"
                value={shareLinks.copy || ''}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50"
              />
              <button
                onClick={() => handleShare('copy')}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Copier
              </button>
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={() => setShowShareModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}