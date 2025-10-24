import React from 'react';
import { Check } from 'lucide-react';

interface ProductVariant {
  [key: string]: string | number;
}

interface ProductVariantSelectorProps {
  variants: ProductVariant[];
  selectedVariant: Record<string, string>;
  onChange: (attribute: string, value: string) => void;
}

export default function ProductVariantSelector({ 
  variants, 
  selectedVariant, 
  onChange 
}: ProductVariantSelectorProps) {
  // Get unique attributes and their values
  const attributes: Record<string, Set<string>> = {};
  
  variants.forEach(variant => {
    Object.entries(variant).forEach(([key, value]) => {
      if (key !== 'price') {
        if (!attributes[key]) {
          attributes[key] = new Set();
        }
        attributes[key].add(String(value));
      }
    });
  });
  
  // Check if a variant with the given attribute value is available
  const isVariantAvailable = (attribute: string, value: string) => {
    const potentialVariant = {
      ...selectedVariant,
      [attribute]: value
    };
    
    return variants.some(variant => 
      Object.entries(potentialVariant).every(([key, val]) => 
        String(variant[key]) === val
      )
    );
  };
  
  // Get price for a specific variant
  const getVariantPrice = (variant: Record<string, string>) => {
    const matchingVariant = variants.find(v => 
      Object.entries(variant).every(([key, value]) => 
        String(v[key]) === value
      )
    );
    
    return matchingVariant?.price;
  };
  
  // Render color swatch
  const renderColorSwatch = (color: string, isSelected: boolean, isAvailable: boolean) => {
    const colorMap: Record<string, string> = {
      'Noir': 'bg-gray-900',
      'Blanc': 'bg-white border border-gray-300',
      'Bleu': 'bg-blue-600',
      'Rouge': 'bg-red-600',
      'Vert': 'bg-green-600',
      'Jaune': 'bg-yellow-400',
      'Orange': 'bg-orange-500',
      'Violet': 'bg-purple-600',
      'Rose': 'bg-pink-500',
      'Gris': 'bg-gray-500',
      'Argent': 'bg-gray-300',
      'Or': 'bg-yellow-600',
    };
    
    const bgColor = colorMap[color] || 'bg-gray-300';
    
    return (
      <div className={`relative w-10 h-10 rounded-full ${bgColor} ${
        isSelected ? 'ring-2 ring-offset-2 ring-blue-600' : ''
      } ${isAvailable ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}>
        {isSelected && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Check className={`h-5 w-5 ${color === 'Blanc' ? 'text-gray-900' : 'text-white'}`} />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {Object.entries(attributes).map(([attribute, values]) => (
        <div key={attribute}>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700 capitalize">
              {attribute}
            </label>
            
            {selectedVariant[attribute] && (
              <span className="text-sm text-gray-500">
                Sélectionné: <span className="font-medium">{selectedVariant[attribute]}</span>
              </span>
            )}
          </div>
          
          <div className="flex flex-wrap gap-3">
            {Array.from(values).map(value => {
              const isSelected = selectedVariant[attribute] === value;
              const isAvailable = isVariantAvailable(attribute, value);
              
              return (
                <button
                  key={value}
                  onClick={() => isAvailable && onChange(attribute, value)}
                  disabled={!isAvailable}
                  className={`relative ${
                    attribute.toLowerCase() === 'color' || attribute.toLowerCase() === 'couleur'
                      ? ''
                      : `px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600'
                            : isAvailable
                              ? 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                              : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                        }`
                  }`}
                  title={!isAvailable ? 'Combinaison non disponible' : undefined}
                >
                  {attribute.toLowerCase() === 'color' || attribute.toLowerCase() === 'couleur'
                    ? renderColorSwatch(value, isSelected, isAvailable)
                    : value}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}