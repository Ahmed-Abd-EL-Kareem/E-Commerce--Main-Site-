import axiosInstance from './axiosInstance';

export const updateProfile = async (profileData) => {
  const token = localStorage.getItem("token"); // or get from context
  if (!token) {
    console.error("No token found");
    return;
  }
  try {
    const response = await axiosInstance.put(
      '/auth/update-profile',
      profileData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// API utility functions for product fetching

const API_BASE_URL = 'http://127.0.0.1:3000/api';

// Generic fetch function with error handling
const fetchAPI = async (endpoint, options = {}) => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data || data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Fetch all products
export const fetchAllProducts = async () => {
  try {
    console.log('Fetching all products...');
    const result = await fetchAPI('/product');
    console.log('All products result:', result);
    return result;
  } catch (error) {
    console.error('Error fetching all products:', error);
    return [];
  }
};

// Fetch products by category
export const fetchProductsByCategory = async (categorySlug) => {
  const encodedCategory = encodeURIComponent(categorySlug);
  return await fetchAPI(`/product?categorySlug=${encodedCategory}`);
};

// Fetch featured products (high ratings)
export const fetchFeaturedProducts = async () => {
  return await fetchAPI('/product?averageRating[gte]=4');
};

// Fetch bestseller products (very high ratings)
export const fetchBestsellerProducts = async () => {
  try {
    console.log('Fetching bestseller products...');
    // Try different rating thresholds
    const queries = [
      '/product?averageRating[gte]=4.5',
      '/product?averageRating[gte]=4.0',
      '/product?averageRating[gte]=3.5',
      '/product?limit=10&sort=rating',
      '/product?limit=10'
    ];
    
    for (const query of queries) {
      try {
        const result = await fetchAPI(query);
        console.log(`Bestseller products result (${query}):`, result);
        if (result && result.length > 0) {
          return result;
        }
      } catch (error) {
        console.log(`Failed to fetch from ${query}:`, error.message);
        continue;
      }
    }
    
    // If all queries fail, return empty array
    console.warn('All bestseller queries failed, returning empty array');
    return [];
  } catch (error) {
    console.error('Error fetching bestseller products:', error);
    return [];
  }
};

// Fetch products with filters
export const fetchProductsWithFilters = async (filters = {}) => {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value);
    }
  });

  const queryString = params.toString();
  const endpoint = queryString ? `/product?${queryString}` : '/product';
  
  return await fetchAPI(endpoint);
};

// Fetch brands
export const fetchBrands = async () => {
  const response = await fetchAPI('/brand');
  return response.brands || response;
};

// Fetch categories
export const fetchCategories = async () => {
  try {
    console.log('Fetching categories...');
    // Try different possible endpoints
    const endpoints = [
      '/categories',
      '/category', 
      '/categories/all',
      '/category/all'
    ];
    
    for (const endpoint of endpoints) {
      try {
        const result = await fetchAPI(endpoint);
        console.log('Categories result:', result);
        return result;
      } catch (error) {
        console.log(`Failed to fetch from ${endpoint}:`, error.message);
        continue;
      }
    }
    
    // If all endpoints fail, return empty array
    console.warn('All category endpoints failed, returning empty array');
    return [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
};

// Transform API product data to component format
export const transformProduct = (product) => {
  return {
    id: product._id || product.id,
    title: product.name?.en || product.name?.ar || product.name || 'Product',
    price: product.bestPriceAfterDiscount || product.basePrice || product.price || 0,
    originalPrice: product.basePrice || product.price || 0,
    thumbnail: product.images?.[0]?.url || product.thumbnail || '/placeholder-image.jpg',
    brand: product.brand?.name?.en || product.brand?.name?.ar || product.brand?.name || 'Brand',
    category: product.category?.name?.en || product.category?.name?.ar || product.category?.name || 'Category',
    description: product.details?.en || product.details?.ar || product.shortDescription?.en || product.shortDescription?.ar || product.description || '',
    rating: product.averageRating || 0,
    reviews: product.numOfReviews || 0,
    discountPercentage: product.discount || product.discountPercentage || 0,
    stock: product.totalStock || product.stock || 0,
    // Add any other fields needed by components
  };
};

// Transform multiple products
export const transformProducts = (products) => {
  return products.map(transformProduct);
};
