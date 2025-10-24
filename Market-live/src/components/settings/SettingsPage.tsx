import React, { useState, useEffect } from 'react';
import { Bell, Lock, CreditCard, User, Settings, Shield, Globe, Moon, Sun, Smartphone, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { notificationService, authService } from '../../services/api';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('notifications');
  const [notificationPreferences, setNotificationPreferences] = useState({
    email: true,
    push: true,
    sms: false,
    marketing: true
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('fr');

  useEffect(() => {
    if (user) {
      fetchNotificationPreferences();
      
      // Set initial values from user preferences
      if (user.preferences) {
        setLanguage(user.preferences.language || 'fr');
        setDarkMode(user.preferences.darkMode || false);
      }
    }
  }, [user]);

  const fetchNotificationPreferences = async () => {
    try {
      const response = await notificationService.getNotificationPreferences();
      setNotificationPreferences(response.preferences);
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
    }
  };

  const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setNotificationPreferences(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const saveNotificationPreferences = async () => {
    setIsLoading(true);
    try {
      await notificationService.updateNotificationPreferences(notificationPreferences);
      toast.success('Préférences de notification mises à jour');
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      toast.error('Erreur lors de la mise à jour des préférences');
    } finally {
      setIsLoading(false);
    }
  };

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }
    
    setIsLoading(true);
    try {
      await authService.changePassword(passwordData.currentPassword, passwordData.newPassword);
      toast.success('Mot de passe mis à jour avec succès');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Erreur lors du changement de mot de passe');
    } finally {
      setIsLoading(false);
    }
  };

  const saveAppearanceSettings = async () => {
    setIsLoading(true);
    try {
      const updatedPreferences = {
        ...user.preferences,
        language,
        darkMode
      };
      
      await updateProfile({ preferences: updatedPreferences });
      toast.success('Préférences d\'apparence mises à jour');
    } catch (error) {
      console.error('Error updating appearance settings:', error);
      toast.error('Erreur lors de la mise à jour des préférences');
    } finally {
      setIsLoading(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'notifications':
        return (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Préférences de notification</h2>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-medium text-gray-900">Notifications par email</h3>
                  <p className="text-sm text-gray-500">Recevez des notifications par email</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="email"
                    checked={notificationPreferences.email}
                    onChange={handleNotificationChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-medium text-gray-900">Notifications push</h3>
                  <p className="text-sm text-gray-500">Recevez des notifications sur votre appareil</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="push"
                    checked={notificationPreferences.push}
                    onChange={handleNotificationChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-medium text-gray-900">Notifications SMS</h3>
                  <p className="text-sm text-gray-500">Recevez des notifications par SMS</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="sms"
                    checked={notificationPreferences.sms}
                    onChange={handleNotificationChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-medium text-gray-900">Emails marketing</h3>
                  <p className="text-sm text-gray-500">Recevez des offres et promotions</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="marketing"
                    checked={notificationPreferences.marketing}
                    onChange={handleNotificationChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
            
            <div className="mt-8">
              <button
                onClick={saveNotificationPreferences}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                    Enregistrement...
                  </div>
                ) : 'Enregistrer les préférences'}
              </button>
            </div>
          </div>
        );
        
      case 'security':
        return (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Sécurité</h2>
            
            <form onSubmit={savePassword} className="space-y-6">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Mot de passe actuel
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Nouveau mot de passe
                </label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmer le nouveau mot de passe
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <Loader2 className="animate-spin h-4 w-4 mr-2" />
                      Mise à jour...
                    </div>
                  ) : 'Mettre à jour le mot de passe'}
                </button>
              </div>
            </form>
            
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Sessions actives</h3>
              <p className="text-gray-600 mb-4">
                Vous êtes actuellement connecté sur cet appareil. Si vous remarquez une activité suspecte, déconnectez-vous et changez votre mot de passe.
              </p>
              <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                Se déconnecter de toutes les sessions
              </button>
            </div>
          </div>
        );
        
      case 'payment':
        return (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Moyens de paiement</h2>
            
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <p className="text-blue-800">
                Cette fonctionnalité sera bientôt disponible. Vous pourrez ajouter et gérer vos moyens de paiement ici.
              </p>
            </div>
            
            <a
              href="#"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Ajouter un moyen de paiement
            </a>
          </div>
        );
        
      case 'appearance':
        return (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Apparence</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-medium text-gray-900 mb-3">Thème</h3>
                <div className="flex space-x-4">
                  <div
                    onClick={() => setDarkMode(false)}
                    className={`flex flex-col items-center p-4 border rounded-lg cursor-pointer ${
                      !darkMode ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    <Sun className="h-8 w-8 text-gray-700 mb-2" />
                    <span className="text-sm font-medium">Clair</span>
                  </div>
                  
                  <div
                    onClick={() => setDarkMode(true)}
                    className={`flex flex-col items-center p-4 border rounded-lg cursor-pointer ${
                      darkMode ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    <Moon className="h-8 w-8 text-gray-700 mb-2" />
                    <span className="text-sm font-medium">Sombre</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-base font-medium text-gray-900 mb-3">Langue</h3>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="de">Deutsch</option>
                </select>
              </div>
            </div>
            
            <div className="mt-8">
              <button
                onClick={saveAppearanceSettings}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                    Enregistrement...
                  </div>
                ) : 'Enregistrer les préférences'}
              </button>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Paramètres</h1>
        <p className="text-gray-600">Gérez vos préférences et paramètres de compte</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
            <nav className="p-4">
              <ul className="space-y-1">
                <li>
                  <button
                    onClick={() => setActiveTab('notifications')}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === 'notifications' 
                        ? 'bg-blue-50 text-blue-700' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Bell className="h-5 w-5" />
                    <span>Notifications</span>
                  </button>
                </li>
                
                <li>
                  <button
                    onClick={() => setActiveTab('security')}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === 'security' 
                        ? 'bg-blue-50 text-blue-700' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Lock className="h-5 w-5" />
                    <span>Sécurité</span>
                  </button>
                </li>
                
                <li>
                  <button
                    onClick={() => setActiveTab('payment')}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === 'payment' 
                        ? 'bg-blue-50 text-blue-700' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <CreditCard className="h-5 w-5" />
                    <span>Paiement</span>
                  </button>
                </li>
                
                <li>
                  <button
                    onClick={() => setActiveTab('appearance')}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === 'appearance' 
                        ? 'bg-blue-50 text-blue-700' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Settings className="h-5 w-5" />
                    <span>Apparence</span>
                  </button>
                </li>
                
                <li>
                  <a
                    href="/profile"
                    className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <User className="h-5 w-5" />
                    <span>Profil</span>
                  </a>
                </li>
                
                <li>
                  <a
                    href="/kyc"
                    className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <Shield className="h-5 w-5" />
                    <span>Vérification KYC</span>
                  </a>
                </li>
              </ul>
            </nav>
          </div>
          
          <div className="mt-6 bg-blue-50 rounded-xl p-4 border border-blue-100">
            <div className="flex items-center space-x-3 mb-2">
              <Smartphone className="h-5 w-5 text-blue-600" />
              <h3 className="text-sm font-medium text-blue-900">Application mobile</h3>
            </div>
            <p className="text-sm text-blue-800 mb-3">
              Téléchargez notre application mobile pour une expérience optimisée
            </p>
            <div className="flex space-x-2">
              <a
                href="https://play.google.com/store/apps/details?id=com.linkmarket"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs bg-blue-600 text-white px-2 py-1 rounded"
              >
                Android
              </a>
              <a
                href="https://apps.apple.com/app/idXXXXXXXX"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs bg-blue-600 text-white px-2 py-1 rounded"
              >
                iOS
              </a>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden p-6">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
}