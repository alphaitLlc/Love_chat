import React, { useState, useRef } from 'react';
import { X, Upload, Plus, Trash2, Calendar, Clock, Tag, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { liveStreamService } from '../../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface CreateLiveStreamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStreamCreated: (streamId: string) => void;
}

export default function CreateLiveStreamModal({ isOpen, onClose, onStreamCreated }: CreateLiveStreamModalProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    scheduledAt: new Date(Date.now() + 3600000).toISOString().slice(0, 16), // Default to 1 hour from now
    thumbnail: '',
    tags: [''],
    isPublic: true,
    allowChat: true,
    recordStream: false
  });
  
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Mock products for selection
  const availableProducts = [
    { id: '1', title: 'Smartphone Galaxy Pro Max', price: 899.99, image: 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg' },
    { id: '2', title: 'Laptop Business UltraBook', price: 1249.99, image: 'https://images.pexels.com/photos/18105/pexels-photo.jpg' },
    { id: '3', title: 'Casque Audio Sans-Fil', price: 199.99, image: 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg' }
  ];
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: target.checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleTagChange = (index: number, value: string) => {
    const newTags = [...formData.tags];
    newTags[index] = value;
    setFormData(prev => ({ ...prev, tags: newTags }));
  };
  
  const addTag = () => {
    setFormData(prev => ({ ...prev, tags: [...prev.tags, ''] }));
  };
  
  const removeTag = (index: number) => {
    const newTags = [...formData.tags];
    newTags.splice(index, 1);
    setFormData(prev => ({ ...prev, tags: newTags }));
  };
  
  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setThumbnailFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const toggleProductSelection = (productId: string) => {
    if (selectedProducts.includes(productId)) {
      setSelectedProducts(prev => prev.filter(id => id !== productId));
    } else {
      setSelectedProducts(prev => [...prev, productId]);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Vous devez être connecté pour créer un live');
      return;
    }
    
    if (!formData.title) {
      toast.error('Le titre est requis');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // In a real implementation, upload thumbnail to storage
      let thumbnailUrl = '';
      if (thumbnailFile) {
        // Mock upload
        thumbnailUrl = thumbnailPreview;
      }
      
      // Filter out empty tags
      const filteredTags = formData.tags.filter(tag => tag.trim() !== '');
      
      // Create live stream
      const streamData = {
        title: formData.title,
        description: formData.description,
        scheduledAt: formData.scheduledAt,
        thumbnail: thumbnailUrl || 'https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg',
        tags: filteredTags,
        isPublic: formData.isPublic,
        allowChat: formData.allowChat,
        recordStream: formData.recordStream,
        products: selectedProducts.map(id => `/api/products/${id}`)
      };
      
      // In a real implementation, call API
      // const response = await liveStreamService.createLiveStream(streamData);
      
      // For development, simulate API response
      const mockResponse = {
        id: `live_${Date.now()}`,
        ...streamData,
        streamer: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          company: user.company
        },
        status: 'scheduled',
        viewerCount: 0,
        products: selectedProducts.map(id => {
          const product = availableProducts.find(p => p.id === id);
          return {
            id,
            title: product?.title || '',
            price: product?.price.toString() || '0'
          };
        })
      };
      
      toast.success('Live stream créé avec succès !');
      onStreamCreated(mockResponse.id);
      onClose();
      
      // Navigate to the new stream
      navigate(`/live-shopping/${mockResponse.id}`);
    } catch (error) {
      console.error('Error creating live stream:', error);
      toast.error('Erreur lors de la création du live');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Créer un nouveau live</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Titre du live *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Découverte des nouveaux smartphones 2024"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Décrivez votre live..."
                />
              </div>
              
              <div>
                <label htmlFor="scheduledAt" className="block text-sm font-medium text-gray-700 mb-1">
                  Date et heure prévues
                </label>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <input
                    type="datetime-local"
                    id="scheduledAt"
                    name="scheduledAt"
                    value={formData.scheduledAt}
                    onChange={handleChange}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags
                </label>
                <div className="space-y-2">
                  {formData.tags.map((tag, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Tag className="h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        value={tag}
                        onChange={(e) => handleTagChange(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Ex: smartphone, tech, nouveautés"
                      />
                      {formData.tags.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeTag(index)}
                          className="p-2 text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  ))}
                  
                  <button
                    type="button"
                    onClick={addTag}
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Ajouter un tag</span>
                  </button>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label htmlFor="isPublic" className="text-sm font-medium text-gray-700">
                    Live public
                  </label>
                  <div className="relative inline-block w-10 mr-2 align-middle select-none">
                    <input
                      type="checkbox"
                      id="isPublic"
                      name="isPublic"
                      checked={formData.isPublic}
                      onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
                      className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 border-gray-300 appearance-none cursor-pointer"
                    />
                    <label className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <label htmlFor="allowChat" className="text-sm font-medium text-gray-700">
                    Activer le chat
                  </label>
                  <div className="relative inline-block w-10 mr-2 align-middle select-none">
                    <input
                      type="checkbox"
                      id="allowChat"
                      name="allowChat"
                      checked={formData.allowChat}
                      onChange={(e) => setFormData(prev => ({ ...prev, allowChat: e.target.checked }))}
                      className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 border-gray-300 appearance-none cursor-pointer"
                    />
                    <label className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <label htmlFor="recordStream" className="text-sm font-medium text-gray-700">
                    Enregistrer le live
                  </label>
                  <div className="relative inline-block w-10 mr-2 align-middle select-none">
                    <input
                      type="checkbox"
                      id="recordStream"
                      name="recordStream"
                      checked={formData.recordStream}
                      onChange={(e) => setFormData(prev => ({ ...prev, recordStream: e.target.checked }))}
                      className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 border-gray-300 appearance-none cursor-pointer"
                    />
                    <label className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Column */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Miniature du live
                </label>
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {thumbnailPreview ? (
                    <div className="relative">
                      <img
                        src={thumbnailPreview}
                        alt="Thumbnail preview"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setThumbnailFile(null);
                          setThumbnailPreview('');
                        }}
                        className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="py-8">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Cliquez pour ajouter une miniature</p>
                      <p className="text-sm text-gray-400 mt-1">PNG, JPG jusqu'à 5MB</p>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailChange}
                    className="hidden"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Produits à présenter
                </label>
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                  <div className="max-h-64 overflow-y-auto">
                    {availableProducts.map(product => (
                      <div
                        key={product.id}
                        className={`flex items-center p-3 border-b border-gray-200 last:border-b-0 cursor-pointer hover:bg-gray-50 transition-colors ${
                          selectedProducts.includes(product.id) ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => toggleProductSelection(product.id)}
                      >
                        <div className="flex-shrink-0">
                          <div className="h-4 w-4 border border-gray-300 rounded flex items-center justify-center">
                            {selectedProducts.includes(product.id) && (
                              <div className="h-2 w-2 bg-blue-600 rounded-sm"></div>
                            )}
                          </div>
                        </div>
                        <div className="ml-3 flex items-center space-x-3 flex-1">
                          <img
                            src={product.image}
                            alt={product.title}
                            className="h-10 w-10 object-cover rounded"
                          />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{product.title}</p>
                            <p className="text-sm text-gray-500">€{product.price.toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Sélectionnez les produits que vous souhaitez présenter pendant votre live
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading || !formData.title}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Création...</span>
                </>
              ) : (
                <span>Créer le live</span>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}