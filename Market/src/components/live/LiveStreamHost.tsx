import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Users, 
  MessageSquare, 
  Share2, 
  Settings, 
  X, 
  ShoppingBag,
  Eye,
  ChevronDown,
  ChevronUp,
  Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLiveStream } from '../../contexts/LiveStreamContext';
import { useAuth } from '../../contexts/AuthContext';
import agoraService from '../../services/liveStreamService';
import toast from 'react-hot-toast';

export default function LiveStreamHost() {
  const { id } = useParams<{ id: string }>();
  const { 
    activeLiveStream, 
    messages, 
    viewerCount, 
    isStreaming, 
    startLiveStream, 
    endLiveStream, 
    sendMessage, 
    highlightProduct,
    setActiveLiveStream,
    fetchPublicLiveStreams
  } = useLiveStream();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [showChat, setShowChat] = useState(true);
  const [showProducts, setShowProducts] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  
  const localVideoRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  
  // Agora client and tracks
  const [agoraClient, setAgoraClient] = useState<any>(null);
  const [localTracks, setLocalTracks] = useState<any[]>([]);
  
  // Fetch stream data
  useEffect(() => {
    const fetchStreamData = async () => {
      if (id) {
        try {
          const streams = await fetchPublicLiveStreams();
          const stream = streams.find((s: any) => s.id === id);
          if (stream) {
            setActiveLiveStream(stream);
          } else {
            toast.error('Stream not found');
            navigate('/live-shopping');
          }
        } catch (error) {
          console.error('Error fetching stream data:', error);
          toast.error('Error loading stream');
        }
      }
    };
    
    fetchStreamData();
    
    return () => {
      // Clean up
      if (isStreaming) {
        handleEndStream();
      }
    };
  }, [id]);
  
  // Scroll chat to bottom when messages change
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);
  
  const handleStartStream = async () => {
    if (!activeLiveStream || !user) return;
    
    setIsJoining(true);
    
    try {
      // Get Agora token
      const token = await agoraService.getAgoraToken(
        activeLiveStream.id,
        user.id,
        'host'
      );
      
      // Join Agora channel
      const { client, localTracks } = await agoraService.joinChannel(
        activeLiveStream.id,
        user.id,
        token,
        'host'
      );
      
      // Set client and tracks
      setAgoraClient(client);
      setLocalTracks(localTracks);
      
      // Play local video
      if (localTracks && localTracks[1] && localVideoRef.current) {
        localTracks[1].play(localVideoRef.current);
      }
      
      // Start live stream in backend
      await startLiveStream(activeLiveStream.id);
      
      toast.success('Live stream started!');
    } catch (error) {
      console.error('Error starting stream:', error);
      toast.error('Failed to start stream');
    } finally {
      setIsJoining(false);
    }
  };
  
  const handleEndStream = async () => {
    if (!activeLiveStream) return;
    
    setIsLeaving(true);
    
    try {
      // Leave Agora channel
      if (localTracks.length > 0) {
        await agoraService.leaveChannel(localTracks);
      }
      
      // End live stream in backend
      await endLiveStream(activeLiveStream.id);
      
      // Reset state
      setAgoraClient(null);
      setLocalTracks([]);
      
      toast.success('Live stream ended');
      navigate('/live-shopping');
    } catch (error) {
      console.error('Error ending stream:', error);
      toast.error('Failed to end stream');
    } finally {
      setIsLeaving(false);
    }
  };
  
  const toggleAudio = async () => {
    if (localTracks && localTracks[0]) {
      await agoraService.toggleAudio(localTracks[0]);
      setIsAudioEnabled(!isAudioEnabled);
    }
  };
  
  const toggleVideo = async () => {
    if (localTracks && localTracks[1]) {
      await agoraService.toggleVideo(localTracks[1]);
      setIsVideoEnabled(!isVideoEnabled);
    }
  };
  
  const handleSendMessage = async () => {
    if (!messageInput.trim() || !activeLiveStream) return;
    
    try {
      await sendMessage(messageInput);
      setMessageInput('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };
  
  const handleHighlightProduct = async (productId: string) => {
    if (!activeLiveStream) return;
    
    try {
      await highlightProduct(productId);
      toast.success('Product highlighted');
    } catch (error) {
      console.error('Error highlighting product:', error);
      toast.error('Failed to highlight product');
    }
  };
  
  if (!activeLiveStream) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-4">
          
          {/* Main Video Area */}
          <div className="lg:col-span-3">
            <div className="relative bg-black rounded-xl overflow-hidden">
              {/* Video Player */}
              <div 
                className="aspect-video bg-gradient-to-br from-purple-900 to-blue-900 relative"
              >
                {/* Local Video */}
                <div 
                  ref={localVideoRef}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  {!isStreaming && (
                    <div className="text-center">
                      <h3 className="text-xl font-bold mb-4">Prêt à commencer votre live ?</h3>
                      <button
                        onClick={handleStartStream}
                        disabled={isJoining}
                        className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isJoining ? 'Connexion...' : 'Démarrer le live'}
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Live Indicator */}
                {isStreaming && (
                  <div className="absolute top-4 left-4 z-10">
                    <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center">
                      <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                      EN DIRECT
                    </div>
                  </div>
                )}
                
                {/* Viewer Count */}
                {isStreaming && (
                  <div className="absolute top-4 right-4 z-10">
                    <div className="bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm flex items-center">
                      <Eye className="h-4 w-4 mr-1" />
                      {viewerCount}
                    </div>
                  </div>
                )}
                
                {/* Stream Controls */}
                {isStreaming && (
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-4 z-10">
                    <button
                      onClick={toggleAudio}
                      className={`p-3 rounded-full ${
                        isAudioEnabled ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'
                      } transition-colors`}
                    >
                      {isAudioEnabled ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
                    </button>
                    
                    <button
                      onClick={toggleVideo}
                      className={`p-3 rounded-full ${
                        isVideoEnabled ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'
                      } transition-colors`}
                    >
                      {isVideoEnabled ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
                    </button>
                    
                    <button
                      onClick={() => setShowSettings(!showSettings)}
                      className="p-3 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
                    >
                      <Settings className="h-6 w-6" />
                    </button>
                    
                    <button
                      onClick={handleEndStream}
                      disabled={isLeaving}
                      className="px-6 py-3 rounded-full bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLeaving ? 'Fin du live...' : 'Terminer le live'}
                    </button>
                  </div>
                )}
              </div>
              
              {/* Stream Info */}
              <div className="p-6 bg-gray-800">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-2xl font-bold text-white mb-2">{activeLiveStream.title}</h1>
                    <div className="flex items-center space-x-4 text-gray-300">
                      <span className="bg-blue-600 text-white px-2 py-1 rounded text-sm">
                        {activeLiveStream.tags[0] || 'Tech'}
                      </span>
                      <span>{isStreaming ? 'En direct' : 'Prêt à démarrer'}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setShowChat(!showChat)}
                      className={`p-2 rounded-lg ${
                        showChat ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-700 hover:bg-gray-600'
                      } transition-colors`}
                    >
                      <MessageSquare className="h-5 w-5" />
                    </button>
                    
                    <button
                      onClick={() => setShowProducts(!showProducts)}
                      className={`p-2 rounded-lg ${
                        showProducts ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-700 hover:bg-gray-600'
                      } transition-colors`}
                    >
                      <ShoppingBag className="h-5 w-5" />
                    </button>
                    
                    <button
                      className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
                    >
                      <Share2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium">
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{user?.firstName} {user?.lastName}</h3>
                      <p className="text-gray-400 text-sm">{user?.company || 'Streamer'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Products Panel */}
            <AnimatePresence>
              {showProducts && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 bg-gray-800 rounded-xl overflow-hidden"
                >
                  <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                    <h3 className="font-semibold text-white">Produits à présenter</h3>
                    <button
                      onClick={() => setShowProducts(false)}
                      className="text-gray-400 hover:text-white"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {activeLiveStream.products && activeLiveStream.products.map((product: any) => (
                      <div
                        key={product.id}
                        className="bg-gray-700 rounded-lg p-3 cursor-pointer hover:bg-gray-600 transition-colors"
                        onClick={() => handleHighlightProduct(product.id)}
                      >
                        <div className="aspect-square bg-gray-600 rounded-lg mb-2"></div>
                        <h4 className="text-sm font-medium text-white truncate">{product.title}</h4>
                        <p className="text-sm text-blue-400">€{product.price}</p>
                      </div>
                    ))}
                    
                    {(!activeLiveStream.products || activeLiveStream.products.length === 0) && (
                      <div className="col-span-4 text-center py-8 text-gray-400">
                        <ShoppingBag className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>Aucun produit à présenter</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Settings Panel */}
            <AnimatePresence>
              {showSettings && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 bg-gray-800 rounded-xl overflow-hidden"
                >
                  <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                    <h3 className="font-semibold text-white">Paramètres du live</h3>
                    <button
                      onClick={() => setShowSettings(false)}
                      className="text-gray-400 hover:text-white"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <div className="p-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Titre du live
                      </label>
                      <input
                        type="text"
                        value={activeLiveStream.title}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        readOnly
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Description
                      </label>
                      <textarea
                        value={activeLiveStream.description || ''}
                        rows={3}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        readOnly
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-300">Chat activé</span>
                      <div className="relative inline-block w-10 mr-2 align-middle select-none">
                        <input
                          type="checkbox"
                          checked={activeLiveStream.allowChat}
                          readOnly
                          className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 border-gray-700 appearance-none cursor-pointer"
                        />
                        <label className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-700 cursor-pointer"></label>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-300">Enregistrer le live</span>
                      <div className="relative inline-block w-10 mr-2 align-middle select-none">
                        <input
                          type="checkbox"
                          checked={activeLiveStream.recordStream}
                          readOnly
                          className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 border-gray-700 appearance-none cursor-pointer"
                        />
                        <label className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-700 cursor-pointer"></label>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Chat Sidebar */}
          {showChat && (
            <div className="lg:col-span-1">
              <div className="bg-gray-800 rounded-xl h-full flex flex-col">
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-700">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-white flex items-center">
                      <MessageSquare className="h-5 w-5 mr-2" />
                      Chat en direct
                    </h3>
                    <div className="flex items-center space-x-1 text-gray-400 text-sm">
                      <Users className="h-4 w-4" />
                      <span>{viewerCount}</span>
                    </div>
                  </div>
                </div>
                
                {/* Chat Messages */}
                <div 
                  ref={chatRef}
                  className="flex-1 p-4 overflow-y-auto space-y-3 max-h-96"
                >
                  {messages.map((msg: any) => (
                    <div key={msg.id} className="flex flex-col space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm font-semibold ${
                          msg.userId === user?.id ? 'text-blue-400' : 'text-gray-300'
                        }`}>
                          {msg.userName}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(msg.createdAt).toLocaleTimeString('fr-FR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                      <p className="text-white text-sm">{msg.content}</p>
                    </div>
                  ))}
                </div>
                
                {/* Chat Input */}
                <div className="p-4 border-t border-gray-700">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Tapez votre message..."
                      className="flex-1 bg-gray-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={handleSendMessage}
                      className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}