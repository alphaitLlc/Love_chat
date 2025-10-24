import React, { useState } from 'react';
import { Star, ThumbsUp, Flag, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
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

interface ProductReviewsProps {
  productId: string;
  reviews: Review[];
  onMarkHelpful: (reviewId: string) => void;
}

export default function ProductReviews({ productId, reviews, onMarkHelpful }: ProductReviewsProps) {
  const { user } = useAuth();
  const [sortBy, setSortBy] = useState('recent');
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  
  const handleMarkHelpful = (reviewId: string) => {
    onMarkHelpful(reviewId);
  };
  
  const handleReportReview = (reviewId: string) => {
    toast.success('Avis signalé. Merci de nous aider à maintenir la qualité des avis.');
  };
  
  // Filter and sort reviews
  const filteredReviews = reviews
    .filter(review => ratingFilter === null || review.rating === ratingFilter)
    .sort((a, b) => {
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
  
  // Calculate rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => {
    const count = reviews.filter(review => review.rating === rating).length;
    const percentage = reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0;
    return { rating, count, percentage };
  });
  
  // Calculate average rating
  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;
  
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Avis clients</h2>
        <Link 
          to={user ? `/reviews?product=${productId}` : `/login?redirect=/reviews?product=${productId}`}
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
            <div className="text-5xl font-bold text-gray-900 mb-2">{averageRating.toFixed(1)}</div>
            <div className="flex items-center justify-center mb-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${
                    i < Math.floor(averageRating) 
                      ? 'text-yellow-400 fill-current' 
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <p className="text-gray-600">{reviews.length} avis</p>
          </div>
          
          {/* Rating Distribution */}
          <div className="col-span-2">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Distribution des notes</h3>
            <div className="space-y-2">
              {ratingDistribution.map(({ rating, percentage }) => (
                <div key={rating} className="flex items-center">
                  <button
                    onClick={() => setRatingFilter(ratingFilter === rating ? null : rating)}
                    className={`flex items-center w-24 ${
                      ratingFilter === rating ? 'font-bold text-blue-600' : 'text-gray-600'
                    }`}
                  >
                    <span className="text-sm">{rating}</span>
                    <Star className="h-4 w-4 text-yellow-400 fill-current ml-1" />
                  </button>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full mx-2">
                    <div 
                      className="h-2 bg-yellow-400 rounded-full" 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-12">{percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Filters */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <span className="text-gray-700">Filtrer par:</span>
          <div className="flex space-x-2">
            {[5, 4, 3, 2, 1].map(rating => (
              <button
                key={rating}
                onClick={() => setRatingFilter(ratingFilter === rating ? null : rating)}
                className={`flex items-center px-3 py-1 rounded-full text-sm ${
                  ratingFilter === rating 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {rating}
                <Star className={`h-3 w-3 ml-1 ${ratingFilter === rating ? 'text-white' : 'text-yellow-400'} fill-current`} />
              </button>
            ))}
            {ratingFilter !== null && (
              <button
                onClick={() => setRatingFilter(null)}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200"
              >
                Tout voir
              </button>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-gray-700">Trier par:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="recent">Plus récents</option>
            <option value="oldest">Plus anciens</option>
            <option value="highest">Mieux notés</option>
            <option value="lowest">Moins bien notés</option>
            <option value="helpful">Plus utiles</option>
          </select>
        </div>
      </div>
      
      {/* Reviews List */}
      <div className="space-y-6">
        {filteredReviews.length > 0 ? (
          filteredReviews.map((review) => (
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
              Aucun avis trouvé
            </h3>
            <p className="text-gray-600 mb-6">
              {ratingFilter !== null 
                ? `Aucun avis avec ${ratingFilter} étoile${ratingFilter > 1 ? 's' : ''}.`
                : 'Soyez le premier à donner votre avis sur ce produit !'}
            </p>
            {ratingFilter !== null ? (
              <button
                onClick={() => setRatingFilter(null)}
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Voir tous les avis
              </button>
            ) : (
              <Link 
                to={user ? `/reviews?product=${productId}` : `/login?redirect=/reviews?product=${productId}`}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Écrire un avis
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}