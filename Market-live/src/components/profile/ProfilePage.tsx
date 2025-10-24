import React, { useState, useEffect } from 'react';
import { User, Edit, Save, Camera, Shield, Star, Award, MapPin, Mail, Phone, Building, Calendar, CreditCard, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { paymentService, kycService } from '../../services/api';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, updateProfile, isLoading: authLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    company: '',
    phone: '',
    bio: '',
    address: {
      street: '',
      city: '',
      zipCode: '',
      country: ''
    }
  });
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [kycStatus, setKycStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        company: user.company || '',
        phone: user.phone || '',
        bio: user.bio || '',
        address: user.address || {
          street: '',
          city: '',
          zipCode: '',
          country: 'France'
        }
      });
      
      fetchPaymentMethods();
      fetchKYCStatus();
    }
  }, [user]);

  const fetchPaymentMethods = async () => {
    try {
      const response = await paymentService.getPaymentMethods();
      setPaymentMethods(response.paymentMethods || []);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
    }
  };

  const fetchKYCStatus = async () => {
    try {
      const response = await kycService.getKYCStatus();
      setKycStatus(response.status);
    } catch (error) {
      console.error('Error fetching KYC status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateProfile(formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const getKYCStatusBadge = () => {
    switch (kycStatus) {
      case 'verified':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <Shield className="h-3 w-3 mr-1" />
          Vérifié
        </span>;
      case 'in_progress':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          En cours de vérification
        </span>;
      case 'rejected':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Rejeté
        </span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          Non vérifié
        </span>;
    }
  };

  if (isLoading || authLoading || !user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Mon Profil</h1>
        <p className="text-gray-600">Gérez vos informations personnelles et vos préférences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Profile Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 h-32 relative">
              <div className="absolute -bottom-16 left-6">
                <div className="h-32 w-32 rounded-full bg-white p-1 shadow-lg">
                  <div className="h-full w-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white text-4xl font-bold">
                    {user.firstName[0]}{user.lastName[0]}
                  </div>
                  <button className="absolute bottom-1 right-1 bg-blue-600 text-white p-1.5 rounded-full hover:bg-blue-700 transition-colors">
                    <Camera className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="pt-20 pb-6 px-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {user.firstName} {user.lastName}
              </h2>
              
              <div className="flex items-center space-x-2 mt-1 mb-4">
                <span className="text-gray-600 capitalize">{user.role}</span>
                {getKYCStatusBadge()}
              </div>
              
              {user.company && (
                <div className="flex items-center text-gray-700 mb-2">
                  <Building className="h-4 w-4 mr-2 text-gray-500" />
                  <span>{user.company}</span>
                </div>
              )}
              
              <div className="flex items-center text-gray-700 mb-2">
                <Mail className="h-4 w-4 mr-2 text-gray-500" />
                <span>{user.email}</span>
              </div>
              
              {user.phone && (
                <div className="flex items-center text-gray-700 mb-2">
                  <Phone className="h-4 w-4 mr-2 text-gray-500" />
                  <span>{user.phone}</span>
                </div>
              )}
              
              {user.address?.city && (
                <div className="flex items-center text-gray-700 mb-2">
                  <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                  <span>{user.address.city}, {user.address.country}</span>
                </div>
              )}
              
              <div className="flex items-center text-gray-700 mb-4">
                <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                <span>Membre depuis {new Date(user.joinedAt).toLocaleDateString()}</span>
              </div>
              
              {/* Ratings */}
              {user.rating > 0 && (
                <div className="mb-4">
                  <div className="flex items-center mb-1">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(user.rating) 
                              ? 'text-yellow-400 fill-current' 
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-gray-600">
                      {user.rating.toFixed(1)} ({user.reviewCount} avis)
                    </span>
                  </div>
                </div>
              )}
              
              {/* Badges */}
              {user.badges && user.badges.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Badges</h3>
                  <div className="flex flex-wrap gap-2">
                    {user.badges.map((badge, index) => (
                      <div key={index} className="flex items-center space-x-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs">
                        <Award className="h-3 w-3" />
                        <span>{badge}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Subscription */}
              {user.subscription && user.subscription !== 'free' && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Abonnement</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 capitalize">
                      {user.subscription}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Payment Methods */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden mt-6">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Moyens de paiement</h3>
                <a href="/settings/payment" className="text-sm text-blue-600 hover:text-blue-800">
                  Gérer
                </a>
              </div>
            </div>
            
            <div className="p-6">
              {paymentMethods.length > 0 ? (
                <div className="space-y-4">
                  {paymentMethods.map((method: any) => (
                    <div key={method.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center text-xl">
                          {method.icon}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{method.displayName}</p>
                          <p className="text-sm text-gray-500">
                            {method.isDefault && <span className="text-green-600">Par défaut</span>}
                          </p>
                        </div>
                      </div>
                      {method.isExpired && (
                        <span className="text-xs text-red-600">Expiré</span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <CreditCard className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 text-sm">Aucun moyen de paiement</p>
                  <a 
                    href="/settings/payment" 
                    className="mt-2 inline-block text-sm text-blue-600 hover:text-blue-800"
                  >
                    Ajouter un moyen de paiement
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Profile Details */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Informations personnelles</h3>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
                >
                  {isEditing ? (
                    <>
                      <User className="h-4 w-4" />
                      <span>Annuler</span>
                    </>
                  ) : (
                    <>
                      <Edit className="h-4 w-4" />
                      <span>Modifier</span>
                    </>
                  )}
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {isEditing ? (
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                        Prénom
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                        Nom
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                        Entreprise
                      </label>
                      <input
                        type="text"
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                        Téléphone
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                      Biographie
                    </label>
                    <textarea
                      id="bio"
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <h4 className="text-md font-medium text-gray-900 mb-4">Adresse</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="md:col-span-2">
                      <label htmlFor="address.street" className="block text-sm font-medium text-gray-700 mb-1">
                        Rue
                      </label>
                      <input
                        type="text"
                        id="address.street"
                        name="address.street"
                        value={formData.address.street}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="address.city" className="block text-sm font-medium text-gray-700 mb-1">
                        Ville
                      </label>
                      <input
                        type="text"
                        id="address.city"
                        name="address.city"
                        value={formData.address.city}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="address.zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                        Code postal
                      </label>
                      <input
                        type="text"
                        id="address.zipCode"
                        name="address.zipCode"
                        value={formData.address.zipCode}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="address.country" className="block text-sm font-medium text-gray-700 mb-1">
                        Pays
                      </label>
                      <input
                        type="text"
                        id="address.country"
                        name="address.country"
                        value={formData.address.country}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={authLoading}
                      className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {authLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Enregistrement...</span>
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          <span>Enregistrer</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Prénom</h4>
                      <p className="mt-1">{user.firstName}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Nom</h4>
                      <p className="mt-1">{user.lastName}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Email</h4>
                      <p className="mt-1">{user.email}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Téléphone</h4>
                      <p className="mt-1">{user.phone || '-'}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Entreprise</h4>
                      <p className="mt-1">{user.company || '-'}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Rôle</h4>
                      <p className="mt-1 capitalize">{user.role}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Biographie</h4>
                    <p className="mt-1">{user.bio || 'Aucune biographie'}</p>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200">
                    <h4 className="text-md font-medium text-gray-900 mb-4">Adresse</h4>
                    
                    {user.address ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                          <h4 className="text-sm font-medium text-gray-500">Rue</h4>
                          <p className="mt-1">{user.address.street || '-'}</p>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Ville</h4>
                          <p className="mt-1">{user.address.city || '-'}</p>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Code postal</h4>
                          <p className="mt-1">{user.address.zipCode || '-'}</p>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Pays</h4>
                          <p className="mt-1">{user.address.country || '-'}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500">Aucune adresse renseignée</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* KYC Status */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden mt-6">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Vérification d'identité (KYC)</h3>
                <a href="/kyc" className="text-sm text-blue-600 hover:text-blue-800">
                  Gérer
                </a>
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                    kycStatus === 'verified' ? 'bg-green-100' :
                    kycStatus === 'rejected' ? 'bg-red-100' :
                    kycStatus === 'in_progress' ? 'bg-blue-100' :
                    'bg-yellow-100'
                  }`}>
                    <Shield className="h-5 w-5" />
                  </div>
                  
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-base font-medium text-gray-900">
                        Statut de vérification
                      </h3>
                      {getKYCStatusBadge()}
                    </div>
                    
                    <p className="text-sm text-gray-600 mt-1">
                      {kycStatus === 'verified' && 'Votre compte est entièrement vérifié.'}
                      {kycStatus === 'in_progress' && 'Votre vérification est en cours d\'examen.'}
                      {kycStatus === 'rejected' && 'Votre vérification a été rejetée. Veuillez soumettre à nouveau vos documents.'}
                      {(kycStatus === 'pending' || !kycStatus) && 'Veuillez compléter votre vérification d\'identité.'}
                    </p>
                  </div>
                </div>
                
                {kycStatus !== 'verified' && (
                  <a
                    href="/kyc"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    {kycStatus === 'rejected' ? 'Soumettre à nouveau' : 'Compléter la vérification'}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}