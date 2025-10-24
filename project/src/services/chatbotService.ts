import { apiWrapper } from './api';
import { v4 as uuidv4 } from 'uuid';

// OpenAI API integration
const openaiService = {
  generateResponse: async (prompt: string, context: any = {}) => {
    try {
      // In a real implementation, this would call the OpenAI API
      // For development, we'll simulate a response
      console.log('OpenAI prompt:', prompt, context);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate a response based on the prompt
      let response = 'Je ne suis pas sûr de comprendre votre question.';
      let options = [];
      
      if (prompt.toLowerCase().includes('produit') || prompt.toLowerCase().includes('cherche')) {
        response = 'Je peux vous aider à trouver des produits ! Quelle catégorie vous intéresse ?';
        options = ['Électronique', 'Mode', 'Maison', 'Sport', 'Voir toutes les catégories'];
      } else if (prompt.toLowerCase().includes('commande') || prompt.toLowerCase().includes('order')) {
        response = 'Pour vous aider avec votre commande, j\'ai besoin de plus d\'informations. Que souhaitez-vous faire ?';
        options = ['Suivre une commande', 'Modifier une commande', 'Annuler une commande', 'Problème de livraison'];
      } else if (prompt.toLowerCase().includes('vendeur') || prompt.toLowerCase().includes('contact')) {
        response = 'Je peux vous mettre en relation avec nos vendeurs. Souhaitez-vous :';
        options = ['Voir les vendeurs par catégorie', 'Contacter un vendeur spécifique', 'Devenir vendeur'];
      } else if (prompt.toLowerCase().includes('paiement') || prompt.toLowerCase().includes('payment')) {
        response = 'Concernant les paiements, nous acceptons plusieurs méthodes. Que voulez-vous savoir ?';
        options = ['Méthodes de paiement', 'Sécurité des paiements', 'Problème de paiement', 'Remboursement'];
      } else if (prompt.toLowerCase().includes('prix') || prompt.toLowerCase().includes('coût')) {
        response = 'Les prix varient selon les produits et vendeurs. Je peux vous aider à comparer les prix ou trouver les meilleures offres.';
        options = ['Comparer les prix', 'Voir les promotions', 'Négocier un prix'];
      } else if (prompt.toLowerCase().includes('livraison') || prompt.toLowerCase().includes('shipping')) {
        response = 'Pour les informations de livraison, que souhaitez-vous savoir ?';
        options = ['Délais de livraison', 'Frais de port', 'Suivi de colis', 'Zones de livraison'];
      } else {
        response = 'Je comprends votre question. Voici comment je peux vous aider :';
        options = [
          'Parcourir les produits',
          'Aide avec une commande',
          'Contacter le support',
          'FAQ'
        ];
      }
      
      return {
        response,
        options
      };
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw error;
    }
  }
};

// Enhanced chatbot service with AI integration
export const enhancedChatbotService = {
  // Process user message with AI
  processMessage: async (message: string, sessionId: string = '', context: any = {}) => {
    try {
      // Try to use the backend API first
      const response = await apiWrapper.post('/chatbot/chat', { message, sessionId, context });
      return response.data;
    } catch (error) {
      console.warn('Backend chatbot API failed, using OpenAI fallback', error);
      
      // Fallback to direct OpenAI integration
      const aiResponse = await openaiService.generateResponse(message, context);
      
      return {
        response: aiResponse.response,
        type: 'text',
        options: aiResponse.options,
        sessionId: sessionId || uuidv4(),
        context
      };
    }
  },
  
  // Get contextual suggestions
  getSuggestions: async (context: string = 'general') => {
    try {
      const response = await apiWrapper.get('/chatbot/suggestions', { params: { context } });
      return response.data;
    } catch (error) {
      console.warn('Backend suggestions API failed, using fallback', error);
      
      // Fallback suggestions
      const suggestions = {
        general: [
          'Comment puis-je trouver des produits ?',
          'Comment contacter un vendeur ?',
          'Comment suivre ma commande ?',
          'Quelles sont vos méthodes de paiement ?'
        ],
        product: [
          'Ce produit est-il en stock ?',
          'Quels sont les délais de livraison ?',
          'Acceptez-vous les retours ?',
          'Y a-t-il une garantie ?'
        ],
        order: [
          'Où est ma commande ?',
          'Comment annuler ma commande ?',
          'Comment retourner un produit ?',
          'Quand serai-je remboursé ?'
        ]
      };
      
      return { suggestions: suggestions[context as keyof typeof suggestions] || suggestions.general };
    }
  },
  
  // Send user feedback
  sendFeedback: async (sessionId: string, rating: number, comment?: string) => {
    try {
      const response = await apiWrapper.post('/chatbot/feedback', { sessionId, rating, comment });
      return response.data;
    } catch (error) {
      console.warn('Backend feedback API failed', error);
      // Just log the feedback locally for development
      console.log('Chatbot feedback:', { sessionId, rating, comment });
      return { message: 'Feedback received' };
    }
  }
};

export default enhancedChatbotService;