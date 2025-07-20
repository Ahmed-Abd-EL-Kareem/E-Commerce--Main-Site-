import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useSearch } from '../../context/SearchContext';
import { useFavorites } from '../../context/FavoritesContext';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import ProductCard from '../../components/ProductCard/ProductCard';
import toast from 'react-hot-toast';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToCart, isInCart, getItemQuantity } = useCart();
  const { searchQuery, setSearchQuery, searchResults, isSearching } = useSearch();
  const { addToFavorites, isInFavorites, removeFromFavorites } = useFavorites();
  const { isAuthenticated } = useAuth();
  const { t, i18n } = useTranslation();
  const language = i18n.language === "ar" ? "ar" : "en";
  // Remove products, loading, and fetch logic for search
  const [sortBy, setSortBy] = useState('relevance');
  const [filterBy, setFilterBy] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // grid or list

  // Listen for view mode changes from SecondNavbar
  useEffect(() => {
    const handleViewModeChange = (event) => {
      setViewMode(event.detail.viewMode);
    };

    window.addEventListener('viewModeChanged', handleViewModeChange);
    return () => {
      window.removeEventListener('viewModeChanged', handleViewModeChange);
    };
  }, []);

  // On mount, set searchQuery from URL if present
  useEffect(() => {
    const q = searchParams.get('q') || '';
    if (q && q !== searchQuery) setSearchQuery(q);
  }, [searchParams, setSearchQuery, searchQuery]);

  // Optionally, fetch categories for filter (keep this logic)
  useEffect(() => {
    fetch('https://dummyjson.com/products/category-list')
      .then(res => res.json())
      .then(data => setCategories(data));
  }, []);

  // Filtering and sorting logic on searchResults
  const getFilteredAndSortedProducts = () => {
    let filtered = searchResults.filter(r => r.type === 'product');

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Filter by price range
    filtered = filtered.filter(product => 
      product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    // Sort products
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'name':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default: // relevance - keep original order
        break;
    }

    return filtered;
  };

  const filteredProducts = getFilteredAndSortedProducts();

  // Transform dummy API data to match our ProductCard format
  const transformProduct = (product) => {
    return {
      _id: product.id,
      name: {
        en: product.title,
        ar: product.title
      },
      brand: {
        name: {
          en: product.brand,
          ar: product.brand
        }
      },
      category: {
        name: {
          en: product.category,
          ar: product.category
        }
      },
      basePrice: product.price,
      price: product.price,
      priceAfterDiscount: product.price,
      images: [{
        url: product.thumbnail,
        altText: {
          en: product.title,
          ar: product.title
        }
      }],
      averageRating: product.rating,
      description: product.description,
      variants: [{
        options: [{
          price: product.price,
          priceAfterDiscount: product.price,
          variantImages: [{
            url: product.thumbnail,
            altText: {
              en: product.title,
              ar: product.title
            }
          }]
        }]
      }]
    };
  };

  if (isSearching) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-16"
        style={{ background: 'var(--page-bg)' }}
      >
        <div className="w-12 h-12 border-4 rounded-full animate-spin mb-6"
          style={{
            borderColor: 'var(--accent-bg, rgba(37, 99, 235, 0.1))',
            borderTopColor: 'var(--accent-text, #2563eb)'
          }}
        />
        <p className="text-lg"
          style={{ color: 'var(--secondary-text)' }}
        >Searching for products...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen"
      style={{ background: 'var(--page-bg)' }}
    >
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="rounded-2xl shadow-lg border p-6 mb-8"
          style={{
            background: 'var(--card-bg)',
            borderColor: 'var(--card-border)'
          }}
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--primary-text)' }}>
                Search Results
              </h1>
              <p className="text-lg" style={{ color: 'var(--secondary-text)' }}>
                Found {filteredProducts.length} results for "{searchQuery}"
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              {/* View Mode Toggle */}
              <div className="flex items-center gap-2">
                <button 
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
                  }`}
                  onClick={() => setViewMode('grid')}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                  </svg>
                </button>
                <button 
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
                  }`}
                  onClick={() => setViewMode('list')}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2">
                <label htmlFor="sort" className="text-sm font-medium" style={{ color: 'var(--primary-text)' }}>
                  Sort by:
                </label>
                <select 
                  id="sort" 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                  style={{
                    background: 'var(--input-bg)',
                    borderColor: 'var(--card-border)',
                    color: 'var(--primary-text)'
                  }}
                >
                  <option value="relevance">Relevance</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Rating</option>
                  <option value="name">Name (A-Z)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl shadow-lg border p-6 sticky top-8 z-20 flex flex-col gap-8"
              style={{
                background: 'var(--card-bg)',
                borderColor: 'var(--card-border)',
                minWidth: '220px',
                maxHeight: 'calc(100vh - 64px)',
                overflowY: 'auto'
              }}
            >
              {/* Category Filter */}
              <div className="mb-6">
                <h4 className="text-sm font-medium mb-3 flex items-center gap-2" style={{ color: 'var(--primary-text)' }}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
                  Category
                </h4>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                  style={{
                    background: 'var(--input-bg)',
                    borderColor: 'var(--card-border)',
                    color: 'var(--primary-text)'
                  }}
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              {/* Price Range Filter */}
              <div className="mb-6">
                <h4 className="text-sm font-medium mb-3 flex items-center gap-2" style={{ color: 'var(--primary-text)' }}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 10c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"/></svg>
                  Price Range
                </h4>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceRange[0]}
                    min={0}
                    max={priceRange[1]}
                    onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                    className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                    style={{
                      background: 'var(--input-bg)',
                      borderColor: 'var(--card-border)',
                      color: 'var(--primary-text)'
                    }}
                    aria-label="Minimum Price"
                  />
                  <span style={{ color: 'var(--secondary-text)' }}>-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceRange[1]}
                    min={priceRange[0]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 1000])}
                    className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                    style={{
                      background: 'var(--input-bg)',
                      borderColor: 'var(--card-border)',
                      color: 'var(--primary-text)'
                    }}
                    aria-label="Maximum Price"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                  style={{ background: 'var(--accent-bg, rgba(37, 99, 235, 0.1))' }}
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    style={{ color: 'var(--accent-text, #2563eb)' }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--primary-text)' }}>
                  No results found
                </h3>
                <p className="text-lg" style={{ color: 'var(--secondary-text)' }}>
                  Try adjusting your search terms or filters
                </p>
              </div>
            ) : (
              <div className={`${
                viewMode === 'list' 
                  ? 'space-y-6' // List view: vertical stack with more spacing
                  : 'grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5' // Enhanced grid view with better responsive breakpoints
              }`}>
                {filteredProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    product={transformProduct(product)}
                    language={language}
                    t={t}
                    navigate={navigate}
                    viewMode={viewMode}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResults; 