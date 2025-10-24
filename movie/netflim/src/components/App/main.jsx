import { useEffect, useState } from 'react';
import { List } from '../List/main';
import { Search } from '../Search/main';
import Heading from '../Header/main';
import MovieDetailsView from '../../Show/main';
import { movieList } from '../../data/movies';

import Navigation from '../Navigation/main';
import './App.css';

function App() {
  const [movies, setMovies] = useState(movieList);
  const [favorites, setFavorites] = useState([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const getMovie = async (movieTitle) => {
    setIsLoading(true);
    setError(null); 
    try {
      const API_KEY = 'aeb2b829';
      const API_URL = `http://www.omdbapi.com/?s=${encodeURIComponent(movieTitle)}&apikey=${API_KEY}`;
      
      const response = await fetch(API_URL);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP! statut: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.Response === 'False') {
        throw new Error(data.Error || 'Aucun résultat trouvé');
      }
      
      if (data.Search) {
        setMovies(data.Search);
      }
    } catch (error) {
      console.error("Erreur de recherche:", error);
      setError(error.message);
      setMovies([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Effet pour la recherche
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search.trim()) {
        getMovie(search);
      } else {
        setMovies([]);
      }
    }, 500); // Délai de 500ms pour le debounce

    return () => clearTimeout(timer);
  }, [search]);

  // Effet pour les favoris
  useEffect(() => {
    try {
      const storedFavorites = localStorage.getItem('favorites');
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
    } catch (error) {
      console.error('Erreur de lecture du localStorage:', error);
    }
  }, []);

  const saveToLocalStorage = (items) => {
    try {
      localStorage.setItem('favorites', JSON.stringify(items));
    } catch (error) {
      console.error('Erreur de sauvegarde:', error);
    }
  };

  const addFavoriteMovie = (movie) => {
    if (!movie || favorites.some(fav => fav.imdbID === movie.imdbID)) return;
    
    const updatedFavorites = [...favorites, movie];
    setFavorites(updatedFavorites);
    saveToLocalStorage(updatedFavorites);
    console.log(updatedFavorites)
  };

  const removeFavoriteMovie = (movieId) => {
    const updatedFavorites = favorites.filter(movie => movie.imdbID !== movieId);
    setFavorites(updatedFavorites);
    saveToLocalStorage(updatedFavorites);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Heading   favorites={favorites}>NetFlim</Heading>
      {/* <Navigation/> */}
      <main className="container mx-auto px-4 pb-12">
        <div className="mb-8 md:mb-12">
          <Search 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            disabled={isLoading}
          />
        </div>
<div 
  className="
    bg-gray-800 
    rounded-lg 
    p-4 md:p-6 
    shadow-xl 
    hover:shadow-2xl 
    transition-all 
    duration-300
    border border-gray-700
    overflow-hidden
  "
>


</div>
        {isLoading && (
          <div className="text-center py-8">Chargement en cours...</div>
        )}

        {error && (
          <div className="bg-red-800 text-white p-4 rounded mb-6">
            {error}
          </div>
        )}

        <div className="bg-gray-800 rounded-lg p-4 md:p-6 shadow-xl">
          <List 
            movies={movies} 
            onAddFavorite={addFavoriteMovie}
            onRemoveFavorite={removeFavoriteMovie}
            favorites={favorites}
          />
          <MovieDetailsView/>
        </div>
      </main>
    </div>
  );
}

export default App;



