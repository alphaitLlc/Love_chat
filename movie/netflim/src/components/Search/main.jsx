export const Search = ({ 
  value = '', 
  onChange, 
  disabled = false,
  placeholder = 'Search movies...'
}) => {
  return (
    <div className="w-full max-w-2xl mx-auto mb-8 relative">
      <input
        className={`w-full px-4 py-3 rounded-lg border-2 
                  focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200
                  transition-all duration-200 shadow-sm
                  text-gray-800 placeholder-gray-400
                  ${
                    disabled 
                      ? 'bg-gray-200 cursor-not-allowed border-gray-200' 
                      : 'bg-white border-gray-300 hover:border-gray-400'
                  }`}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        type="search"
        disabled={disabled}
        aria-disabled={disabled}
        aria-label="Search movies"
      />
      
      {disabled && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-50 rounded-lg">
          <svg 
            className="animate-spin h-5 w-5 text-gray-500" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      )}
    </div>
  )
}