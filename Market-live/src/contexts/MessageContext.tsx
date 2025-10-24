import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Message, Conversation, User } from '../types';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';
import { messageService } from '../services/api';

interface MessageContextType {
  conversations: Conversation[];
  messages: Record<string, Message[]>;
  activeConversation: string | null;
  sendMessage: (conversationId: string, content: string, receiverId: string, type?: Message['type']) => Promise<void>;
  createConversation: (participantId: string) => Promise<string>;
  markAsRead: (conversationId: string) => Promise<void>;
  setActiveConversation: (conversationId: string | null) => void;
  getUnreadCount: () => number;
  isLoading: boolean;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export function MessageProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch conversations when user changes
  useEffect(() => {
    if (user) {
      fetchConversations();
      // Set up polling for new messages
      const interval = setInterval(fetchUnreadCount, 30000); // Check every 30 seconds
      return () => clearInterval(interval);
    }
  }, [user]);

  // Fetch messages when active conversation changes
  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation);
    }
  }, [activeConversation]);

  const fetchConversations = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const response = await messageService.getConversations();
      setConversations(response.conversations || []);
      fetchUnreadCount();
    } catch (error) {
      console.error('Error fetching conversations:', error);
      // Use mock data for development
      setConversations([
        {
          id: '1',
          participants: ['1', '2'],
          participantDetails: [
            {
              id: '1',
              firstName: 'Jean',
              lastName: 'Vendeur',
              company: 'VendeurPro SARL',
              email: 'vendor@example.com',
              role: 'vendor'
            },
            {
              id: '2',
              firstName: 'Marie',
              lastName: 'Fournisseur',
              company: 'SupplyChain Solutions',
              email: 'supplier@example.com',
              role: 'supplier'
            }
          ],
          lastMessage: {
            id: '123',
            conversationId: '1',
            senderId: '2',
            senderName: 'Marie Fournisseur',
            receiverId: '1',
            content: 'Bonjour, avez-vous reçu ma dernière offre ?',
            timestamp: new Date().toISOString(),
            read: false,
            type: 'text'
          },
          unreadCount: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          type: 'direct',
          conversationId: 'conv_1_2'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const response = await messageService.getConversation(conversationId);
      setMessages(prev => ({
        ...prev,
        [conversationId]: response.conversation.messages || []
      }));
      
      // Mark messages as read
      await markAsRead(conversationId);
    } catch (error) {
      console.error('Error fetching messages:', error);
      // Use mock data for development
      setMessages(prev => ({
        ...prev,
        [conversationId]: [
          {
            id: '123',
            conversationId,
            senderId: '2',
            senderName: 'Marie Fournisseur',
            receiverId: '1',
            content: 'Bonjour, avez-vous reçu ma dernière offre ?',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            read: true,
            type: 'text'
          },
          {
            id: '124',
            conversationId,
            senderId: '1',
            senderName: 'Jean Vendeur',
            receiverId: '2',
            content: 'Oui, je l\'ai bien reçue. Pouvons-nous discuter des détails ?',
            timestamp: new Date(Date.now() - 1800000).toISOString(),
            read: true,
            type: 'text'
          }
        ]
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    if (!user) return;
    
    try {
      const response = await messageService.getUnreadCount();
      setUnreadCount(response.count || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
      // Use mock data for development
      setUnreadCount(2);
    }
  };

  const sendMessage = async (conversationId: string, content: string, receiverId: string, type: Message['type'] = 'text') => {
    if (!user) throw new Error('Utilisateur non connecté');
    
    setIsLoading(true);
    
    try {
      const response = await messageService.sendMessage(conversationId, {
        content,
        receiverId,
        type
      });
      
      // Update messages state
      const newMessage = response.data || {
        id: Date.now().toString(),
        conversationId,
        senderId: user.id,
        senderName: `${user.firstName} ${user.lastName}`,
        receiverId,
        content,
        timestamp: new Date().toISOString(),
        read: false,
        type
      };
      
      setMessages(prev => ({
        ...prev,
        [conversationId]: [...(prev[conversationId] || []), newMessage]
      }));
      
      // Update conversation's last message and timestamp
      setConversations(prev =>
        prev.map(conv =>
          conv.id === conversationId
            ? { 
                ...conv, 
                lastMessage: newMessage,
                updatedAt: new Date().toISOString()
              }
            : conv
        )
      );
      
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Erreur lors de l\'envoi du message');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const createConversation = async (participantId: string): Promise<string> => {
    if (!user) throw new Error('Utilisateur non connecté');
    
    setIsLoading(true);
    
    try {
      const response = await messageService.createConversation({
        participantIds: [participantId],
        type: 'direct'
      });
      
      // If conversation already exists, return its ID
      if (response.message === 'Conversation already exists') {
        await fetchConversations(); // Refresh conversations list
        return response.conversation.id;
      }
      
      // Otherwise, add new conversation to state
      const newConversation = response.conversation || {
        id: Date.now().toString(),
        participants: [user.id, participantId],
        participantDetails: [
          {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            company: user.company,
            email: user.email,
            role: user.role
          },
          {
            id: participantId,
            firstName: 'Participant',
            lastName: 'Test',
            company: 'Test Company',
            email: 'test@example.com',
            role: 'client'
          }
        ],
        unreadCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        type: 'direct',
        conversationId: `conv_${user.id}_${participantId}`
      };
      
      setConversations(prev => [newConversation, ...prev]);
      
      return newConversation.id;
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast.error('Erreur lors de la création de la conversation');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (conversationId: string) => {
    if (!user) return;
    
    try {
      await messageService.markConversationAsRead(conversationId);
      
      // Update messages as read
      setMessages(prev => {
        const conversationMessages = prev[conversationId] || [];
        const updatedMessages = conversationMessages.map(message => 
          message.receiverId === user.id ? { ...message, isRead: true } : message
        );
        
        return {
          ...prev,
          [conversationId]: updatedMessages
        };
      });
      
      // Update conversation unread count
      setConversations(prev =>
        prev.map(conv =>
          conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
        )
      );
      
      // Update total unread count
      fetchUnreadCount();
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const getUnreadCount = (): number => {
    return unreadCount;
  };

  return (
    <MessageContext.Provider value={{
      conversations,
      messages,
      activeConversation,
      sendMessage,
      createConversation,
      markAsRead,
      setActiveConversation,
      getUnreadCount,
      isLoading
    }}>
      {children}
    </MessageContext.Provider>
  );
}

export function useMessages() {
  const context = useContext(MessageContext);
  if (context === undefined) {
    throw new Error('useMessages must be used within a MessageProvider');
  }
  return context;
}