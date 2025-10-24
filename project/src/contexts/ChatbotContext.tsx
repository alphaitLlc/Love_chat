import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { chatbotService } from '../services/api';

interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: string;
  options?: string[];
}

interface ChatbotContextType {
  messages: ChatMessage[];
  isTyping: boolean;
  sendMessage: (content: string) => Promise<void>;
  getSuggestions: (context?: string) => Promise<string[]>;
  sendFeedback: (sessionId: string, rating: number, comment?: string) => Promise<void>;
  clearMessages: () => void;
}

const ChatbotContext = createContext<ChatbotContextType | undefined>(undefined);

export function ChatbotProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'bot',
      content: 'Bonjour ! Je suis votre assistant virtuel MarketLink Pro. Comment puis-je vous aider aujourd\'hui ?',
      timestamp: new Date().toISOString(),
      options: [
        'Trouver des produits',
        'Aide avec une commande',
        'Contacter un vendeur',
        'Questions sur les paiements'
      ]
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string>(`session_${Date.now()}`);

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    // Add user message to state
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      // Send message to API
      const response = await chatbotService.sendMessage(content, sessionId, {
        userRole: user?.role || 'visitor'
      });
      
      // Add bot response to state
      const botResponse: ChatMessage = {
        id: `bot_${Date.now()}`,
        type: 'bot',
        content: response.response,
        timestamp: new Date().toISOString(),
        options: response.options
      };
      
      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error('Error sending message to chatbot:', error);
      
      // Add error message
      const errorMessage: ChatMessage = {
        id: `error_${Date.now()}`,
        type: 'bot',
        content: 'Désolé, je rencontre un problème technique. Veuillez réessayer plus tard.',
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const getSuggestions = async (context: string = 'general'): Promise<string[]> => {
    try {
      const response = await chatbotService.getSuggestions(context);
      return response.suggestions || [];
    } catch (error) {
      console.error('Error getting chatbot suggestions:', error);
      return [];
    }
  };

  const sendFeedback = async (sessionId: string, rating: number, comment?: string) => {
    try {
      await chatbotService.sendFeedback(sessionId, rating, comment);
    } catch (error) {
      console.error('Error sending chatbot feedback:', error);
    }
  };

  const clearMessages = () => {
    setMessages([
      {
        id: 'welcome',
        type: 'bot',
        content: 'Bonjour ! Je suis votre assistant virtuel MarketLink Pro. Comment puis-je vous aider aujourd\'hui ?',
        timestamp: new Date().toISOString(),
        options: [
          'Trouver des produits',
          'Aide avec une commande',
          'Contacter un vendeur',
          'Questions sur les paiements'
        ]
      }
    ]);
    setSessionId(`session_${Date.now()}`);
  };

  return (
    <ChatbotContext.Provider value={{
      messages,
      isTyping,
      sendMessage,
      getSuggestions,
      sendFeedback,
      clearMessages
    }}>
      {children}
    </ChatbotContext.Provider>
  );
}

export function useChatbot() {
  const context = useContext(ChatbotContext);
  if (context === undefined) {
    throw new Error('useChatbot must be used within a ChatbotProvider');
  }
  return context;
}