import React, { createContext, useContext, useState, useEffect } from 'react';

const SearchContext = createContext();

export const SearchProvider = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);

  // Load search history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('alamia-search-history');
    if (savedHistory) {
      try {
        setSearchHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('Error loading search history:', error);
      }
    }
  }, []);

  // Save search history to localStorage
  useEffect(() => {
    localStorage.setItem('alamia-search-history', JSON.stringify(searchHistory));
  }, [searchHistory]);

  // Fetch all products for search
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('https://dummyjson.com/products?limit=100');
        const data = await response.json();
        setAllProducts(data.products);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);

  // Search function
  const performSearch = (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    const lowercaseQuery = query.toLowerCase();

    // Search through products
    const productResults = allProducts.filter(product => 
      product.title.toLowerCase().includes(lowercaseQuery) ||
      product.description.toLowerCase().includes(lowercaseQuery) ||
      product.category.toLowerCase().includes(lowercaseQuery) ||
      product.brand?.toLowerCase().includes(lowercaseQuery) ||
      product.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );

    // Add categories and other searchable content
    const categories = [
      'Headphones', 'Phones', 'Speakers', 'Smart Watches', 'Gaming', 'Laptops'
    ];

    const categoryResults = categories
      .filter(category => category.toLowerCase().includes(lowercaseQuery))
      .map(category => ({
        id: `category-${category}`,
        title: category,
        type: 'category',
        description: `Browse ${category} products`,
        thumbnail: `/images/cat-${category.toLowerCase().replace(' ', '-')}.png`
      }));

    // Add guides/pages
    const guides = [
      { title: 'How to Choose Headphones', type: 'guide', description: 'Complete guide to selecting the perfect headphones' },
      { title: 'Gaming Setup Guide', type: 'guide', description: 'Build the ultimate gaming setup' },
      { title: 'Smart Home Integration', type: 'guide', description: 'Connect your devices seamlessly' }
    ];

    const guideResults = guides
      .filter(guide => 
        guide.title.toLowerCase().includes(lowercaseQuery) ||
        guide.description.toLowerCase().includes(lowercaseQuery)
      )
      .map((guide, index) => ({
        id: `guide-${index}`,
        ...guide,
        thumbnail: '/images/guide-placeholder.png'
      }));

    const allResults = [
      ...productResults.map(product => ({ ...product, type: 'product' })),
      ...categoryResults,
      ...guideResults
    ];

    setSearchResults(allResults);
    setIsSearching(false);

    // Add to search history if not empty and not already in history
    if (query.trim() && !searchHistory.includes(query.trim())) {
      setSearchHistory(prev => [query.trim(), ...prev.slice(0, 9)]); // Keep last 10 searches
    }
  };

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery) {
        performSearch(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, allProducts]);

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  const clearSearchHistory = () => {
    setSearchHistory([]);
  };

  const removeFromHistory = (query) => {
    setSearchHistory(prev => prev.filter(item => item !== query));
  };

  const getPopularSearches = () => {
    return ['iPhone', 'Gaming Headphones', 'Wireless Speakers', 'Smart Watch', 'Laptop'];
  };

  const addToHistory = (query) => {
    if (query.trim() && !searchHistory.includes(query.trim())) {
      setSearchHistory(prev => [query.trim(), ...prev.slice(0, 9)]); // Keep last 10 searches
    }
  };

  const value = {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    performSearch,
    clearSearch,
    searchHistory,
    clearSearchHistory,
    removeFromHistory,
    getPopularSearches,
    addToHistory,
    allProducts
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
}; 