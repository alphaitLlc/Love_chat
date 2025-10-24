import Movie from "../Movie/main";
import { useState, useEffect } from 'react';
import Hero from '../Hero/main';

// Composant Skeleton pour le chargement
const MovieSkeleton = () => (
  <div className="animate-pulse bg-gray-800 rounded-lg overflow-hidden">
    <div className="pb-[150%] relative bg-gray-700"></div>
    <div className="p-3">
      <div className="h-4 bg-gray-700 rounded mb-2 w-3/4"></div>
      <div className="flex justify-between">
        <div className="h-3 bg-gray-700 rounded w-1/4"></div>
        <div className="h-3 bg-gray-700 rounded w-1/4"></div>
      </div>
    </div>
  </div>
);

export const List = ({ movies, isLoading = false, error = null, onAddFavorite, removeFavorite }) => {
  const [localMovies, setLocalMovies] = useState([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    if (movies?.results) {
      setLocalMovies(movies.results);
      setIsInitialLoad(false);
    }
  }, [movies]);

  if (error) {
    return (
      <div className="text-center py-12 text-red-500">
        <p>Erreur de chargement : {error.message}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors"
        >
          Réessayer
        </button>
      </div>
    );
  }

  if ((isLoading || isInitialLoad) && localMovies.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 p-4">
        {[...Array(10)].map((_, i) => <MovieSkeleton key={`skeleton-${i}`} />)}
      </div>
    );
  }

  if (!localMovies.length && !isLoading) {
    return (
      <div className="text-center py-12 text-gray-400">
        Aucun film trouvé. Essayez une autre recherche.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero pour le premier film */}
      {localMovies.length > 0 && (
        <Hero movie={localMovies[0]} />
      )}
      
      {/* Grille des films */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 p-4">
        {localMovies.map((movie) => (
          <Movie
            key={movie.id || movie.imdbID || `movie-${Math.random().toString(36).substr(2, 9)}`}
            movie={movie}
            onAddFavorite={onAddFavorite}
            removeFavorite={removeFavorite}
          />
        ))}
      </div>
    </div>
  );
};