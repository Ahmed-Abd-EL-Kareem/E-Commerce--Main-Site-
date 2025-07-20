import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useCart } from '../../context/CartContext';
import { useFavorites } from '../../context/FavoritesContext';
import { useAuth } from '../../context/AuthContext';

const BestsellersSection = ({ products, loading }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { addToCart, isInCart, getItemQuantity } = useCart();
  const { addToFavorites, isInFavorites, removeFromFavorites } = useFavorites();
  const { isAuthenticated } = useAuth();

  // Debug logging
  console.log('BestsellersSection Debug:', {
    productsCount: products?.length || 0,
    products: products,
    loading
  });

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
    toast.success(t('cart.addedToCart', { product: product.title }), {
      icon: '🛒',
      style: {
        background: '#10b981',
        color: '#ffffff',
      },
    });
  };

  const handleProductClick = (product) => {
    navigate(`/product/${product.id}`);
  };

  const handleToggleFavorite = (e, product) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Please login to add items to favorites');
      return;
    }

    const favoriteProduct = {
      id: product.id,
      name: product.title,
      price: `$${product.price}`,
      image: product.thumbnail,
      category: product.category,
      brand: product.brand,
      description: product.description
    };

    if (isInFavorites(product.id)) {
      removeFromFavorites(product.id, product.title);
      toast.success('Removed from favorites');
    } else {
      addToFavorites(favoriteProduct);
      toast.success('Added to favorites');
    }
  };

  const handleShopMoreClick = () => {
    navigate('/products');
  };

  // Calculate discount percentage
  const getDiscountPercentage = (product) => {
    if (product.discountPercentage) return product.discountPercentage;
    if (product.originalPrice && product.price) {
      return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
    }
    return 0;
  };

  return (
    <section className="py-8 px-4 md:py-6 md:px-6 lg:py-8 lg:px-8 xl:py-12 xl:px-12 w-full box-border overflow-x-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 dark:from-slate-900 dark:via-blue-900 dark:to-blue-950 text-white">
      <div className="w-full max-w-[1400px] mx-auto p-0 box-border overflow-x-hidden">
        {loading ? (
          <div className="text-center text-lg py-12" style={{ color: 'var(--primary-text)' }}>{t('common.loading')}</div>
        ) : products && products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-6 md:gap-6 xl:gap-8 w-full box-border overflow-x-hidden">
            {/* Intro Card */}
            <div style={{ background: 'var(--primary-bg)', color: 'var(--primary-text)' }} className="relative flex flex-col justify-center rounded-2xl shadow-[0_8px_32px_rgba(37,99,235,0.15)] p-8 md:p-8 lg:p-10 xl:p-12 mb-4 md:mb-0 overflow-hidden col-span-1 md:col-span-2 lg:col-span-3">
              {/* Decorative circle */}
              <div 
                className="absolute top-0 right-0 w-48 h-48 rounded-full transform translate-x-1/2 -translate-y-1/2 pointer-events-none"
                style={{
                  background: 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%)'
                }}
              />
              <span className="font-semibold text-sm mb-2 uppercase tracking-wider bg-white/15 px-4 py-2 rounded-full w-fit backdrop-blur-sm" style={{ color: 'var(--primary-text)' }}>
                {t('bestsellers.subtitle')}
              </span>
              <h2 className="text-3xl md:text-2xl lg:text-3xl xl:text-4xl mb-4 font-bold leading-tight" style={{ color: 'var(--primary-text)', textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)' }}>
                {t('bestsellers.title')}
              </h2>
              <p className="text-base md:text-base lg:text-lg xl:text-lg leading-relaxed mb-6 max-w-[70%]" style={{ color: 'var(--primary-text)' }}>
                {t('bestsellers.description')}
              </p>
              <button
                onClick={handleShopMoreClick}
                className="bg-white/90 hover:bg-white text-blue-700 font-semibold px-8 py-4 rounded-full text-base uppercase tracking-wide shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 w-fit mt-2"
              >
                {t('bestsellers.shopMore')}
              </button>
            </div>
            {/* Product Cards */}
            {products.map((product, index) => {
              const discountPercentage = getDiscountPercentage(product);
              return (
                <div
                  style={{ background: 'var(--primary-bg)', color: 'var(--primary-text)' }}
                  className="relative flex flex-col justify-between p-6 md:p-5 lg:p-5 xl:p-6 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 transition-all duration-300 h-full cursor-pointer hover:shadow-[0_8px_32px_rgba(37,99,235,0.15)] hover:-translate-y-1 hover:border-blue-400 col-span-1"
                  key={product.id || index}
                  onClick={() => handleProductClick(product)}
                >
                  {discountPercentage > 0 && (
                    <span className="absolute top-4 left-4 z-10 bg-gradient-to-br from-blue-600 to-blue-400 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-[0_2px_8px_rgba(37,99,235,0.3)]">
                      -{discountPercentage}%
                    </span>
                  )}
                  {/* Favorite Button */}
                  <button
                    onClick={(e) => handleToggleFavorite(e, product)}
                    className="absolute top-4 right-4 z-10 w-8 h-8 bg-white/90 hover:bg-white text-red-500 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill={isInFavorites(product.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                  </button>
                  <div className="relative pt-[100%] lg:pt-[90%] xl:pt-[85%] mb-4 rounded-xl overflow-hidden" style={{ background: 'var(--primary-bg)' }}>
                    <img
                      src={product.thumbnail}
                      alt={product.title}
                      className="absolute top-0 left-0 w-full h-full object-contain p-4 transition-transform duration-300 hover:scale-105"
                      onError={(e) => {
                        e.target.src = '/placeholder-image.jpg';
                      }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-xs mb-2" style={{ color: 'var(--primary-text)' }}>
                    <span>{t('bestsellers.stockBrand')}</span>
                    <span className="font-semibold text-blue-500 uppercase tracking-wide text-sm">{product.brand || product.category}</span>
                  </div>
                  <h3 className="text-base lg:text-base xl:text-lg font-semibold mb-2 leading-tight line-clamp-2 min-h-[2.8em]" style={{ color: 'var(--primary-text)' }}>
                    {product.title}
                  </h3>
                  <div className="flex items-center gap-3 mb-4 flex-wrap">
                    <span className="font-bold text-lg md:text-lg lg:text-xl text-blue-600 dark:text-blue-400">
                      {t('common.currency')}{product.price}
                    </span>
                    {discountPercentage > 0 && (
                      <span className="text-base text-slate-400 line-through">
                        {t('common.currency')}{product.originalPrice}
                      </span>
                    )}
                  </div>
                  <button
                    className={`flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl w-full min-h-[44px] uppercase tracking-wide transition-all duration-300 mt-auto shadow-[0_2px_8px_rgba(37,99,235,0.2)] bg-gradient-to-br from-blue-600 to-blue-400 hover:from-blue-900 hover:to-blue-600 text-white hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(37,99,235,0.3)]`}
                    onClick={(e) => handleAddToCart(e, product)}
                  >
                    {isInCart(product.id) ? `${t('cart.inCart')} (${getItemQuantity(product.id)})` : t('cart.addToCart')}
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-lg mb-4" style={{ color: 'var(--primary-text)' }}>
              {t('common.noProducts') || 'No products available'}
            </div>
            <button
              onClick={handleShopMoreClick}
              className="bg-white/90 hover:bg-white text-blue-700 font-semibold px-8 py-4 rounded-full text-base uppercase tracking-wide shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
            >
              {t('bestsellers.shopMore')}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default BestsellersSection;