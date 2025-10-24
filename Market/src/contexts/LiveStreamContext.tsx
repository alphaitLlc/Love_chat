import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { LiveStream, LiveStreamMessage } from '../types';
import { useAuth } from './AuthContext';
import { liveStreamService } from '../services/api';

interface LiveStreamContextType {
  liveStreams: LiveStream[];
  activeLiveStream: LiveStream | null;
  messages: LiveStreamMessage[];
  viewerCount: number;
  isStreaming: boolean;
  joinLiveStream: (id: string) => Promise<void>;
  leaveLiveStream: () => Promise<void>;
  startLiveStream: (id: string) => Promise<void>;
  endLiveStream: (id: string) => Promise<void>;
  sendMessage: (content: string, type?: string) => Promise<void>;
  highlightProduct: (productId: string) => Promise<void>;
  setActiveLiveStream: (liveStream: LiveStream | null) => void;
  fetchPublicLiveStreams: () => Promise<void>;
  isLoading: boolean;
}

const LiveStreamContext = createContext<LiveStreamContextType | undefined>(undefined);

export function LiveStreamProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [liveStreams, setLiveStreams] = useState<LiveStream[]>([]);
  const [activeLiveStream, setActiveLiveStream] = useState<LiveStream | null>(null);
  const [messages, setMessages] = useState<LiveStreamMessage[]>([]);
  const [viewerCount, setViewerCount] = useState(0);
  const [isStreaming, setIsStreaming] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  // Initialize session ID
  useEffect(() => {
    setSessionId(generateSessionId());
  }, []);

  // Fetch public live streams on mount
  useEffect(() => {
    fetchPublicLiveStreams();
  }, []);

  // Set up Mercure event source for real-time updates when active live stream changes
  useEffect(() => {
    if (activeLiveStream) {
      setupMercureEventSource(activeLiveStream.id);
    }
    
    return () => {
      // Clean up event source
      if (window.eventSource) {
        window.eventSource.close();
      }
    };
  }, [activeLiveStream]);

  const fetchPublicLiveStreams = async () => {
    setIsLoading(true);
    try {
      const response = await liveStreamService.getPublicLiveStreams();
      if (response && response['hydra:member']) {
        setLiveStreams(response['hydra:member']);
      } else {
        // Mock data if API doesn't return expected format
        setLiveStreams([
          {
            id: '1',
            title: 'Découverte des Nouveaux Smartphones 2024',
            description: 'Présentation exclusive des derniers modèles',
            streamer: {
              id: '1',
              firstName: 'Jean',
              lastName: 'Vendeur',
              company: 'TechStore Pro'
            },
            status: 'live',
            scheduledAt: new Date().toISOString(),
            startedAt: new Date(Date.now() - 3600000).toISOString(),
            thumbnail: 'https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg?w=200&h=200&fit=crop',
            viewerCount: 1234,
            maxViewers: 1456,
            products: [
              {
                id: '1',
                title: 'Smartphone Galaxy Pro',
                price: '899.99'
              }
            ],
            tags: ['smartphone', 'tech', 'nouveautés'],
            isPublic: true,
            allowChat: true,
            isLive: true
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching public live streams:', error);
      // Set mock data on error
      setLiveStreams([
        {
          id: '1',
          title: 'Découverte des Nouveaux Smartphones 2024',
          description: 'Présentation exclusive des derniers modèles',
          streamer: {
            id: '1',
            firstName: 'Jean',
            lastName: 'Vendeur',
            company: 'TechStore Pro'
          },
          status: 'live',
          scheduledAt: new Date().toISOString(),
          startedAt: new Date(Date.now() - 3600000).toISOString(),
          thumbnail: 'https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg?w=200&h=200&fit=crop',
          viewerCount: 1234,
          maxViewers: 1456,
          products: [
            {
              id: '1',
              title: 'Smartphone Galaxy Pro',
              price: '899.99'
            }
          ],
          tags: ['smartphone', 'tech', 'nouveautés'],
          isPublic: true,
          allowChat: true,
          isLive: true
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const joinLiveStream = async (id: string) => {
    if (!activeLiveStream || activeLiveStream.id !== id) {
      try {
        const response = await liveStreamService.getLiveStream(id);
        setActiveLiveStream(response);
        
        // Join the live stream
        await liveStreamService.joinLiveStream(id, sessionId);
        
        // Fetch initial messages
        try {
          const messagesResponse = await liveStreamService.getLiveStreamMessages(id);
          if (messagesResponse && messagesResponse['hydra:member']) {
            setMessages(messagesResponse['hydra:member']);
          } else {
            // Mock messages if API doesn't return expected format
            setMessages([
              {
                id: '1',
                liveStreamId: id,
                userId: '2',
                userName: 'Marie_Tech',
                content: 'Salut ! Quel est le meilleur rapport qualité-prix ?',
                type: 'text',
                createdAt: new Date(Date.now() - 300000).toISOString(),
                isVisible: true
              },
              {
                id: '2',
                liveStreamId: id,
                userId: '3',
                userName: 'Jean_Mobile',
                content: 'Le Samsung Galaxy est excellent ! Je recommande 👍',
                type: 'text',
                createdAt: new Date(Date.now() - 240000).toISOString(),
                isVisible: true
              }
            ]);
          }
        } catch (error) {
          console.error('Error fetching live stream messages:', error);
          // Set mock messages on error
          setMessages([
            {
              id: '1',
              liveStreamId: id,
              userId: '2',
              userName: 'Marie_Tech',
              content: 'Salut ! Quel est le meilleur rapport qualité-prix ?',
              type: 'text',
              createdAt: new Date(Date.now() - 300000).toISOString(),
              isVisible: true
            },
            {
              id: '2',
              liveStreamId: id,
              userId: '3',
              userName: 'Jean_Mobile',
              content: 'Le Samsung Galaxy est excellent ! Je recommande 👍',
              type: 'text',
              createdAt: new Date(Date.now() - 240000).toISOString(),
              isVisible: true
            }
          ]);
        }
        
        // Set viewer count
        setViewerCount(response.viewerCount || 1234);
      } catch (error) {
        console.error('Error joining live stream:', error);
        throw error;
      }
    }
  };

  const leaveLiveStream = async () => {
    if (activeLiveStream) {
      try {
        await liveStreamService.leaveLiveStream(activeLiveStream.id, sessionId);
        setActiveLiveStream(null);
        setMessages([]);
        setViewerCount(0);
      } catch (error) {
        console.error('Error leaving live stream:', error);
        // Still clear the state even if API call fails
        setActiveLiveStream(null);
        setMessages([]);
        setViewerCount(0);
      }
    }
  };

  const startLiveStream = async (id: string) => {
    setIsLoading(true);
    try {
      const response = await liveStreamService.startLiveStream(id);
      setIsStreaming(true);
      
      // Update live stream in state
      setLiveStreams(prev => 
        prev.map(stream => 
          stream.id === id ? { ...stream, status: 'live' } : stream
        )
      );
      
      if (activeLiveStream?.id === id) {
        setActiveLiveStream(prev => prev ? { ...prev, status: 'live' } : null);
      }
      
      return response;
    } catch (error) {
      console.error('Error starting live stream:', error);
      
      // Update state anyway for development
      setIsStreaming(true);
      setLiveStreams(prev => 
        prev.map(stream => 
          stream.id === id ? { ...stream, status: 'live' } : stream
        )
      );
      
      if (activeLiveStream?.id === id) {
        setActiveLiveStream(prev => prev ? { ...prev, status: 'live' } : null);
      }
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const endLiveStream = async (id: string) => {
    setIsLoading(true);
    try {
      const response = await liveStreamService.endLiveStream(id);
      setIsStreaming(false);
      
      // Update live stream in state
      setLiveStreams(prev => 
        prev.map(stream => 
          stream.id === id ? { ...stream, status: 'ended' } : stream
        )
      );
      
      if (activeLiveStream?.id === id) {
        setActiveLiveStream(prev => prev ? { ...prev, status: 'ended' } : null);
      }
      
      return response;
    } catch (error) {
      console.error('Error ending live stream:', error);
      
      // Update state anyway for development
      setIsStreaming(false);
      setLiveStreams(prev => 
        prev.map(stream => 
          stream.id === id ? { ...stream, status: 'ended' } : stream
        )
      );
      
      if (activeLiveStream?.id === id) {
        setActiveLiveStream(prev => prev ? { ...prev, status: 'ended' } : null);
      }
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (content: string, type: string = 'text') => {
    if (!activeLiveStream || !user) return;
    
    try {
      await liveStreamService.sendChatMessage(activeLiveStream.id, content, type);
      
      // Add message locally for development
      const newMessage = {
        id: Date.now().toString(),
        liveStreamId: activeLiveStream.id,
        userId: user.id,
        userName: `${user.firstName}_${user.lastName}`,
        content,
        type,
        createdAt: new Date().toISOString(),
        isVisible: true
      };
      
      setMessages(prev => [...prev, newMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add message locally anyway for development
      if (user) {
        const newMessage = {
          id: Date.now().toString(),
          liveStreamId: activeLiveStream.id,
          userId: user.id,
          userName: `${user.firstName}_${user.lastName}`,
          content,
          type,
          createdAt: new Date().toISOString(),
          isVisible: true
        };
        
        setMessages(prev => [...prev, newMessage]);
      }
      
      throw error;
    }
  };

  const highlightProduct = async (productId: string) => {
    if (!activeLiveStream || !isStreaming) return;
    
    try {
      await liveStreamService.highlightProduct(activeLiveStream.id, productId);
      console.log('Product highlighted:', productId);
    } catch (error) {
      console.error('Error highlighting product:', error);
      console.log('Product highlighted (mock):', productId);
    }
  };

  const setupMercureEventSource = (liveStreamId: string) => {
    // Close existing connection if any
    if (window.eventSource) {
      window.eventSource.close();
    }
    
    // In a real app, we would connect to Mercure hub
    // For development, we'll simulate real-time updates
    
    // Simulate viewer count updates
    const viewerInterval = setInterval(() => {
      const change = Math.floor(Math.random() * 10) - 5;
      setViewerCount(prev => Math.max(1, prev + change));
    }, 5000);
    
    // Store interval in window for cleanup
    window.mercureIntervals = window.mercureIntervals || [];
    window.mercureIntervals.push(viewerInterval);
    
    return () => {
      clearInterval(viewerInterval);
      window.mercureIntervals.forEach(clearInterval);
      window.mercureIntervals = [];
    };
  };

  const handleStreamUpdate = (data: any) => {
    if (data.action === 'ended' && activeLiveStream?.id === data.stream.id) {
      setIsStreaming(false);
      setActiveLiveStream(prev => prev ? { ...prev, status: 'ended' } : null);
    }
  };

  const handleChatMessage = (message: any) => {
    setMessages(prev => [...prev, message]);
  };

  const handleProductHighlight = (productId: string) => {
    // Implement product highlight UI update
    console.log('Product highlighted:', productId);
  };

  const handlePurchaseNotification = (data: any) => {
    // Implement purchase notification UI update
    console.log('Purchase notification:', data);
  };

  const generateSessionId = () => {
    return 'session_' + Math.random().toString(36).substring(2, 15);
  };

  return (
    <LiveStreamContext.Provider value={{
      liveStreams,
      activeLiveStream,
      messages,
      viewerCount,
      isStreaming,
      joinLiveStream,
      leaveLiveStream,
      startLiveStream,
      endLiveStream,
      sendMessage,
      highlightProduct,
      setActiveLiveStream,
      fetchPublicLiveStreams,
      isLoading
    }}>
      {children}
    </LiveStreamContext.Provider>
  );
}

export function useLiveStream() {
  const context = useContext(LiveStreamContext);
  if (context === undefined) {
    throw new Error('useLiveStream must be used within a LiveStreamProvider');
  }
  return context;
}

// Add EventSource to Window interface
declare global {
  interface Window {
    eventSource: EventSource;
    mercureIntervals: number[];
  }
}