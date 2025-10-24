import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
// import { 
//   HomeIcon,
//   FilmIcon,
//   TvIcon,
//   SearchIcon,
//   UserIcon,
//   BookmarkIcon,
//   MenuIcon,
//   XIcon 
// } from '@heroicons/react/outline';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  // Gestion du scroll pour l'effet de navbar réduite
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fermeture du menu mobile quand la route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const navItems = [
    { name: 'Accueil', path: '/', icon: HomeIcon },
    { name: 'Films', path: '/movies', icon: FilmIcon },
    { name: 'Séries', path: '/tv-shows', icon: TvIcon },
    { name: 'Recherche', path: '/search', icon: SearchIcon },
    { name: 'Ma liste', path: '/watchlist', icon: BookmarkIcon },
    { name: 'Profil', path: '/profile', icon: UserIcon },
  ];

  return (
    <>
      {/* Version desktop */}
      <nav className={`hidden md:block fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-gray-900 py-2 shadow-lg' : 'bg-transparent py-4'}`}>
        <div className="container mx-auto px-6 flex justify-between items-center">
          <Link to="/" className="flex items-center">
            <span className="text-red-600 font-bold text-2xl">StreamApp</span>
          </Link>

          <div className="flex space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center px-1 py-2 text-sm font-medium transition-colors ${
                  location.pathname === item.path
                    ? 'text-white border-b-2 border-red-600'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                <item.icon className="h-5 w-5 mr-2" />
                {item.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            <button className="text-gray-300 hover:text-white">
              <SearchIcon className="h-5 w-5" />
            </button>
            <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
              <UserIcon className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>
      </nav>

      {/* Version mobile */}
      <div className="md:hidden fixed bottom-0 w-full z-50 bg-gray-900 border-t border-gray-800">
        <div className="flex justify-around py-3">
          {navItems.slice(0, 4).map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`flex flex-col items-center p-1 text-xs ${
                location.pathname === item.path
                  ? 'text-red-600'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <item.icon className="h-6 w-6" />
              <span className="mt-1">{item.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Menu mobile complet (overlay) */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-gray-900 bg-opacity-95">
          <div className="flex justify-end p-4">
            <button onClick={() => setIsOpen(false)} className="text-white p-2">
              <XIcon className="h-6 w-6" />
            </button>
          </div>
          <div className="flex flex-col items-center mt-10 space-y-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`text-xl font-medium ${
                  location.pathname === item.path
                    ? 'text-red-600'
                    : 'text-white'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Bouton burger pour mobile */}
      <button 
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed top-4 right-4 z-40 bg-gray-800 p-2 rounded-full text-white"
      >
        <MenuIcon className="h-6 w-6" />
      </button>

      {/* Padding pour éviter que le contenu soit caché sous la navbar */}
      <div className="pb-16 md:pb-0"></div>
    </>
  );
};

export default Navigation;