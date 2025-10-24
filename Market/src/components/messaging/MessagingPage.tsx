import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Phone, Video, MoreVertical } from 'lucide-react';
import { useMessages } from '../../contexts/MessageContext';
import { useAuth } from '../../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useLocation, useNavigate } from 'react-router-dom';
import ChatWindow from './ChatWindow';
import NewConversationModal from './NewConversationModal';

export default function MessagingPage() {
  const { user } = useAuth();
  const {
    conversations,
    messages,
    activeConversation,
    sendMessage,
    markAsRead,
    setActiveConversation,
    createConversation,
    isLoading
  } = useMessages();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewConversationModal, setShowNewConversationModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Check for query parameters (seller or order)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const sellerId = params.get('seller');
    const orderId = params.get('order');
    
    if (sellerId && user) {
      // Start a conversation with the seller
      handleStartConversation(sellerId);
    } else if (orderId) {
      // Find conversation related to this order
      // This would require backend support to find the conversation by order
      console.log('Order conversation:', orderId);
    }
  }, [location, user]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [activeConversation, messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleStartConversation = async (participantId: string) => {
    try {
      const conversationId = await createConversation(participantId);
      setActiveConversation(conversationId);
      
      // Remove query parameters
      navigate('/messages', { replace: true });
    } catch (error) {
      console.error('Error starting conversation:', error);
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.participantDetails.some(participant =>
      participant.id !== user?.id &&
      (participant.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
       participant.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
       participant.company?.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  );

  const activeConversationData = conversations.find(c => c.id === activeConversation);
  const activeMessages = activeConversation ? messages[activeConversation] || [] : [];

  const handleSendMessage = async (content: string, type: string = 'text') => {
    if (!activeConversation || !activeConversationData) return;
    
    // Find the other participant to send the message to
    const otherParticipant = getOtherParticipant(activeConversationData);
    if (!otherParticipant) return;
    
    await sendMessage(activeConversation, content, otherParticipant.id, type);
  };

  const handleConversationClick = async (conversationId: string) => {
    setActiveConversation(conversationId);
    await markAsRead(conversationId);
  };

  const getOtherParticipant = (conversation: any) => {
    return conversation.participantDetails.find((p: any) => p.id !== user?.id);
  };

  const formatMessageTime = (timestamp: string) => {
    return formatDistanceToNow(new Date(timestamp), { 
      addSuffix: true, 
      locale: fr 
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden" style={{ height: '600px' }}>
        <div className="flex h-full">
          {/* Conversations List */}
          <div className="w-1/3 border-r border-gray-200 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Messages</h2>
                <button 
                  onClick={() => setShowNewConversationModal(true)}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
              
              {/* Search */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Rechercher une conversation..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
            </div>

            {/* Conversations */}
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.length > 0 ? (
                filteredConversations.map((conversation) => {
                  const otherParticipant = getOtherParticipant(conversation);
                  const lastMessage = conversation.lastMessage;
                  const isActive = activeConversation === conversation.id;
                  
                  return (
                    <div
                      key={conversation.id}
                      onClick={() => handleConversationClick(conversation.id)}
                      className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                        isActive ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          {otherParticipant?.avatar ? (
                            <img
                              src={otherParticipant.avatar}
                              alt={otherParticipant.firstName}
                              className="h-12 w-12 rounded-full"
                            />
                          ) : (
                            <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-medium">
                                {otherParticipant?.firstName?.[0]}{otherParticipant?.lastName?.[0]}
                              </span>
                            </div>
                          )}
                          <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 border-2 border-white rounded-full"></div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {otherParticipant?.firstName} {otherParticipant?.lastName}
                            </p>
                            {lastMessage && (
                              <p className="text-xs text-gray-500">
                                {formatMessageTime(lastMessage.timestamp)}
                              </p>
                            )}
                          </div>
                          
                          {otherParticipant?.company && (
                            <p className="text-xs text-gray-500 truncate">
                              {otherParticipant.company}
                            </p>
                          )}
                          
                          {lastMessage && (
                            <p className="text-sm text-gray-600 truncate mt-1">
                              {lastMessage.senderId === user?.id ? 'Vous: ' : ''}
                              {lastMessage.content}
                            </p>
                          )}
                        </div>
                        
                        {conversation.unreadCount > 0 && (
                          <div className="h-5 w-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
                            {conversation.unreadCount}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <p>Aucune conversation trouvée</p>
                </div>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            <ChatWindow 
              conversation={activeConversationData}
              messages={activeMessages}
              onSendMessage={handleSendMessage}
            />
          </div>
        </div>
      </div>
      
      {/* New Conversation Modal */}
      <NewConversationModal
        isOpen={showNewConversationModal}
        onClose={() => setShowNewConversationModal(false)}
        onCreateConversation={handleStartConversation}
      />
    </div>
  );
}