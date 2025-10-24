import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  MessageCircle, 
  Send, 
  Heart, 
  Share2, 
  ShoppingCart,
  Eye,
  Users,
  Gift,
  Star,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLiveStream } from '../../contexts/LiveStreamContext';
import { useAuth } from '../../contexts/AuthContext';
import { useOrders } from '../../contexts/OrderContext';
import agoraService from '../../services/liveStreamService';
import toast from 'react-hot-toast';

export default function LiveStreamViewer() {
  const { id } = useParams<{ id: string }>();
  const { 
    activeLiveStream, 
    liveStreams,
    messages, 
    viewerCount, 
    joinLiveStream, 
    leaveLiveStream, 
    sendMessage,
    setActiveLiveStream,
    fetchPublicLiveStreams
  } = useLiveStream();
  const { user } = useAuth();
  const { addToCart } = useOrders();
  const navigate = useNavigate();
  
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const [message, setMessage] = useState('');
  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [highlightedProduct, setHighlightedProduct] = useState<any>(null);
  
  const videoRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  
  // Agora client and remote tracks
  const [agoraClient, setAgoraClient] = useState<any>(null);
  const [remoteUsers, setRemoteUsers] = useState<any[]>([]);
  
  // Fetch stream data
  useEffect(() => {
    const fetchStreamData = async () => {
      if (id) {
        try {
          await fetchPublicLiveStreams();
          const stream = liveStreams.find((s: any) => s.id === id);
          if (stream) {
            setActiveLiveStream(stream);
            
            // Join the stream
            if (stream.status === 'live') {
              handleJoinStream();
            }
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
      handleLeaveStream();
    };
  }, [id, liveStreams]);
  
  // Scroll chat to bottom when messages change
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);
  
  // Simulate product highlight
  useEffect(() => {
    if (activeLiveStream && activeLiveStream.products && activeLiveStream.products.length > 0) {
      const interval = setInterval(() => {
        const randomIndex = Math.floor(Math.random() * activeLiveStream.products.length);
        setHighlightedProduct(activeLiveStream.products[randomIndex]);
        
        // Hide after 10 seconds
        setTimeout(() => {
          setHighlightedProduct(null);
        }, 10000);
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [activeLiveStream]);
  
  const handleJoinStream = async () => {
    if (!activeLiveStream || !user) return;
    
    setIsJoining(true);
    
    try {
      // Join the live stream in backend
      await joinLiveStream(activeLiveStream.id);
      
      // Get Agora token
      const token = await agoraService.getAgoraToken(
        activeLiveStream.id,
        user.id,
        'audience'
      );
      
      // Join Agora channel
      const { client } = await agoraService.joinChannel(
        activeLiveStream.id,
        user.id,
        token,
        'audience'
      );
      
      // Set client
      setAgoraClient(client);
      
      // Listen for remote users
      client.on('user-published', async (user: any, mediaType: string) => {
        await client.subscribe(user, mediaType);
        
        if (mediaType === 'video') {
          setRemoteUsers(prev => [...prev, user]);
          
          // Play remote video
          if (videoRef.current) {
            user.videoTrack.play(videoRef.current);
          }
        }
        
        if (mediaType === 'audio') {
          user.audioTrack.play();
        }
      });
      
      client.on('user-unpublished', (user: any) => {
        setRemoteUsers(prev => prev.filter(u => u.uid !== user.uid));
      });
      
      toast.success('Joined live stream!');
    } catch (error) {
      console.error('Error joining stream:', error);
      toast.error('Failed to join stream');
    } finally {
      setIsJoining(false);
    }
  };
  
  const handleLeaveStream = async () => {
    if (!activeLiveStream) return;
    
    try {
      // Leave Agora channel
      if (agoraClient) {
        await agoraService.leaveChannel();
      }
      
      // Leave the live stream in backend
      await leaveLiveStream();
      
      // Reset state
      setAgoraClient(null);
      setRemoteUsers([]);
      
      navigate('/live-shopping');
    } catch (error) {
      console.error('Error leaving stream:', error);
    }
  };
  
  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    
    // In a real implementation, pause/play the video
    // For now, just toggle the state
  };
  
  const handleMute = () => {
    setIsMuted(!isMuted);
    
    // In a real implementation, mute/unmute the audio
    // For now, just toggle the state
  };
  
  const handleFullscreen = () => {
    if (!videoRef.current) return;
    
    if (!document.fullscreenElement) {
      videoRef.current.requestFullscreen().catch(err => {
        console.error('Error attempting to enable fullscreen:', err);
      });
    } else {
      document.exitFullscreen();
    }
    
    setIsFullscreen(!isFullscreen);
  };
  
  const handleSendMessage = async () => {
    if (!message.trim() || !activeLiveStream) return;
    
    try {
      await sendMessage(message);
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };
  
  const handleLike = () => {
    if (!hasLiked) {
      setLikes(prev => prev + 1);
      setHasLiked(true);
      toast.success('Vous avez aimé ce live !');
    }
  };
  
  const handleShare = () => {
    setShowShareModal(true);
  };
  
  const handleAddToCart = (product: any) => {
    if (!product) return;
    
    // Convert product to the format expected by addToCart
    const formattedProduct = {
      id: product.id,
      title: product.title,
      price: parseFloat(product.price),
      images: ['https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg'],
      category: 'Électronique',
      supplierId: '2',
      stock: 45,
      minOrder: 1,
      tags: ['smartphone', 'tech'],
      rating: 4.8,
      reviewCount: 156,
      isPromoted: false
    };
    
    addToCart(formattedProduct, 1);
    toast.success(`${product.title} ajouté au panier !`);
  };
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
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
                ref={videoRef}
                className="aspect-video bg-gradient-to-br from-purple-600 to-blue-600 relative"
              >
                {/* Back Button */}
                <button
                  onClick={() => navigate('/live-shopping')}
                  className="absolute top-4 left-4 z-20 bg-black/50 backdrop-blur-sm p-2 rounded-full text-white hover:bg-black/70 transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                
                {/* Live Indicator */}
                <div className="absolute top-4 left-16 z-10">
                  <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center">
                    <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                    EN DIRECT
                  </div>
                </div>

                {/* Viewer Count */}
                <div className="absolute top-4 right-4 z-10">
                  <div className="bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm flex items-center">
                    <Eye className="h-4 w-4 mr-1" />
                    {viewerCount}
                  </div>
                </div>

                {/* Video Controls */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 z-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handlePlayPause}
                        className="bg-white/20 backdrop-blur-sm rounded-full p-2 hover:bg-white/30 transition-colors"
                      >
                        {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handleMute}
                        className="bg-white/20 backdrop-blur-sm rounded-full p-2 hover:bg-white/30 transition-colors"
                      >
                        {isMuted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
                      </motion.button>
                    </div>

                    <div className="flex items-center space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handleLike}
                        className={`flex items-center space-x-1 px-3 py-1 rounded-full transition-colors ${
                          hasLiked ? 'bg-red-500' : 'bg-white/20 backdrop-blur-sm hover:bg-white/30'
                        }`}
                      >
                        <Heart className={`h-4 w-4 ${hasLiked ? 'fill-current' : ''}`} />
                        <span className="text-sm">{likes}</span>
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handleShare}
                        className="bg-white/20 backdrop-blur-sm rounded-full p-2 hover:bg-white/30 transition-colors"
                      >
                        <Share2 className="h-4 w-4" />
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handleFullscreen}
                        className="bg-white/20 backdrop-blur-sm rounded-full p-2 hover:bg-white/30 transition-colors"
                      >
                        <Maximize className="h-4 w-4" />
                      </motion.button>
                    </div>
                  </div>
                </div>

                {/* Highlighted Product */}
                <AnimatePresence>
                  {highlightedProduct && (
                    <motion.div
                      initial={{ y: 100, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: 100, opacity: 0 }}
                      className="absolute bottom-20 left-4 right-4 bg-white/90 backdrop-blur-sm rounded-xl p-4 z-20"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{highlightedProduct.title}</p>
                          <p className="text-blue-600 font-bold">€{highlightedProduct.price}</p>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleAddToCart(highlightedProduct)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold"
                        >
                          Acheter
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Simulated video content */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {activeLiveStream.status === 'live' ? (
                    remoteUsers.length > 0 ? (
                      <div>
                        {/* Remote video will be played here by Agora */}
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mb-4 mx-auto">
                          <Play className="h-12 w-12 text-white ml-1" />
                        </div>
                        <p className="text-white/80">Contenu vidéo en direct</p>
                      </div>
                    )
                  ) : (
                    <div className="text-center">
                      <h3 className="text-xl font-bold mb-4">Ce live est programmé pour plus tard</h3>
                      <p className="text-white/80 mb-6">
                        {new Date(activeLiveStream.scheduledAt || '').toLocaleString('fr-FR', {
                          dateStyle: 'long',
                          timeStyle: 'short'
                        })}
                      </p>
                      <button
                        onClick={() => {
                          // Subscribe to notifications
                          toast.success('Vous recevrez une notification quand le live commencera');
                        }}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Me notifier
                      </button>
                    </div>
                  )}
                </div>
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
                      <span>
                        {activeLiveStream.status === 'live' 
                          ? 'En direct' 
                          : `Programmé pour le ${new Date(activeLiveStream.scheduledAt || '').toLocaleDateString()}`
                        }
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <img
                    src="https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?w=100&h=100&fit=crop&crop=face"
                    alt={`${activeLiveStream.streamer.firstName} ${activeLiveStream.streamer.lastName}`}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-white">{activeLiveStream.streamer.firstName} {activeLiveStream.streamer.lastName}</h3>
                      <div className="bg-blue-500 rounded-full p-1">
                        <Star className="h-3 w-3 text-white fill-current" />
                      </div>
                    </div>
                    <p className="text-gray-400 text-sm">
                      {activeLiveStream.streamer.company || '1.5K abonnés'}
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="ml-auto bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    S'abonner
                  </motion.button>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {activeLiveStream.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Featured Products */}
            <div className="mt-6 bg-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <ShoppingCart className="h-5 w-5 mr-2" />
                Produits présentés
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {activeLiveStream.products && activeLiveStream.products.map((product: any) => (
                  <motion.div
                    key={product.id}
                    whileHover={{ scale: 1.02 }}
                    className="bg-gray-700 rounded-lg p-4 relative"
                  >
                    <div className="bg-gray-600 h-32 rounded-lg mb-3"></div>
                    
                    <h3 className="font-semibold text-white mb-2 text-sm">{product.title}</h3>
                    
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="text-lg font-bold text-white">€{product.price}</span>
                    </div>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleAddToCart(product)}
                      className="w-full py-2 px-4 rounded-lg font-semibold text-sm transition-colors bg-blue-600 text-white hover:bg-blue-700"
                    >
                      Ajouter au panier
                    </motion.button>
                  </motion.div>
                ))}
                
                {(!activeLiveStream.products || activeLiveStream.products.length === 0) && (
                  <div className="col-span-3 text-center py-8 text-gray-400">
                    <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Aucun produit présenté pour le moment</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Chat Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-xl h-full flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-white flex items-center">
                    <MessageCircle className="h-5 w-5 mr-2" />
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
                <AnimatePresence>
                  {messages.map((msg: any) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="flex flex-col space-y-1"
                    >
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm font-semibold ${
                          msg.userId === user?.id ? 'text-blue-400' :
                          msg.userId === activeLiveStream.streamer.id ? 'text-purple-400' : 'text-gray-300'
                        }`}>
                          {msg.userName}
                        </span>
                        {msg.userId === activeLiveStream.streamer.id && (
                          <span className="bg-purple-600 text-white text-xs px-1 py-0.5 rounded">
                            HOST
                          </span>
                        )}
                        <span className="text-xs text-gray-500">
                          {formatTime(new Date(msg.createdAt))}
                        </span>
                      </div>
                      <p className="text-white text-sm">{msg.content}</p>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Chat Input */}
              <div className="p-4 border-t border-gray-700">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
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
                
                {/* Quick Actions */}
                <div className="flex space-x-2 mt-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setMessage('👍')}
                    className="bg-gray-700 text-white px-3 py-1 rounded text-sm hover:bg-gray-600 transition-colors"
                  >
                    👍
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setMessage('🔥')}
                    className="bg-gray-700 text-white px-3 py-1 rounded text-sm hover:bg-gray-600 transition-colors"
                  >
                    🔥
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setMessage('❤️')}
                    className="bg-gray-700 text-white px-3 py-1 rounded text-sm hover:bg-gray-600 transition-colors"
                  >
                    ❤️
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl max-w-md w-full p-6 text-gray-900"
            >
              <h3 className="text-xl font-semibold mb-4">Partager ce live</h3>
              
              <div className="grid grid-cols-2 gap-3 mb-4">
                <button
                  onClick={() => {
                    // Share on Facebook
                    window.open(`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`, '_blank');
                    setShowShareModal(false);
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg"
                >
                  <span>Facebook</span>
                </button>
                
                <button
                  onClick={() => {
                    // Share on Twitter
                    window.open(`https://twitter.com/intent/tweet?url=${window.location.href}&text=${encodeURIComponent(activeLiveStream.title)}`, '_blank');
                    setShowShareModal(false);
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-sky-500 text-white rounded-lg"
                >
                  <span>Twitter</span>
                </button>
                
                <button
                  onClick={() => {
                    // Share on WhatsApp
                    window.open(`https://wa.me/?text=${encodeURIComponent(`${activeLiveStream.title} ${window.location.href}`)}`, '_blank');
                    setShowShareModal(false);
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg"
                >
                  <span>WhatsApp</span>
                </button>
                
                <button
                  onClick={() => {
                    // Share via email
                    window.location.href = `mailto:?subject=${encodeURIComponent(activeLiveStream.title)}&body=${encodeURIComponent(`Regarde ce live: ${window.location.href}`)}`;
                    setShowShareModal(false);
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg"
                >
                  <span>Email</span>
                </button>
              </div>
              
              <div className="flex items-center space-x-2 mb-4">
                <input
                  type="text"
                  value={window.location.href}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success('Lien copié !');
                  }}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Copier
                </button>
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={() => setShowShareModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Fermer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}