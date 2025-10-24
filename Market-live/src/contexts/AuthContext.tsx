import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: User['role']) => Promise<void>;
  logout: () => void;
  register: (userData: Omit<User, 'id' | 'rating' | 'reviewCount' | 'isVerified' | 'badges' | 'joinedAt'>) => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demonstration
const mockUsers: User[] = [
  {
    id: '1',
    email: 'vendor@example.com',
    firstName: 'Jean',
    lastName: 'Vendeur',
    role: 'vendor',
    company: 'VendeurPro SARL',
    phone: '+33 1 23 45 67 89',
    address: '123 Rue du Commerce, 75001 Paris',
    rating: 4.8,
    reviewCount: 156,
    isVerified: true,
    badges: ['verified', 'top-seller'],
    joinedAt: '2023-01-15'
  },
  {
    id: '2',
    email: 'supplier@example.com',
    firstName: 'Marie',
    lastName: 'Fournisseur',
    role: 'supplier',
    company: 'SupplyChain Solutions',
    phone: '+33 1 98 76 54 32',
    address: '456 Avenue de l\'Industrie, 69000 Lyon',
    rating: 4.9,
    reviewCount: 203,
    isVerified: true,
    badges: ['verified', 'premium'],
    joinedAt: '2022-11-08'
  },
  {
    id: '3',
    email: 'client@example.com',
    firstName: 'Pierre',
    lastName: 'Client',
    role: 'client',
    company: 'Entreprise ABC',
    phone: '+33 1 11 22 33 44',
    address: '789 Boulevard des Affaires, 13000 Marseille',
    rating: 4.5,
    reviewCount: 89,
    isVerified: true,
    badges: ['verified'],
    joinedAt: '2023-03-22'
  }
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user data
    const storedUser = localStorage.getItem('user');
    
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, role: User['role']) => {
    setIsLoading(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Find mock user by email
      const mockUser = mockUsers.find(u => u.email === email);
      
      if (!mockUser) {
        throw new Error('Utilisateur non trouvé');
      }
      
      // For demo purposes, accept any password
      // In a real app, you would verify the password
      
      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      toast.success(`Bienvenue ${mockUser.firstName} !`);
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Identifiants invalides');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: Omit<User, 'id' | 'rating' | 'reviewCount' | 'isVerified' | 'badges' | 'joinedAt'>) => {
    setIsLoading(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create new user with default values
      const newUser: User = {
        ...userData,
        id: Date.now().toString(),
        rating: 0,
        reviewCount: 0,
        isVerified: false,
        badges: [],
        joinedAt: new Date().toISOString().split('T')[0]
      };
      
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
      
      toast.success('Compte créé avec succès !');
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Erreur lors de l\'inscription');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (userData: Partial<User>) => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      toast.success('Profil mis à jour avec succès !');
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Erreur lors de la mise à jour du profil');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    toast.success('Déconnexion réussie');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, updateProfile, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}