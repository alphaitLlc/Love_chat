import React, { useState, useEffect } from 'react';
import { X, Search, User, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

interface NewConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateConversation: (participantId: string) => Promise<void>;
}

export default function NewConversationModal({ isOpen, onClose, onCreateConversation }: NewConversationModalProps) {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  
  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);
  
  useEffect(() => {
    if (searchTerm) {
      setFilteredUsers(
        users.filter(u => 
          u.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.email.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    } else {
      setFilteredUsers(users);
    }
  }, [searchTerm, users]);
  
  const fetchUsers = async () => {
    setIsLoading(true);
    
    try {
      // In a real implementation, fetch users from API
      // For development, use mock data
      setTimeout(() => {
        const mockUsers = [
          {
            id: '2',
            firstName: 'Marie',
            lastName: 'Fournisseur',
            email: 'supplier@example.com',
            role: 'supplier',
            company: 'SupplyChain Solutions',
            avatar: null
          },
          {
            id: '3',
            firstName: 'Pierre',
            lastName: 'Client',
            email: 'client@example.com',
            role: 'client',
            company: 'Entreprise ABC',
            avatar: null
          },
          {
            id: '4',
            firstName: 'Sophie',
            lastName: 'Martin',
            email: 'sophie@example.com',
            role: 'vendor',
            company: 'Mode Express',
            avatar: null
          }
        ];
        
        // Filter out current user
        const filteredUsers = mockUsers.filter(u => u.id !== user?.id);
        
        setUsers(filteredUsers);
        setFilteredUsers(filteredUsers);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Erreur lors du chargement des utilisateurs');
      setIsLoading(false);
    }
  };
  
  const handleCreateConversation = async () => {
    if (!selectedUser) {
      toast.error('Veuillez sélectionner un utilisateur');
      return;
    }
    
    try {
      await onCreateConversation(selectedUser.id);
      onClose();
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast.error('Erreur lors de la création de la conversation');
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl max-w-md w-full"
      >
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Nouvelle conversation</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-4">
          <div className="mb-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Rechercher un utilisateur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="max-h-60 overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              </div>
            ) : filteredUsers.length > 0 ? (
              <div className="space-y-2">
                {filteredUsers.map(user => (
                  <div
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedUser?.id === user.id 
                        ? 'bg-blue-50 border border-blue-200' 
                        : 'hover:bg-gray-50 border border-transparent'
                    }`}
                  >
                    <div className="mr-3">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.firstName}
                          className="h-10 w-10 rounded-full"
                        />
                      ) : (
                        <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium">
                            {user.firstName[0]}{user.lastName[0]}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </h3>
                      <div className="flex items-center text-sm text-gray-500">
                        {user.company && (
                          <span className="truncate">{user.company}</span>
                        )}
                        {user.company && user.role && <span className="mx-1">•</span>}
                        {user.role && (
                          <span className="capitalize">{user.role}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <User className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">Aucun utilisateur trouvé</p>
              </div>
            )}
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleCreateConversation}
              disabled={!selectedUser}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Démarrer la conversation
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}