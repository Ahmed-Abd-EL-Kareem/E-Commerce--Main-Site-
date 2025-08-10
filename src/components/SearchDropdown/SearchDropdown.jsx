import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSearch } from '../../context/SearchContext';
import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast';

const SearchDropdown = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { 
    searchQuery, 
    searchResults, 
    isSearching, 
    searchHistory, 
    removeFromHistory, 
    getPopularSearches,
    setSearchQuery 
  } = useSearch();
  const { addToCart } = useCart();



  const handleResultClick = (result) => {
    if (result.type === 'product') {
      navigate(`/product/${result.id}`);
    } else if (result.type === 'category') {
      navigate(`/category/${result.title.toLowerCase()}`);
    } else if (result.type === 'guide') {
      navigate(`/guides/${result.id}`);
    }
    onClose();
  };

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    const cartProduct = {
      id: product.id,
      name: product.title,
      price: `$${product.price}`,
      image: product.thumbnail,
      category: product.category,
      brand: product.brand
    };
    addToCart(cartProduct);
    toast.success(`${product.title} added to cart!`, {
      icon: '🛒',
      style: {
        background: '#10b981',
        color: '#ffffff',
      },
    });
  };

  const handleHistoryClick = (query) => {
    setSearchQuery(query);
  };

  const handlePopularSearchClick = (query) => {
    setSearchQuery(query);
  };

  if (!isOpen) return null;

  return (
    <div className="absolute top-full left-0 right-0 z-[9999] rounded-xl shadow-[0_20px_40px_rgba(0,0,0,0.15)] backdrop-blur-md mt-2 max-h-[500px] overflow-y-auto animate-in slide-in-from-top-2 duration-200"
      style={{
        background: 'var(--card-bg)',
        border: '1px solid var(--card-border)'
      }}
    >
      <div className="p-4">
        {/* Search Results */}
        {searchQuery && (
          <div className="mb-6 last:mb-0">
            <div className="flex items-center justify-between mb-3 pb-2 border-b"
              style={{ borderColor: 'var(--card-border)' }}
            >
              <h4 className="text-sm font-semibold uppercase tracking-wide"
                style={{ color: 'var(--secondary-text)' }}
              >
                Search Results
              </h4>
              {isSearching && (
                <div className="w-4 h-4 border-2 rounded-full animate-spin"
                  style={{
                    borderColor: 'var(--secondary-text)',
                    borderTopColor: 'var(--accent-text, #2563eb)'
                  }}
                />
              )}
            </div>
            
            {searchResults.length > 0 ? (
              <div className="space-y-2">
                {searchResults.slice(0, 8).map((result) => (
                  <div 
                    key={result.id} 
                    className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
                    style={{
                      background: 'var(--primary-bg)',
                      border: '1px solid transparent'
                    }}
                    onClick={() => handleResultClick(result)}
                  >
                    <div className="relative w-12 h-12 flex-shrink-0">
                      <img 
                        src={result.thumbnail || '/images/placeholder.png'} 
                        alt={result.title}
                        className="w-full h-full object-cover rounded-lg"
                        style={{ border: '1px solid var(--card-border)' }}
                        onError={(e) => {
                          e.target.src = '/images/placeholder.png';
                        }}
                      />
                      <span className="absolute -top-1 -right-1 text-white text-xs font-semibold px-1 py-0.5 rounded uppercase"
                        style={{ background: 'var(--accent-text, #2563eb)' }}
                      >
                        {result.type}
                      </span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h5 className="text-sm font-semibold mb-1 line-clamp-1"
                        style={{ color: 'var(--primary-text)' }}
                      >
                        {result.title}
                      </h5>
                      <p className="text-xs mb-2 line-clamp-2"
                        style={{ color: 'var(--secondary-text)' }}
                      >
                        {result.description}
                      </p>
                      {result.type === 'product' && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold"
                            style={{ color: 'var(--accent-text, #2563eb)' }}
                          >
                            ${result.price}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded"
                            style={{
                              background: 'var(--primary-bg)',
                              color: 'var(--secondary-text)'
                            }}
                          >
                            {result.category}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {result.type === 'product' && (
                      <button 
                        className="w-8 h-8 rounded-lg transition-all duration-200 flex items-center justify-center flex-shrink-0 hover:scale-110"
                        style={{
                          background: 'var(--accent-bg, rgba(37, 99, 235, 0.1))',
                          color: 'var(--accent-text, #2563eb)'
                        }}
                        onClick={(e) => handleAddToCart(e, result)}
                        title="Add to cart"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M9 22C9.55228 22 10 21.5523 10 21C10 20.4477 9.55228 20 9 20C8.44772 20 8 20.4477 8 21C8 21.5523 8.44772 22 9 22Z"/>
                          <path d="M20 22C20.5523 22 21 21.5523 21 21C21 20.4477 20.5523 20 20 20C19.4477 20 19 20.4477 19 21C19 21.5523 19.4477 22 20 22Z"/>
                          <path d="M1 1H5L7.68 14.39C7.77144 14.8504 8.02191 15.264 8.38755 15.5583C8.75318 15.8526 9.2107 16.009 9.68 16H19.4C19.8693 16.009 20.3268 15.8526 20.6925 15.5583C21.0581 15.264 21.3086 14.8504 21.4 14.39L23 6H6"/>
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
                
                {searchResults.length > 8 && (
                  <div className="text-center pt-3 border-t"
                    style={{ borderColor: 'var(--card-border)' }}
                  >
                    <button 
                      className="border px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 hover:-translate-y-0.5"
                      style={{
                        borderColor: 'var(--card-border)',
                        color: 'var(--primary-text)'
                      }}
                      onClick={() => {
                        navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
                        onClose();
                      }}
                    >
                      View all {searchResults.length} results
                    </button>
                  </div>
                )}
              </div>
            ) : !isSearching && (
              <div className="text-center py-8"
                style={{ color: 'var(--secondary-text)' }}
              >
                <p className="text-sm">No results found for "{searchQuery}"</p>
              </div>
            )}
          </div>
        )}

        {/* Search History */}
        {!searchQuery && searchHistory.length > 0 && (
          <div className="mb-6 last:mb-0">
            <div className="flex items-center justify-between mb-3 pb-2 border-b"
              style={{ borderColor: 'var(--card-border)' }}
            >
              <h4 className="text-sm font-semibold uppercase tracking-wide"
                style={{ color: 'var(--secondary-text)' }}
              >
                Recent Searches
              </h4>
              <button 
                className="text-xs transition-colors"
                style={{ color: 'var(--secondary-text)' }}
                onClick={() => removeFromHistory()}
              >
                Clear
              </button>
            </div>
            <div className="space-y-1">
              {searchHistory.slice(0, 5).map((query, index) => (
                <div 
                  key={index} 
                  className="flex items-center gap-3 p-2 rounded-md cursor-pointer transition-all duration-200 group hover:-translate-y-0.5"
                  style={{ background: 'var(--primary-bg)' }}
                  onClick={() => handleHistoryClick(query)}
                >
                  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    style={{ color: 'var(--secondary-text)' }}
                  >
                    <circle cx="11" cy="11" r="8"/>
                    <path d="M21 21L16.65 16.65"/>
                  </svg>
                  <span className="text-sm flex-1"
                    style={{ color: 'var(--primary-text)' }}
                  >{query}</span>
                  <button 
                    className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-all duration-200 flex-shrink-0"
                    style={{ color: 'var(--secondary-text)' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromHistory(query);
                    }}
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Popular Searches */}
        {!searchQuery && (
          <div className="mb-6 last:mb-0">
            <div className="flex items-center justify-between mb-3 pb-2 border-b"
              style={{ borderColor: 'var(--card-border)' }}
            >
              <h4 className="text-sm font-semibold uppercase tracking-wide"
                style={{ color: 'var(--secondary-text)' }}
              >
                Popular Searches
              </h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {getPopularSearches().map((query, index) => (
                <button 
                  key={index}
                  className="px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200 hover:-translate-y-0.5"
                  style={{
                    background: 'var(--primary-bg)',
                    color: 'var(--primary-text)'
                  }}
                  onClick={() => handlePopularSearchClick(query)}
                >
                  {query}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchDropdown; 