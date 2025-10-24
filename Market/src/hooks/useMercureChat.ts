import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import mercureService from '../services/mercureService';
import { Message, Conversation } from '../types';

/**
 * Hook for real-time chat using Mercure
 */
export const useMercureChat = (conversationId?: string) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState<Record<string, boolean>>({});
  const [isConnected, setIsConnected] = useState(false);
  
  useEffect(() => {
    if (!user || !conversationId) return;
    
    // Set initial connection state
    setIsConnected(false);
    
    // Subscribe to conversation topics
    const topics = [
      `/conversation/${conversationId}`,
      `/conversation/${conversationId}/typing`
    ];
    
    const subscriptionId = mercureService.subscribe(
      topics,
      (data, topic) => {
        // Handle new message
        if (data.type === 'new_message') {
          // Add message to state
          setMessages(prev => [...prev, data.message]);
          
          // Clear typing indicator for sender
          setIsTyping(prev => ({
            ...prev,
            [data.message.senderId]: false
          }));
        }
        // Handle typing indicator
        else if (data.type === 'typing') {
          // Update typing state
          setIsTyping(prev => ({
            ...prev,
            [data.userId]: data.isTyping
          }));
        }
        // Handle message read
        else if (data.type === 'messages_read') {
          // Update messages as read
          setMessages(prev => 
            prev.map(message => 
              message.senderId === user.id && !message.read
                ? { ...message, read: true }
                : message
            )
          );
        }
        
        // Set connection state
        setIsConnected(true);
      },
      (error) => {
        console.error('Mercure chat error:', error);
        setIsConnected(false);
      }
    );
    
    // Cleanup subscription
    return () => {
      mercureService.unsubscribe(subscriptionId);
    };
  }, [user, conversationId]);
  
  /**
   * Send typing indicator
   * @param isTyping Whether user is typing
   */
  const sendTypingIndicator = async (isTyping: boolean) => {
    if (!user || !conversationId) return;
    
    // In a real implementation, this would publish to Mercure hub via your backend
    console.log('Sending typing indicator:', { userId: user.id, isTyping });
    
    // For development, simulate the event locally
    setIsTyping(prev => ({
      ...prev,
      [user.id]: isTyping
    }));
  };
  
  return {
    messages,
    isTyping,
    isConnected,
    sendTypingIndicator
  };
};

export default useMercureChat;