import React, { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface DiscordLayoutProps {
  children: ReactNode;
  sidebarContent?: ReactNode;
  channelListContent?: ReactNode;
}

const DiscordLayout: React.FC<DiscordLayoutProps> = ({ 
  children, 
  sidebarContent,
  channelListContent 
}) => {
  const { user } = useAuth();
  const location = useLocation();

  return (
    <div className="flex h-screen bg-discord-dark text-discord-lighter overflow-hidden">
      {/* Barre latérale des serveurs */}
      <div className="discord-sidebar bg-discord-darker">
        <div className="w-12 h-12 rounded-full bg-discord-accent flex items-center justify-center text-white font-bold text-xl">
          LM
        </div>
        
        <div className="w-12 h-0.5 bg-discord-darkest my-2"></div>
        
        {sidebarContent || (
          <>
            <Link 
              to="/" 
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors duration-200 ${
                location.pathname === '/' ? 'bg-discord-accent text-white' : 'bg-discord-dark text-discord-light hover:bg-discord-accent hover:text-white'
              }`}
              title="Accueil"
            >
              <i className="fas fa-home text-xl"></i>
            </Link>
            
            <Link 
              to="/marketplace" 
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors duration-200 ${
                location.pathname.startsWith('/marketplace') ? 'bg-discord-accent text-white' : 'bg-discord-dark text-discord-light hover:bg-discord-accent hover:text-white'
              }`}
              title="Marketplace"
            >
              <i className="fas fa-store text-xl"></i>
            </Link>
            
            <Link 
              to="/messages" 
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors duration-200 ${
                location.pathname.startsWith('/messages') ? 'bg-discord-accent text-white' : 'bg-discord-dark text-discord-light hover:bg-discord-accent hover:text-white'
              }`}
              title="Messages"
            >
              <i className="fas fa-comment-alt text-xl"></i>
            </Link>
            
            <div className="w-12 h-0.5 bg-discord-darkest my-2"></div>
            
            <Link 
              to="/profile" 
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors duration-200 ${
                location.pathname.startsWith('/profile') ? 'bg-discord-accent' : 'bg-discord-dark hover:bg-discord-accent'
              }`}
              title="Profil"
            >
              <img 
                src={user?.avatar || '/default-avatar.png'} 
                alt="Profil" 
                className="w-10 h-10 rounded-full object-cover"
              />
            </Link>
          </>
        )}
      </div>
      
      {/* Liste des canaux ou catégories */}
      {channelListContent && (
        <div className="discord-channel-list">
          {channelListContent}
        </div>
      )}
      
      {/* Contenu principal */}
      <main className="flex-1 flex flex-col overflow-hidden bg-discord-dark">
        {children}
      </main>
    </div>
  );
};

export default DiscordLayout;
