import React, { useState } from 'react';
import { Star, Upload, X, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

interface ReviewFormProps {
  productId?: string;
  userId?: string;
  orderId?: string;
  onSubmit: (review: any) => Promise<void>;
  onCancel?: () => void;
}

export default function ReviewForm({ productId, userId, orderId, onSubmit, onCancel }: ReviewFormProps) {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleRatingChange = (value: number) => {
    setRating(value);
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      
      // Limit to 3 images
      if (images.length + newFiles.length > 3) {
        toast.error('Vous ne pouvez pas ajouter plus de 3 images');
        return;
      }
      
      setImages(prev => [...prev, ...newFiles]);
      
      // Create preview URLs
      const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file));
      setImagePreviewUrls(prev => [...prev, ...newPreviewUrls]);
    }
  };
  
  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    
    // Revoke object URL to avoid memory leaks
    URL.revokeObjectURL(imagePreviewUrls[index]);
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Vous devez être connecté pour laisser un avis');
      return;
    }
    
    if (rating === 0) {
      toast.error('Veuillez attribuer une note');
      return;
    }
    
    if (!comment.trim()) {
      toast.error('Veuillez écrire un commentaire');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // In a real implementation, upload images to storage
      const imageUrls = imagePreviewUrls;
      
      // Create review object
      const review = {
        rating,
        title: title.trim() || undefined,
        comment,
        images: imageUrls.length > 0 ? imageUrls : undefined,
        productId,
        userId,
        orderId
      };
      
      await onSubmit(review);
      
      // Reset form
      setRating(0);
      setTitle('');
      setComment('');
      setImages([]);
      setImagePreviewUrls([]);
      
      toast.success('Avis envoyé avec succès !');
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Erreur lors de l\'envoi de l\'avis');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Laisser un avis</h3>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6">
        {/* Rating */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Note *
          </label>
          <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => handleRatingChange(value)}
                onMouseEnter={() => setHoverRating(value)}
                onMouseLeave={() => setHoverRating(0)}
                className="focus:outline-none"
              >
                <Star
                  className={`h-8 w-8 ${
                    (hoverRating || rating) >= value
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
        
        {/* Title */}
        <div className="mb-6">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Titre
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Résumez votre avis en une phrase"
          />
        </div>
        
        {/* Comment */}
        <div className="mb-6">
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
            Commentaire *
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Partagez votre expérience avec ce produit"
            required
          />
        </div>
        
        {/* Images */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Photos (optionnel)
          </label>
          
          <div className="flex flex-wrap gap-4 mb-4">
            {imagePreviewUrls.map((url, index) => (
              <div key={index} className="relative">
                <img
                  src={url}
                  alt={`Preview ${index + 1}`}
                  className="h-24 w-24 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            
            {images.length < 3 && (
              <label className="h-24 w-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
                <Upload className="h-6 w-6 text-gray-400 mb-1" />
                <span className="text-xs text-gray-500">Ajouter</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
          
          <p className="text-xs text-gray-500">
            Vous pouvez ajouter jusqu'à 3 photos pour illustrer votre avis
          </p>
        </div>
        
        {/* Submit Buttons */}
        <div className="flex justify-end space-x-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
          )}
          
          <button
            type="submit"
            disabled={isSubmitting || rating === 0 || !comment.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Envoi...</span>
              </>
            ) : (
              <span>Envoyer</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}