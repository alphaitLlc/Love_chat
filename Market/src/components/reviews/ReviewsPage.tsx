import React, { useState, useEffect } from 'react';
import { Star, Filter, Search, ChevronDown, MessageSquare, ThumbsUp, Flag } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import ReviewForm from './ReviewForm';
import toast from 'react-hot-toast';

interface Review {
  id: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  rating: number;
  title?: string;
  comment: string;
  images?: string[];
  helpfulCount: number;
  isVerified: boolean;
  createdAt: string;
  response?: {
    content: string;
    respondedAt: string;
  };
}

export default function ReviewsPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [myReviews, setMyReviews] = useState<Review[]>([]);
  const [receivedReviews, setReceivedReviews] = useState<Review[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState('recent');
  const [searchTerm, setSearchTerm] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    fetchReviews();
  }, []);
  
  const fetchReviews = async () => {
    setIsLoading(true);
    
    try {
      // In a real implementation, fetch reviews from API
      // For development, use mock data
      setTimeout(() => {
        const mockReviews = [
          {
            id: '1',
            author: {
              id: '3',
              name: 'Pierre Client',
              avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?w=60&h=60&fit=crop&crop=face'
            },
            rating: 5,
            title: 'Excellent produit !',
            comment: 'Je suis très satisfait de ce produit. La qualité est au rendez-vous et la livraison a été rapide.',
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
        ];
        
        const mockMyReviews = [
          {
            id: '4',
            author: {
              id: user?.id || '1',
              name: `${user?.firstName} ${user?.lastName}`,
              avatar: user?.avatar
            },
            rating: 5,
            title: 'Parfait !',
            comment: 'Exactement ce que je cherchais. Je recommande vivement !',
            helpfulCount: 3,
            isVerified: true,
            createdAt: '2024-01-12T11:30:00Z'
          }
        ];
        
        const mockReceivedReviews = user?.role === 'vendor' || user?.role === 'supplier' ? [
          {
            id: '5',
            author: {
              id: '3',
              name: 'Pierre Client',
              avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?w=60&h=60&fit=crop&crop=face'
            },
            rating: 5,
            title: 'Vendeur sérieux',
            comment: 'Très bonne communication et produit conforme à la description. Je recommande ce vendeur !',
            helpfulCount: 7,
            isVerified: true,
            createdAt: '2024-01-14T16:45:00Z'
          },
          {
            id: '6',
            author: {
              id: '4',
              name: 'Sophie Martin',
              avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?w=60&h=60&fit=crop&crop=face'
            },
            rating: 4,
            comment: 'Bonne expérience globale. Livraison un peu lente mais produit de qualité.',
            helpfulCount: 2,
            isVerified: true,
            createdAt: '2024-01-08T13:20:00Z'
          }
        ] : [];
        
        setReviews(mockReviews);
        setMyReviews(mockMyReviews);
        setReceivedReviews(mockReceivedReviews);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Erreur lors du chargement des avis');
      setIsLoading(false);
    }
  };
  
  const handleSubmitReview = async (reviewData: any) => {
    try {
      // In a real implementation, submit review to API
      // For development, add to local state
      const newReview: Review = {
        id: Date.now().toString(),
        author: {
          id: user?.id || '',
          name: `${user?.firstName} ${user?.lastName}`,
          avatar: user?.avatar
        },
        rating: reviewData.rating,
        title: reviewData.title,
        comment: reviewData.comment,
        images: reviewData.images,
        helpfulCount: 0,
        isVerified: true,
        createdAt: new Date().toISOString()
      };
      
      setMyReviews(prev => [newReview, ...prev]);
      setShowReviewForm(false);
    } catch (error) {
      console.error('Error submitting review:', error);
      throw error;
    }
  };
  
  const handleMarkHelpful = (reviewId: string) => {
    setReviews(prev => 
      prev.map(review => 
        review.id === reviewId 
          ? { ...review, helpfulCount: review.helpfulCount + 1 } 
          : review
      )
    );
    
    toast.success('Merci pour votre retour !');
  };
  
  const handleReportReview = (reviewId: string) => {
    toast.success('Avis signalé. Merci de nous aider à maintenir la qualité des avis.');
  };
  
  const handleRespondToReview = (reviewId: string, response: string) => {
    setReceivedReviews(prev => 
      prev.map(review => 
        review.id === reviewId 
          ? { 
              ...review, 
              response: {
                content: response,
                respondedAt: new Date().toISOString()
              }
            } 
          : review
      )
    );
    
    toast.success('Réponse envoyée avec succès !');
  };
  
  const getActiveReviews = () => {
    let activeReviews: Review[] = [];
    
    switch (activeTab) {
      case 'my':
        activeReviews = myReviews;
        break;
      case 'received':
        activeReviews = receivedReviews;
        break;
      default:
        activeReviews = reviews;
    }
    
    // Apply filters
    return activeReviews
      .filter(review => 
        // Rating filter
        (ratingFilter === null || review.rating === ratingFilter) &&
        // Search filter
        (review.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
         (review.title && review.title.toLowerCase().includes(searchTerm.toLowerCase())))
      )
      .sort((a, b) => {
        // Sort
        switch (sortBy) {
          case 'recent':
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          case 'oldest':
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          case 'highest':
            return b.rating - a.rating;
          case 'lowest':
            return a.rating - b.rating;
          case 'helpful':
            return b.helpfulCount - a.helpfulCount;
          default:
            return 0;
        }
      });
  };
  
  const filteredReviews = getActiveReviews();
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Avis</h1>
        <p className="text-gray-600">
          {activeTab === 'my' 
            ? 'Gérez les avis que vous avez laissés' 
            : activeTab === 'received' 
              ? 'Consultez et répondez aux avis que vous avez reçus'
              : 'Découvrez ce que nos clients pensent de nos produits'}
        </p>
      </div>
      
      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('all')}
            className={`pb-4 font-medium text-sm ${
              activeTab === 'all'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Tous les avis
          </button>
          
          <button
            onClick={() => setActiveTab('my')}
            className={`pb-4 font-medium text-sm ${
              activeTab === 'my'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Mes avis
          </button>
          
          {(user?.role === 'vendor' || user?.role === 'supplier') && (
            <button
              onClick={() => setActiveTab('received')}
              className={`pb-4 font-medium text-sm ${
                activeTab === 'received'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Avis reçus
            </button>
          )}
        </div>
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
              placeholder="Rechercher dans les avis..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          {/* Filters */}
          <div className="flex items-center space-x-4">
            {/* Rating Filter */}
            <div className="relative">
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-gray-400" />
                <select
                  value={ratingFilter === null ? 'all' : ratingFilter.toString()}
                  onChange={(e) => setRatingFilter(e.target.value === 'all' ? null : parseInt(e.target.value))}
                  className="appearance-none px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Toutes les notes</option>
                  <option value="5">5 étoiles</option>
                  <option value="4">4 étoiles</option>
                  <option value="3">3 étoiles</option>
                  <option value="2">2 étoiles</option>
                  <option value="1">1 étoile</option>
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
                <option value="oldest">Plus anciens</option>
                <option value="highest">Mieux notés</option>
                <option value="lowest">Moins bien notés</option>
                <option value="helpful">Plus utiles</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Write Review Button */}
      {activeTab === 'my' && !showReviewForm && (
        <div className="mb-8">
          <button
            onClick={() => setShowReviewForm(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Écrire un avis
          </button>
        </div>
      )}
      
      {/* Review Form */}
      {showReviewForm && (
        <div className="mb-8">
          <ReviewForm
            onSubmit={handleSubmitReview}
            onCancel={() => setShowReviewForm(false)}
          />
        </div>
      )}
      
      {/* Reviews List */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredReviews.length > 0 ? (
        <div className="space-y-6">
          {filteredReviews.map((review) => (
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
                          {review.author.name.split(' ').map(n => n[0]).join('')}
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
                      
                      {/* Actions for My Reviews */}
                      {activeTab === 'my' && review.author.id === user?.id && (
                        <div>
                          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                            Modifier
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {review.title && (
                      <h4 className="font-semibold text-gray-900 mt-3">{review.title}</h4>
                    )}
                    
                    <p className="text-gray-700 mt-2">{review.comment}</p>
                    
                    {/* Review Images */}
                    {review.images && review.images.length > 0 && (
                      <div className="flex space-x-2 mt-4">
                        {review.images.map((image, index) => (
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
                    {activeTab !== 'my' && (
                      <div className="flex items-center space-x-4 mt-4">
                        <button
                          onClick={() => handleMarkHelpful(review.id)}
                          className="flex items-center space-x-1 text-gray-600 hover:text-gray-900"
                        >
                          <ThumbsUp className="h-4 w-4" />
                          <span className="text-sm">Utile ({review.helpfulCount})</span>
                        </button>
                        
                        <button
                          onClick={() => handleReportReview(review.id)}
                          className="flex items-center space-x-1 text-gray-600 hover:text-red-600"
                        >
                          <Flag className="h-4 w-4" />
                          <span className="text-sm">Signaler</span>
                        </button>
                      </div>
                    )}
                    
                    {/* Seller Response */}
                    {review.response && (
                      <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-start">
                          <div className="flex-shrink-0 mr-3">
                            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <MessageSquare className="h-4 w-4 text-blue-600" />
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
                    
                    {/* Response Form for Received Reviews */}
                    {activeTab === 'received' && !review.response && (
                      <div className="mt-4">
                        <button
                          onClick={() => {
                            const response = prompt('Votre réponse à cet avis:');
                            if (response) {
                              handleRespondToReview(review.id, response);
                            }
                          }}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Répondre à cet avis
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl shadow-md border border-gray-100">
          <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Star className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            Aucun avis trouvé
          </h3>
          <p className="text-gray-600 mb-6">
            {activeTab === 'my' 
              ? 'Vous n\'avez pas encore laissé d\'avis.' 
              : activeTab === 'received' 
                ? 'Vous n\'avez pas encore reçu d\'avis.' 
                : 'Aucun avis ne correspond à vos critères de recherche.'}
          </p>
          
          {activeTab === 'my' && (
            <button
              onClick={() => setShowReviewForm(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Écrire un avis
            </button>
          )}
        </div>
      )}
    </div>
  );
}