import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Play, 
  Plus,
  Calendar,
  Users,
  Search,
  Filter,
  ChevronDown
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useLiveStream } from '../../contexts/LiveStreamContext';
import { useAuth } from '../../contexts/AuthContext';
import LiveStreamHost from './LiveStreamHost';
import LiveStreamViewer from './LiveStreamViewer';
import CreateLiveStreamModal from './CreateLiveStreamModal';
import toast from 'react-hot-toast';

export default function LiveStreamPage() {
  const { id } = useParams<{ id: string }>();
  const { 
    liveStreams, 
    activeLiveStream, 
    fetchPublicLiveStreams, 
    isLoading 
  } = useLiveStream();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Fetch live streams on mount
  useEffect(() => {
    fetchPublicLiveStreams();
  }, []);
  
  // Filter streams
  const filteredStreams = liveStreams.filter(stream => {
    const matchesSearch = stream.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (stream.description && stream.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         stream.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = categoryFilter === 'all' || stream.tags.includes(categoryFilter);
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'live' && stream.status === 'live') ||
                         (statusFilter === 'scheduled' && stream.status === 'scheduled');
    
    return matchesSearch && matchesCategory && matchesStatus;
  });
  
  // Get unique categories from stream tags
  const categories = ['all', ...Array.from(new Set(liveStreams.flatMap(stream => stream.tags)))];
  
  const handleCreateStream = (streamId: string) => {
    toast.success('Live stream créé avec succès !');
    navigate(`/live-shopping/${streamId}`);
  };
  
  // If viewing a specific stream
  if (id) {
    // Check if user is the streamer
    const isStreamer = activeLiveStream && user && activeLiveStream.streamer.id === user.id;
    
    if (isStreamer) {
      return <LiveStreamHost />;
    } else {
      return <LiveStreamViewer />;
    }
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Live Shopping
            </h1>
            <p className="text-gray-600">
              Découvrez des produits en direct et interagissez avec les vendeurs
            </p>
          </div>
          
          {(user?.role === 'vendor' || user?.role === 'supplier') && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span>Créer un live</span>
            </button>
          )}
        </div>
      </div>
      
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-100">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          {/* Search */}
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Rechercher des lives..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          {/* Filters */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-gray-400" />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="appearance-none px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Toutes catégories</option>
                  {categories.filter(cat => cat !== 'all').map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
              </div>
            </div>
            
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tous statuts</option>
                <option value="live">En direct</option>
                <option value="scheduled">Programmés</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Live Streams Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredStreams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStreams.map(stream => (
            <motion.div
              key={stream.id}
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
            >
              <div className="relative">
                <img
                  src={stream.thumbnail || 'https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg'}
                  alt={stream.title}
                  className="w-full h-48 object-cover"
                />
                
                {stream.status === 'live' ? (
                  <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center">
                    <div className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse"></div>
                    EN DIRECT
                  </div>
                ) : (
                  <div className="absolute top-3 left-3 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    PROGRAMMÉ
                  </div>
                )}
                
                <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs flex items-center">
                  <Users className="h-3 w-3 mr-1" />
                  {stream.viewerCount}
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">{stream.title}</h3>
                
                <div className="flex items-center space-x-2 mb-2">
                  <div className="h-6 w-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-medium">
                      {stream.streamer.firstName[0]}{stream.streamer.lastName[0]}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{stream.streamer.firstName} {stream.streamer.lastName}</p>
                </div>
                
                {stream.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{stream.description}</p>
                )}
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {stream.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
                
                <button
                  onClick={() => navigate(`/live-shopping/${stream.id}`)}
                  className={`w-full flex items-center justify-center space-x-2 py-2 px-4 rounded-lg font-medium transition-colors ${
                    stream.status === 'live'
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  <Play className="h-4 w-4" />
                  <span>{stream.status === 'live' ? 'Rejoindre' : 'Voir les détails'}</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Play className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            Aucun live trouvé
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all'
              ? 'Aucun live ne correspond à vos critères de recherche.'
              : 'Aucun live n\'est disponible pour le moment.'}
          </p>
          {(user?.role === 'vendor' || user?.role === 'supplier') && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Créer un live
            </button>
          )}
        </div>
      )}
      
      {/* Create Live Stream Modal */}
      {showCreateModal && (
        <CreateLiveStreamModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onStreamCreated={handleCreateStream}
        />
      )}
    </div>
  );
}