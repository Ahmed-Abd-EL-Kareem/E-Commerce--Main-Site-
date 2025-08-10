import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const FavoritesContext = createContext();

// Favorites reducer to handle all favorites actions
const favoritesReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_FAVORITES': {
      const existingItem = state.items.find(item => item.id === action.payload.id);
      
      if (existingItem) {
        return state; // Already in favorites
      }
      
      return {
        ...state,
        items: [...state.items, action.payload]
      };
    }
    
    case 'REMOVE_FROM_FAVORITES':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload)
      };
    
    case 'CLEAR_FAVORITES':
      return {
        ...state,
        items: []
      };
    
    case 'LOAD_FAVORITES':
      return {
        ...state,
        items: action.payload || []
      };
    
    default:
      return state;
  }
};

// Initial favorites state
const initialState = {
  items: []
};

export const FavoritesProvider = ({ children }) => {
  const [state, dispatch] = useReducer(favoritesReducer, initialState);
  const { user, isAuthenticated } = useAuth();

  // Load favorites from localStorage on mount
  useEffect(() => {
    if (isAuthenticated && user) {
      const savedFavorites = localStorage.getItem(`alamia-favorites-${user.id}`);
      if (savedFavorites) {
        try {
          const parsedFavorites = JSON.parse(savedFavorites);
          console.log('Loading favorites from localStorage:', parsedFavorites);
          dispatch({ type: 'LOAD_FAVORITES', payload: parsedFavorites });
        } catch (error) {
          console.error('Error loading favorites from localStorage:', error);
        }
      }
    }
  }, [isAuthenticated, user]);

  // Save favorites to localStorage whenever it changes
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('Saving favorites to localStorage:', state.items);
      localStorage.setItem(`alamia-favorites-${user.id}`, JSON.stringify(state.items));
    }
  }, [state.items, isAuthenticated, user]);

  // Favorites actions
  const addToFavorites = (product) => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to favorites');
      return false;
    }

    dispatch({ type: 'ADD_TO_FAVORITES', payload: product });
    toast.success(`${product.name} added to favorites`, {
      icon: '❤️',
    });
    return true;
  };

  const removeFromFavorites = (productId, productName) => {
    dispatch({ type: 'REMOVE_FROM_FAVORITES', payload: productId });
    toast.success(`${productName} removed from favorites`, {
      icon: '💔',
    });
  };

  const clearFavorites = () => {
    dispatch({ type: 'CLEAR_FAVORITES' });
    toast.success('Favorites cleared successfully', {
      icon: '🧹',
    });
  };

  // Favorites calculations
  const getFavoritesCount = () => {
    return state.items.length;
  };

  const isInFavorites = (productId) => {
    return state.items.some(item => item.id === productId);
  };

  const getFavoritesItems = () => {
    return state.items;
  };

  const value = {
    items: state.items,
    addToFavorites,
    removeFromFavorites,
    clearFavorites,
    getFavoritesCount,
    isInFavorites,
    getFavoritesItems
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}; 