import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import mercureService from '../services/mercureService';
import { LiveStreamMessage } from '../types';

/**
 * Hook for real-time live stream updates using Mercure
 */
export const useMercureLiveStream = (streamId?: string) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<LiveStreamMessage[]>([]);
  const [viewerCount, setViewerCount] = useState(0);
  const [highlightedProduct, setHighlightedProduct] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  useEffect(() => {
    if (!streamId) return;
    
    // Set initial connection state
    setIsConnected(false);
    
    // Subscribe to live stream topics
    const topics = [
      `/live-stream/${streamId}`,
      `/live-stream/${streamId}/chat`,
      `/live-stream/${streamId}/viewers`,
      `/live-stream/${streamId}/products`
    ];
    
    const subscriptionId = mercureService.subscribe(
      topics,
      (data, topic) => {
        // Handle stream update
        if (data.type === 'stream_update') {
          // Update stream status
          console.log('Stream update:', data);
        }
        // Handle viewer count update
        else if (data.type === 'viewer_count_update') {
          setViewerCount(data.viewerCount);
        }
        // Handle chat message
        else if (data.type === 'chat_message') {
          setMessages(prev => [...prev, data.message]);
        }
        // Handle product highlight
        else if (data.type === 'product_highlight') {
          setHighlightedProduct(data.product);
          
          // Auto-hide product after 10 seconds
          setTimeout(() => {
            setHighlightedProduct(null);
          }, 10000);
        }
        // Handle purchase notification
        else if (data.type === 'purchase_notification') {
          console.log('Purchase notification:', data);
        }
        
        // Set connection state
        setIsConnected(true);
      },
      (error) => {
        console.error('Mercure live stream error:', error);
        setIsConnected(false);
      }
    );
    
    // Cleanup subscription
    return () => {
      mercureService.unsubscribe(subscriptionId);
    };
  }, [streamId]);
  
  return {
    messages,
    viewerCount,
    highlightedProduct,
    isConnected
  };
};

export default useMercureLiveStream;