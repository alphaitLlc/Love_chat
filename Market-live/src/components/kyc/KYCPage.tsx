import React, { useState, useEffect } from 'react';
import { Shield, Upload, Check, AlertCircle, FileText, Camera, Home, Building, FileCheck, CreditCard, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { kycService } from '../../services/api';
import toast from 'react-hot-toast';

interface KYCDocument {
  id: number;
  type: string;
  status: 'pending' | 'approved' | 'rejected';
  uploadedAt: string;
  verifiedAt?: string;
  rejectionReason?: string;
}

interface KYCStatus {
  status: 'pending' | 'in_progress' | 'verified' | 'rejected';
  documents: KYCDocument[];
  requiredDocuments: string[];
  canSubmit: boolean;
}

interface DocumentTypeInfo {
  name: string;
  description: string;
  formats: string;
  maxSize: string;
}

export default function KYCPage() {
  const { user } = useAuth();
  const [kycStatus, setKycStatus] = useState<KYCStatus | null>(null);
  const [documentTypes, setDocumentTypes] = useState<Record<string, DocumentTypeInfo>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadType, setUploadType] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchKYCStatus();
    fetchKYCRequirements();
  }, []);

  const fetchKYCStatus = async () => {
    setIsLoading(true);
    try {
      const response = await kycService.getKYCStatus();
      setKycStatus(response);
    } catch (error) {
      console.error('Error fetching KYC status:', error);
      toast.error('Erreur lors du chargement du statut KYC');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchKYCRequirements = async () => {
    try {
      const response = await kycService.getKYCRequirements();
      setDocumentTypes(response.documentTypes);
    } catch (error) {
      console.error('Error fetching KYC requirements:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async (type: string) => {
    if (!selectedFile) {
      toast.error('Veuillez sélectionner un fichier');
      return;
    }

    setIsUploading(true);
    try {
      await kycService.uploadDocument(type, selectedFile);
      toast.success('Document téléchargé avec succès');
      setSelectedFile(null);
      setUploadType('');
      fetchKYCStatus(); // Refresh status
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Erreur lors du téléchargement du document');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmitKYC = async () => {
    setIsSubmitting(true);
    try {
      await kycService.submitKYC();
      toast.success('Vérification KYC soumise avec succès');
      fetchKYCStatus(); // Refresh status
    } catch (error) {
      console.error('Error submitting KYC:', error);
      toast.error('Erreur lors de la soumission de la vérification KYC');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'identity_card':
        return <FileText className="h-6 w-6" />;
      case 'selfie':
        return <Camera className="h-6 w-6" />;
      case 'proof_of_address':
        return <Home className="h-6 w-6" />;
      case 'business_registration':
        return <Building className="h-6 w-6" />;
      case 'tax_certificate':
        return <FileCheck className="h-6 w-6" />;
      case 'bank_statement':
        return <CreditCard className="h-6 w-6" />;
      default:
        return <FileText className="h-6 w-6" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          En attente
        </span>;
      case 'approved':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Approuvé
        </span>;
      case 'rejected':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Rejeté
        </span>;
      case 'in_progress':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          En cours
        </span>;
      case 'verified':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Vérifié
        </span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          {status}
        </span>;
    }
  };

  if (isLoading) {
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
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Vérification d'identité (KYC)
            </h1>
            <p className="text-gray-600">
              Complétez votre vérification d'identité pour accéder à toutes les fonctionnalités
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            {getStatusBadge(kycStatus?.status || 'pending')}
          </div>
        </div>
      </div>

      {/* Status Card */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-100">
        <div className="flex items-center space-x-4">
          <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Shield className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Statut de vérification</h2>
            <p className="text-gray-600">
              {kycStatus?.status === 'verified' && 'Votre compte est entièrement vérifié.'}
              {kycStatus?.status === 'in_progress' && 'Votre vérification est en cours d\'examen.'}
              {kycStatus?.status === 'rejected' && 'Votre vérification a été rejetée. Veuillez soumettre à nouveau vos documents.'}
              {(kycStatus?.status === 'pending' || !kycStatus?.status) && 'Veuillez soumettre les documents requis pour la vérification.'}
            </p>
          </div>
        </div>
      </div>

      {/* Documents Section */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden mb-8">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Documents requis</h2>
          <p className="text-gray-600 mt-1">
            Veuillez télécharger les documents suivants pour compléter votre vérification
          </p>
        </div>

        <div className="divide-y divide-gray-200">
          {kycStatus?.requiredDocuments.map((docType) => {
            const document = kycStatus.documents.find(d => d.type === docType);
            const docInfo = documentTypes[docType];
            
            return (
              <div key={docType} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                      document?.status === 'approved' ? 'bg-green-100' :
                      document?.status === 'rejected' ? 'bg-red-100' :
                      document ? 'bg-yellow-100' : 'bg-gray-100'
                    }`}>
                      {getDocumentIcon(docType)}
                    </div>
                    
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-base font-medium text-gray-900">
                          {docInfo?.name || docType}
                        </h3>
                        {document && getStatusBadge(document.status)}
                      </div>
                      
                      <p className="text-sm text-gray-600 mt-1">
                        {docInfo?.description || 'Document requis pour la vérification'}
                      </p>
                      
                      {document?.status === 'rejected' && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-100 rounded-md">
                          <p className="text-sm text-red-700 flex items-start">
                            <AlertCircle className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                            <span>Raison du rejet : {document.rejectionReason}</span>
                          </p>
                        </div>
                      )}
                      
                      {document && (
                        <p className="text-xs text-gray-500 mt-2">
                          Téléchargé le {new Date(document.uploadedAt).toLocaleDateString()}
                          {document.verifiedAt && ` • Vérifié le ${new Date(document.verifiedAt).toLocaleDateString()}`}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    {document?.status === 'approved' ? (
                      <div className="flex items-center text-green-600">
                        <Check className="h-5 w-5 mr-1" />
                        <span className="text-sm font-medium">Approuvé</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => setUploadType(docType)}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        <Upload className="h-4 w-4" />
                        <span>{document ? 'Remplacer' : 'Télécharger'}</span>
                      </button>
                    )}
                  </div>
                </div>
                
                {/* File Upload Form */}
                {uploadType === docType && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Sélectionner un fichier
                      </label>
                      <input
                        type="file"
                        onChange={handleFileChange}
                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Formats acceptés : {docInfo?.formats || 'JPG, PNG, PDF'} • Taille max : {docInfo?.maxSize || '5MB'}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleUpload(docType)}
                        disabled={!selectedFile || isUploading}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Téléchargement...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4" />
                            <span>Télécharger</span>
                          </>
                        )}
                      </button>
                      
                      <button
                        onClick={() => {
                          setUploadType('');
                          setSelectedFile(null);
                        }}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Submit Button */}
      {kycStatus?.canSubmit && (
        <div className="flex justify-center">
          <button
            onClick={handleSubmitKYC}
            disabled={isSubmitting}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Soumission en cours...</span>
              </>
            ) : (
              <>
                <Check className="h-5 w-5" />
                <span>Soumettre pour vérification</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* KYC Information */}
      <div className="mt-8 bg-blue-50 rounded-xl p-6 border border-blue-100">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">Pourquoi avons-nous besoin de ces informations ?</h3>
        <div className="space-y-4">
          <p className="text-blue-800">
            La vérification d'identité (KYC - Know Your Customer) est une exigence légale pour les plateformes financières et de commerce. Elle nous permet de :
          </p>
          <ul className="list-disc pl-5 text-blue-800 space-y-2">
            <li>Prévenir la fraude et protéger votre compte</li>
            <li>Assurer la sécurité des transactions sur notre plateforme</li>
            <li>Respecter les réglementations en vigueur</li>
            <li>Établir un environnement de confiance entre tous les utilisateurs</li>
          </ul>
          <p className="text-blue-800">
            Vos documents sont traités de manière sécurisée et confidentielle, conformément à notre politique de confidentialité.
          </p>
        </div>
      </div>
    </div>
  );
}