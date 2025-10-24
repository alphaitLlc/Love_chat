import { useState } from 'react';
import { StarIcon, ClockIcon, LanguageIcon, CalendarIcon, FilmIcon } from '@heroicons/react/24/solid';
import { movieDetails } from '../data/details';
const MovieDetailsView = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const [selectedTrailer, setSelectedTrailer] = useState(null);

  const openTrailer = (trailerKey) => {
    setSelectedTrailer(trailerKey);
    setIsTrailerOpen(true);
  };

  return (
    <div className="bg-gray-900 text-gray-100 min-h-screen">
      {/* Hero Section */}
      <div 
        className="relative h-96 md:h-screen/2 bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(17,24,39,1)), url(https://image.tmdb.org/t/p/original${movieDetails.backdrop_path})`
        }}
      >
        <div className="container mx-auto px-4 h-full flex flex-col justify-end pb-12">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-2">{movieDetails.title}</h1>
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <span className="flex items-center">
                <StarIcon className="h-5 w-5 text-yellow-400 mr-1" />
                {movieDetails.vote_average.toFixed(1)} ({movieDetails.vote_count} votes)
              </span>
              <span className="flex items-center">
                <ClockIcon className="h-5 w-5 text-red-500 mr-1" />
                {Math.floor(movieDetails.runtime / 60)}h {movieDetails.runtime % 60}m
              </span>
              <span className="flex items-center">
                <CalendarIcon className="h-5 w-5 text-blue-400 mr-1" />
                {new Date(movieDetails.release_date).toLocaleDateString('fr-FR')}
              </span>
              <span className="bg-green-600 text-xs px-2 py-1 rounded">
                {movieDetails.status}
              </span>
            </div>
            <button 
              onClick={() => openTrailer(movieDetails.videos.results[0].key)}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg flex items-center transition-colors"
            >
              <FilmIcon className="h-5 w-5 mr-2" />
              Voir la bande-annonce
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Column */}
          <div className="md:w-1/3 lg:w-1/4">
            <img 
              src={`https://image.tmdb.org/t/p/w500${movieDetails.poster_path}`} 
              alt={movieDetails.title}
              className="w-full rounded-lg shadow-xl mb-6"
            />
            
            <div className="bg-gray-800 rounded-lg p-4 mb-6">
              <h3 className="text-xl font-semibold mb-4">Facts</h3>
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm text-gray-400">Titre original</h4>
                  <p>{movieDetails.original_title}</p>
                </div>
                <div>
                  <h4 className="text-sm text-gray-400">Budget</h4>
                  <p>${movieDetails.budget.toLocaleString()}</p>
                </div>
                <div>
                  <h4 className="text-sm text-gray-400">Recettes</h4>
                  <p>${movieDetails.revenue.toLocaleString()}</p>
                </div>
                <div>
                  <h4 className="text-sm text-gray-400">Langues</h4>
                  <div className="flex flex-wrap gap-1">
                    {movieDetails.spoken_languages.map(lang => (
                      <span key={lang.iso_639_1} className="bg-gray-700 px-2 py-1 rounded text-sm">
                        {lang.english_name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-xl font-semibold mb-4">Production</h3>
              <div className="space-y-4">
                {movieDetails.production_companies.map(company => (
                  <div key={company.id} className="flex items-center">
                    {company.logo_path ? (
                      <img 
                        src={`https://image.tmdb.org/t/p/w200${company.logo_path}`} 
                        alt={company.name}
                        className="h-8 mr-3"
                      />
                    ) : (
                      <div className="h-8 w-8 bg-gray-700 rounded-full mr-3"></div>
                    )}
                    <span>{company.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="md:w-2/3 lg:w-3/4">
            {/* Tabs */}
            <div className="flex border-b border-gray-700 mb-6">
              <button
                className={`px-4 py-2 font-medium ${activeTab === 'overview' ? 'text-red-500 border-b-2 border-red-500' : 'text-gray-400'}`}
                onClick={() => setActiveTab('overview')}
              >
                Synopsis
              </button>
              <button
                className={`px-4 py-2 font-medium ${activeTab === 'trailers' ? 'text-red-500 border-b-2 border-red-500' : 'text-gray-400'}`}
                onClick={() => setActiveTab('trailers')}
              >
                Bande-annonces ({movieDetails.videos.results.length})
              </button>
              <button
                className={`px-4 py-2 font-medium ${activeTab === 'collection' ? 'text-red-500 border-b-2 border-red-500' : 'text-gray-400'}`}
                onClick={() => setActiveTab('collection')}
              >
                Saga
              </button>
            </div>

            {/* Tab Content */}
            <div className="mb-8">
              {activeTab === 'overview' && (
                <div>
                  <h2 className="text-2xl font-bold mb-4">{movieDetails.tagline}</h2>
                  <p className="text-lg leading-relaxed">{movieDetails.overview}</p>
                  
                  <div className="mt-6">
                    <h3 className="text-xl font-semibold mb-3">Genres</h3>
                    <div className="flex flex-wrap gap-2">
                      {movieDetails.genres.map(genre => (
                        <span key={genre.id} className="bg-gray-800 px-3 py-1 rounded-full">
                          {genre.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'trailers' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {movieDetails.videos.results.map(video => (
                    <div key={video.id} className="bg-gray-800 rounded-lg overflow-hidden">
                      <div 
                        className="relative pb-[56.25%] cursor-pointer"
                        onClick={() => openTrailer(video.key)}
                      >
                        <img 
                          src={`https://img.youtube.com/vi/${video.key}/hqdefault.jpg`}
                          alt={video.name}
                          className="absolute h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 hover:bg-opacity-10 transition-all">
                          <div className="bg-red-600 rounded-full p-3">
                            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <h4 className="font-medium">{video.name}</h4>
                        <p className="text-sm text-gray-400">{video.type} • {new Date(video.published_at).toLocaleDateString('fr-FR')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'collection' && movieDetails.belongs_to_collection && (
                <div className="bg-gray-800 rounded-lg overflow-hidden">
                  <div className="relative pb-[40%]">
                    <img 
                      src={`https://image.tmdb.org/t/p/original${movieDetails.belongs_to_collection.backdrop_path}`}
                      alt={movieDetails.belongs_to_collection.name}
                      className="absolute h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent flex items-end p-6">
                      <div>
                        <h2 className="text-3xl font-bold">{movieDetails.belongs_to_collection.name}</h2>
                        <button className="mt-2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-sm transition-colors">
                          Voir toute la saga
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Trailer Modal */}
      {isTrailerOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl">
            <button 
              onClick={() => setIsTrailerOpen(false)}
              className="absolute -top-10 right-0 text-white hover:text-red-500 transition-colors"
            >
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="aspect-w-16 aspect-h-9">
              <iframe 
                src={`https://www.youtube.com/embed/${selectedTrailer}?autoplay=1`}
                className="w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieDetailsView;