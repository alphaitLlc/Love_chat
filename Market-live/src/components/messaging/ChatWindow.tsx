import React, { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, Smile, Image, File, X, Check, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import useMercureChat from '../../hooks/useMercureChat';

interface ChatWindowProps {
  conversation: any;
  messages: any[];
  onSendMessage: (content: string, type?: string) => Promise<void>;
}

export default function ChatWindow({ conversation, messages, onSendMessage }: ChatWindowProps) {
  const { user } = useAuth();
  const [messageInput, setMessageInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Get real-time typing indicators and connection status
  const { isTyping, isConnected, sendTypingIndicator } = useMercureChat(conversation?.id);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleSendMessage = async () => {
    if (!messageInput.trim()) return;
    
    try {
      await onSendMessage(messageInput);
      setMessageInput('');
      
      // Clear typing indicator
      sendTypingIndicator(false);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageInput(e.target.value);
    
    // Send typing indicator
    sendTypingIndicator(e.target.value.length > 0);
  };
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsUploading(true);
      
      // Simulate file upload
      setTimeout(() => {
        // Get file info
        const file = e.target.files![0];
        const isImage = file.type.startsWith('image/');
        
        // Create message with file
        const fileMessage = isImage 
          ? `[Image: ${file.name}]` 
          : `[Fichier: ${file.name}]`;
        
        // Send message
        onSendMessage(fileMessage, isImage ? 'image' : 'file')
          .then(() => {
            setIsUploading(false);
            // Reset file input
            if (fileInputRef.current) {
              fileInputRef.current.value = '';
            }
          })
          .catch(error => {
            console.error('Error sending file:', error);
            setIsUploading(false);
          });
      }, 1500);
    }
  };
  
  const handleEmojiSelect = (emoji: string) => {
    setMessageInput(prev => prev + emoji);
    setShowEmojiPicker(false);
  };
  
  const formatMessageTime = (timestamp: string) => {
    return formatDistanceToNow(new Date(timestamp), { 
      addSuffix: true, 
      locale: fr 
    });
  };
  
  // Get other participant
  const otherParticipant = conversation?.participantDetails?.find(
    (p: any) => p.id !== user?.id
  );
  
  // Common emojis
  const commonEmojis = ['👍', '👌', '👏', '🙏', '❤️', '😊', '😂', '🔥', '👋', '🎉'];
  
  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 text-gray-500">
        <div className="text-center">
          <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Sélectionnez une conversation
          </h3>
          <p className="text-gray-600">
            Choisissez une conversation dans la liste pour commencer à discuter
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              {otherParticipant?.avatar ? (
                <img
                  src={otherParticipant.avatar}
                  alt={otherParticipant.firstName}
                  className="h-10 w-10 rounded-full"
                />
              ) : (
                <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {otherParticipant?.firstName?.[0]}{otherParticipant?.lastName?.[0]}
                  </span>
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">
                {otherParticipant?.firstName} {otherParticipant?.lastName}
              </h3>
              <p className="text-sm text-gray-500">
                {otherParticipant?.company || otherParticipant?.role}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <span className="text-xs text-green-600 flex items-center">
                <span className="h-2 w-2 bg-green-500 rounded-full mr-1"></span>
                Connecté
              </span>
            ) : (
              <span className="text-xs text-yellow-600 flex items-center">
                <span className="h-2 w-2 bg-yellow-500 rounded-full mr-1"></span>
                Reconnexion...
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((message) => {
          const isOwn = message.senderId === user?.id;
          
          return (
            <div
              key={message.id}
              className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
                {!isOwn && (
                  <div className="h-8 w-8 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-medium">
                      {message.senderName.split(' ').map((n: string) => n[0]).join('')}
                    </span>
                  </div>
                )}
                
                <div>
                  <div className={`p-3 rounded-2xl ${
                    isOwn
                      ? 'bg-blue-600 text-white rounded-br-md'
                      : 'bg-white text-gray-800 rounded-bl-md shadow-sm'
                  }`}>
                    {message.type === 'image' ? (
                      <div className="bg-gray-200 rounded p-2 text-gray-800">
                        <Image className="h-4 w-4 inline mr-2" />
                        <span className="text-sm">{message.content}</span>
                      </div>
                    ) : message.type === 'file' ? (
                      <div className="bg-gray-200 rounded p-2 text-gray-800">
                        <File className="h-4 w-4 inline mr-2" />
                        <span className="text-sm">{message.content}</span>
                      </div>
                    ) : (
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    )}
                  </div>
                  <div className="flex items-center mt-1 px-1">
                    <p className="text-xs text-gray-500">
                      {formatMessageTime(message.timestamp)}
                    </p>
                    {isOwn && (
                      <span className="ml-1">
                        {message.read ? (
                          <Check className="h-3 w-3 text-blue-500" />
                        ) : (
                          <Clock className="h-3 w-3 text-gray-400" />
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        
        {/* Typing indicator */}
        <AnimatePresence>
          {Object.entries(isTyping).map(([userId, isTyping]) => {
            if (userId === user?.id || !isTyping) return null;
            
            const typingUser = conversation.participantDetails.find((p: any) => p.id === userId);
            if (!typingUser) return null;
            
            return (
              <motion.div
                key={`typing-${userId}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex justify-start"
              >
                <div className="flex items-end space-x-2">
                  <div className="h-8 w-8 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-medium">
                      {typingUser.firstName[0]}{typingUser.lastName[0]}
                    </span>
                  </div>
                  <div className="bg-white p-3 rounded-2xl rounded-bl-md shadow-sm">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex items-end space-x-2">
          <div className="flex-1 relative">
            <textarea
              value={messageInput}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Tapez votre message..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={1}
              style={{ minHeight: '40px', maxHeight: '120px' }}
            />
            
            <div className="absolute bottom-2 right-2 flex items-center space-x-2">
              <div className="relative">
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-1 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <Smile className="h-5 w-5" />
                </button>
                
                <AnimatePresence>
                  {showEmojiPicker && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: 10 }}
                      className="absolute bottom-10 right-0 bg-white rounded-lg shadow-lg border border-gray-200 p-2 z-10"
                    >
                      <div className="grid grid-cols-5 gap-1">
                        {commonEmojis.map((emoji, index) => (
                          <button
                            key={index}
                            onClick={() => handleEmojiSelect(emoji)}
                            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded transition-colors"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-1 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
                disabled={isUploading}
              >
                <Paperclip className="h-5 w-5" />
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </button>
            </div>
          </div>
          
          <button
            onClick={handleSendMessage}
            disabled={!messageInput.trim() || isUploading}
            className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
        
        {/* Upload progress */}
        <AnimatePresence>
          {isUploading && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2"
            >
              <div className="bg-blue-50 rounded-lg p-2 flex items-center justify-between">
                <div className="flex items-center">
                  <File className="h-4 w-4 text-blue-500 mr-2" />
                  <span className="text-sm text-blue-700">Envoi du fichier en cours...</span>
                </div>
                <div className="w-24 bg-gray-200 rounded-full h-2.5">
                  <div className="bg-blue-600 h-2.5 rounded-full animate-pulse w-3/4"></div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}