import { useState } from 'react';
import { StarIcon, ClockIcon, } from '@heroicons/react/24/outline';
import { DynamicIcon } from 'lucide-react/dynamic';
import { GrFavorite } from "react-icons/gr";



const Movie = ({ movie, onAddFavorite, removeFavorite }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setFavorites] = useState(false)


  return (
    <div 
      className="relative bg-gray-900 rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl hover:transform hover:scale-105"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Poster Image with Hover Effect */}
      <div className="relative pb-[150%]"> {/* Maintain 2:3 aspect ratio */}
        <img
          src={movie.poster_path 
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : '/placeholder-movie.jpg'}
          alt={movie.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        {/* Hover Overlay */}
        {isHovered && (
          <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col justify-between p-4">
            <div>
              <h3 className="text-xl font-bold line-clamp-2">{movie.title}</h3>
              <p className="text-sm text-gray-300 mt-1">
                {new Date(movie.release_date).toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center">
                <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
                <span className="text-sm">
                  {movie.vote_average.toFixed(1)} ({movie.vote_count.toLocaleString()} votes)
                </span>
              </div>
              
              <div className="flex flex-wrap gap-1">
                {movie.genre_ids.map(genreId => (
                  <span 
                    key={genreId} 
                    className="text-xs bg-gray-700 px-2 py-1 rounded-full"
                  >
                    {getGenreName(genreId)}
                  </span>
                ))}
              </div>
              
              <p className="text-sm line-clamp-3">{movie.overview}</p>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
  <button 
    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-md text-sm font-medium transition-colors"
  >
    Détails
  </button>
  
  <button
    className={`p-2 rounded-md hover:bg-gray-100 transition-colors ${isFavorite ? "text-red-500" : "text-gray-400"}`}
    onClick={() => onAddFavorite(movie)}
    aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
  >
    <GrFavorite size={18} />
  </button>
</div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Info (Visible when not hovered) */}
      {!isHovered && (
        <div className="p-3">
          <h3 className="font-semibold truncate">{movie.title}</h3>
          <div className="flex justify-between items-center mt-1 text-sm text-gray-400">
            <span>
              {new Date(movie.release_date).getFullYear()}
            </span>
            
            <div className="flex items-center">
              <StarIcon className="h-3 w-3 text-yellow-400 mr-1" />
              <span>{movie.vote_average.toFixed(1)}</span>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to convert genre IDs to names
const getGenreName = (genreId) => {
  const genres = {
    28: 'Action',
    12: 'Adventure',
    16: 'Animation',
    35: 'Comedy',
    80: 'Crime',
    99: 'Documentary',
    18: 'Drama',
    10751: 'Family',
    14: 'Fantasy',
    36: 'History',
    27: 'Horror',
    10402: 'Music',
    9648: 'Mystery',
    10749: 'Romance',
    878: 'Sci-Fi',
    10770: 'TV Movie',
    53: 'Thriller',
    10752: 'War',
    37: 'Western'
  };
  return genres[genreId] || 'Unknown';
};

export default Movie;