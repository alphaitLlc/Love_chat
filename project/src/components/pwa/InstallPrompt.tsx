import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface InstallPromptProps {
  onDismiss?: () => void;
}

declare global {
  interface WindowEventMap {
    'beforeinstallprompt': BeforeInstallPromptEvent;
  }
}

export default function InstallPrompt({ onDismiss }: InstallPromptProps) {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  
  useEffect(() => {
    // Vérifier si l'application est déjà installée
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                         (window.navigator as any).standalone || 
                         document.referrer.includes('android-app://');
    
    if (isStandalone) {
      return; // Ne pas afficher le prompt si déjà installé
    }
    
    // Stocker l'événement beforeinstallprompt pour une utilisation ultérieure
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setInstallPrompt(e);
      
      // Vérifier si l'utilisateur a déjà fermé le prompt
      const hasClosedPrompt = localStorage.getItem('pwaPromptClosed');
      const lastPromptDate = localStorage.getItem('pwaPromptDate');
      
      // N'afficher le prompt que si l'utilisateur ne l'a pas fermé
      // ou si cela fait plus de 7 jours depuis la dernière fois
      if (!hasClosedPrompt || 
          (lastPromptDate && new Date().getTime() - new Date(lastPromptDate).getTime() > 7 * 24 * 60 * 60 * 1000)) {
        // Attendre 5 secondes avant d'afficher le prompt
        setTimeout(() => {
          setShowPrompt(true);
        }, 5000);
      }
    };
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);
  
  const handleInstall = async () => {
    if (!installPrompt) return;
    
    // Afficher le prompt d'installation natif
    await installPrompt.prompt();
    
    // Attendre la décision de l'utilisateur
    const { outcome } = await installPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('Utilisateur a accepté l\'installation');
    } else {
      console.log('Utilisateur a refusé l\'installation');
    }
    
    // Réinitialiser le prompt
    setInstallPrompt(null);
    setShowPrompt(false);
  };
  
  const handleClose = () => {
    setShowPrompt(false);
    
    // Enregistrer que l'utilisateur a fermé le prompt
    localStorage.setItem('pwaPromptClosed', 'true');
    localStorage.setItem('pwaPromptDate', new Date().toISOString());
    
    // Appeler le callback onDismiss si fourni
    if (onDismiss) onDismiss();
  };
  
  if (!showPrompt) return null;
  
  return (
    <div className="pwa-install-prompt">
      <div className="flex items-center space-x-4">
        <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
          <Download className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h3 className="font-medium text-gray-900">Installer l'application</h3>
          <p className="text-sm text-gray-600">Accédez à LinkMarket Pro directement depuis votre écran d'accueil</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <button
          onClick={handleInstall}
          className="pwa-install-button"
        >
          <Download className="h-4 w-4" />
          <span>Installer</span>
        </button>
        
        <button
          onClick={handleClose}
          className="p-2 text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}