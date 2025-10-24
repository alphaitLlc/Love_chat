import { StarIcon, FilmIcon, XMarkIcon } from '@heroicons/react/24/solid';
import React, { useState } from 'react';

const Hero = ({ movie }) => {
  // Vérification initiale pour éviter l'erreur
  if (!movie) {
    return (
      <div className="bg-gray-800 h-64 flex items-center justify-center">
        <p className="text-white">Chargement du film...</p>
      </div>
    );
  }

  const [showTrailer, setShowTrailer] = useState(false);
  
  // Déstructuration avec valeurs par défaut
  const { 
    title = "Titre inconnu",
    backdrop_path = "",
    poster_path = "",
    vote_average = 0,
    runtime = 0,
    release_date = new Date().toISOString(),
    overview = "Description non disponible",
    videos = { results: [] }
  } = movie;

  return (
    <div className="relative">
      {/* Bannière Hero */}
      <div 
        className="h-64 md:h-96 bg-cover bg-center flex items-end"
        style={{ 
          backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.8) 10%, transparent 100%), 
                          url(https://image.tmdb.org/t/p/original${backdrop_path})` 
        }}
      >
        <div className="container mx-auto px-4 pb-8 flex gap-6">
          {/* Poster avec fallback */}
          {poster_path && (
            <img 
              src={`https://image.tmdb.org/t/p/w300${poster_path}`}
              alt={title}
              className="hidden md:block w-40 h-56 object-cover rounded-lg shadow-xl"
            />
          )}
          
          <div className="text-white max-w-2xl">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{title}</h1>
            
            <div className="flex items-center gap-4 mb-3 text-sm">
              <span className="flex items-center">
                <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
                {vote_average.toFixed(1)}
              </span>
              <span>{Math.floor(runtime / 60)}h {runtime % 60}m</span>
              <span>{new Date(release_date).getFullYear()}</span>
            </div>
            
            <p className="text-sm md:text-base line-clamp-3 mb-4">
              {overview}
            </p>
            
            {videos.results.length > 0 && (
              <button 
                onClick={() => setShowTrailer(true)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded flex items-center text-sm"
              >
                <FilmIcon className="h-4 w-4 mr-2" />
                Bande-annonce
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modal trailer */}
      {showTrailer && videos.results[0]?.key && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl">
            <button 
              className="absolute -top-10 right-0 text-white"
              onClick={() => setShowTrailer(false)}
            >
              <XMarkIcon className="h-8 w-8" />
            </button>
            <div className="aspect-w-16 aspect-h-9">
              <iframe
                src={`https://www.youtube.com/embed/${videos.results[0].key}?autoplay=1`}
                className="w-full h-full"
                allowFullScreen
                title="Bande-annonce"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Hero;