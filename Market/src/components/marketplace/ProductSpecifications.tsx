import React from 'react';
import { Info } from 'lucide-react';

interface ProductSpecificationsProps {
  specifications: Record<string, string> | null | undefined;
}

export default function ProductSpecifications({ specifications }: ProductSpecificationsProps) {
  if (!specifications || Object.keys(specifications).length === 0) {
    return (
      <div className="text-center py-8">
        <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Info className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-xl font-medium text-gray-900 mb-2">
          Aucune spécification disponible
        </h3>
        <p className="text-gray-600">
          Les spécifications techniques de ce produit ne sont pas disponibles pour le moment.
        </p>
      </div>
    );
  }

  // Group specifications by category
  const categories = {
    'Général': ['Marque', 'Modèle', 'Référence', 'Garantie', 'Origine'],
    'Écran': ['Écran', 'Taille', 'Résolution', 'Type d\'écran', 'Fréquence'],
    'Performance': ['Processeur', 'RAM', 'Stockage', 'Carte graphique', 'Système'],
    'Connectivité': ['Wifi', 'Bluetooth', 'USB', 'HDMI', 'NFC', 'Réseau'],
    'Batterie': ['Batterie', 'Autonomie', 'Charge rapide'],
    'Caméra': ['Caméra principale', 'Caméra frontale', 'Flash', 'Zoom'],
    'Dimensions': ['Dimensions', 'Poids', 'Matériaux'],
    'Autres': []
  };

  // Categorize specifications
  const categorizedSpecs: Record<string, Record<string, string>> = {};
  
  Object.entries(specifications).forEach(([key, value]) => {
    let assigned = false;
    
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => key.includes(keyword))) {
        if (!categorizedSpecs[category]) {
          categorizedSpecs[category] = {};
        }
        categorizedSpecs[category][key] = value;
        assigned = true;
        break;
      }
    }
    
    if (!assigned) {
      if (!categorizedSpecs['Autres']) {
        categorizedSpecs['Autres'] = {};
      }
      categorizedSpecs['Autres'][key] = value;
    }
  });

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Spécifications techniques</h2>
      
      <div className="space-y-8">
        {Object.entries(categorizedSpecs).map(([category, specs]) => (
          <div key={category}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{category}</h3>
            
            <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
              <div className="divide-y divide-gray-200">
                {Object.entries(specs).map(([key, value], index) => (
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
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 bg-blue-50 rounded-lg p-4 border border-blue-100">
        <div className="flex items-start">
          <Info className="h-5 w-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
          <p className="text-sm text-blue-800">
            Les spécifications techniques sont fournies par le fabricant et peuvent être modifiées sans préavis. 
            Veuillez consulter la documentation officielle du produit pour les informations les plus récentes.
          </p>
        </div>
      </div>
    </div>
  );
}