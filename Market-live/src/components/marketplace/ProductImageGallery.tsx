import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProductImageGalleryProps {
  images: string[];
  title: string;
}

export default function ProductImageGallery({ images, title }: ProductImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Ensure there's at least one image
  const productImages = images.length > 0 
    ? images 
    : ['https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg'];
  
  const handlePrevImage = () => {
    setSelectedImage(prev => (prev === 0 ? productImages.length - 1 : prev - 1));
  };
  
  const handleNextImage = () => {
    setSelectedImage(prev => (prev === productImages.length - 1 ? 0 : prev + 1));
  };
  
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-4">
        <div className="relative">
          <img
            src={productImages[selectedImage]}
            alt={title}
            className="w-full h-96 object-contain"
          />
          
          {productImages.length > 1 && (
            <>
              <button
                onClick={handlePrevImage}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 rounded-full p-2 hover:bg-white transition-colors"
              >
                <ChevronLeft className="h-5 w-5 text-gray-700" />
              </button>
              
              <button
                onClick={handleNextImage}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 rounded-full p-2 hover:bg-white transition-colors"
              >
                <ChevronRight className="h-5 w-5 text-gray-700" />
              </button>
            </>
          )}
          
          <button
            onClick={toggleFullscreen}
            className="absolute bottom-2 right-2 bg-white/80 rounded-full p-2 hover:bg-white transition-colors"
          >
            <Maximize2 className="h-5 w-5 text-gray-700" />
          </button>
        </div>
      </div>
      
      {productImages.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {productImages.map((image, index) => (
            <div
              key={index}
              onClick={() => setSelectedImage(index)}
              className={`cursor-pointer rounded-lg overflow-hidden border-2 ${
                selectedImage === index ? 'border-blue-500' : 'border-transparent'
              }`}
            >
              <img
                src={image}
                alt={`${title} - Image ${index + 1}`}
                className="w-full h-20 object-cover"
              />
            </div>
          ))}
        </div>
      )}
      
      {/* Fullscreen Modal */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-50 flex items-center justify-center"
            onClick={toggleFullscreen}
          >
            <button
              onClick={toggleFullscreen}
              className="absolute top-4 right-4 bg-white/20 rounded-full p-2 hover:bg-white/30 transition-colors"
            >
              <X className="h-6 w-6 text-white" />
            </button>
            
            <div className="relative w-full max-w-4xl">
              <img
                src={productImages[selectedImage]}
                alt={title}
                className="w-full h-auto max-h-[80vh] object-contain"
                onClick={(e) => e.stopPropagation()}
              />
              
              {productImages.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrevImage();
                    }}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/20 rounded-full p-3 hover:bg-white/30 transition-colors"
                  >
                    <ChevronLeft className="h-6 w-6 text-white" />
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNextImage();
                    }}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/20 rounded-full p-3 hover:bg-white/30 transition-colors"
                  >
                    <ChevronRight className="h-6 w-6 text-white" />
                  </button>
                </>
              )}
            </div>
            
            {/* Thumbnails */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {productImages.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImage(index);
                  }}
                  className={`w-2 h-2 rounded-full ${
                    selectedImage === index ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}