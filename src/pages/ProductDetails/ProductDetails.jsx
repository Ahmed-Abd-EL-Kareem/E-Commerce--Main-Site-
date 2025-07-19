import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useFavorites } from '../../context/FavoritesContext';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

// Renders star icons based on rating (out of 5)
function renderStars(rating) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <svg
        key={i}
        className="w-5 h-5"
        fill={i <= Math.round(rating) ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
        style={{ color: i <= Math.round(rating) ? "#facc15" : "#d1d5db" }} // gold or gray
      >
        <polygon
          points="12,2 15,9 22,9 17,14 18,21 12,17 6,21 7,14 2,9 9,9"
        />
      </svg>
    );
  }
  return <div className="flex">{stars}</div>;
}



const ProductDetails = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language === "ar" ? "ar" : "en";
  const { productId } = useParams();
  const navigate = useNavigate();
  // لم نعد بحاجة لاستخدام useCart هنا

  const { addToCart, isInCart, getItemQuantity } = useCart();
  const { addToFavorites, isInFavorites, removeFromFavorites } = useFavorites();
  const { isAuthenticated } = useAuth();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [addToCartSuccess, setAddToCartSuccess] = useState(false);



  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(`https://dummyjson.com/products/${productId}`);
        const data = await response.json();
        setProduct(data);
        // Fetch related products from the same category
        const relatedResponse = await fetch(`https://dummyjson.com/products/category/${data.category}`);
        const relatedData = await relatedResponse.json();
        let relatedList = relatedData.data || relatedData.products || [];
        relatedList = relatedList
          .filter((p) => (p._id || p.id) !== productId)
          .slice(0, 4);
        setRelatedProducts(relatedList);

        if (prod.variants && prod.variants.length > 0) {
          setSelectedOption(prod.variants[0]?.options[0] || null);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        toast.error(t("errors.general"));
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId, t]);

  // دالة إضافة للسلة (API)
  const handleAddToCartAPI = async () => {
    try {
      const res = await fetch("http://127.0.0.1:3000/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: { $oid: USER_ID },
          items: [
            {
              product: product._id || product.id,
              sku: currentOption?.sku || product.sku || "",
              quantity: quantity,
            },
          ],
          notes: {
            en: "Fast delivery please",
            ar: "يرجى التوصيل بسرعة",
          },
        }),
      });
      if (!res.ok) throw new Error("فشل الإضافة للسلة");
      setAddToCartSuccess(true);
      alert(
        lang === "ar" ? "تمت الإضافة للسلة بنجاح" : "Added to cart successfully"
      );
    } catch {
      setAddToCartSuccess(false);
      alert(
        lang === "ar" ? "حدث خطأ أثناء الإضافة للسلة" : "Error adding to cart"
      );
    }
  };
    if (productId) fetchProduct();
  }, [productId]);

  const handleAddToCart = () => {
    if (!product) return;
    // فقط أرسل الطلب إلى السيرفر وغير حالة الزر
    handleAddToCartAPI();
  };

  // إعادة الزر للحالة الأصلية عند تغيير المتغير أو الخيار
  useEffect(() => {
    setAddToCartSuccess(false);
  }, [selectedOption]);

  const handleRelatedProductClick = (relatedProduct) => {
    navigate(`/product/${relatedProduct._id || relatedProduct.id}`);
  // Favorite logic
  const handleToggleFavorite = () => {
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
    } else {
      addToFavorites(favoriteProduct);
    }
  };

  // Cart logic
  const handleAddToCart = (productId, qty = 1) => {
    if (!isInCart(productId)) {
      // Pass the full product object to the cart
      addToCart({
        id: productId,
        title: product.title,
        price: product.price,
        thumbnail: product.thumbnail,
        brand: product.brand,
        quantity: qty
      });
    }
  };

  // Quantity functions
  const incrementQty = () => {
    setQuantity(prev => Math.min(prev + 1, 99));
  };

  const decrementQty = () => {
    setQuantity(prev => Math.max(prev - 1, 1));
  };

  // Related products navigation
  const handleRelatedClick = (relatedProduct) => {
    navigate(`/product/${relatedProduct.id}`);
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <span key={i} className="star filled">
          ★
        </span>
      );
    }
    if (hasHalfStar) {
      stars.push(
        <span key="half" className="star half">
          ★
        </span>
      );
    }
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <span key={`empty-${i}`} className="star empty">
          ☆
        </span>
      );
    }
    return stars;
  };
  const discountedPrice = product && product.discountPercentage
    ? (product.price * (1 - product.discountPercentage / 100)).toFixed(2)
    : product && product.price;

  if (loading) {
    return (
      <div className="product-details-loading">
        <div className="loading-spinner"></div>
        <p>{t("productDetails.loading")}</p>
      <div className="flex flex-col items-center justify-center min-h-[60vh] w-full py-16" style={{ background: 'var(--primary-bg)' }}>
        <div className="w-12 h-12 border-4 rounded-full animate-spin mb-6" style={{ borderColor: 'var(--accent-text)', borderTopColor: 'transparent' }}></div>
        <p className="text-lg" style={{ color: 'var(--secondary-text)' }}>Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-not-found">
        <h2>{t("productDetails.notFound")}</h2>
        <p>{t("productDetails.notFoundDescription")}</p>
        <button onClick={() => navigate("/")} className="back-home-btn">
          {t("common.backToHome")}
      <div className="flex flex-col items-center justify-center min-h-[60vh] w-full py-16" style={{ background: 'var(--primary-bg)' }}>
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--primary-text)' }}>Product Not Found</h2>
        <p className="mb-6" style={{ color: 'var(--secondary-text)' }}>The product you're looking for doesn't exist.</p>
        <button 
          onClick={() => navigate('/')} 
          className="px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:scale-105"
          style={{ 
            background: 'var(--gradient-primary)',
            color: 'white',
            boxShadow: 'var(--shadow-md)'
          }}
        >
          Back to Home
        </button>
      </div>
    );
  }

  // Defensive check for reviews
  if (product.reviews && !Array.isArray(product.reviews)) {
    console.warn('product.reviews is not an array:', product.reviews);
  }

  // Ensure reviews is always an array for safe rendering
  const safeReviews = Array.isArray(product.reviews) ? product.reviews : [];

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-10 w-full" style={{ background: 'var(--primary-bg)' }}>
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <span onClick={() => navigate("/")} className="breadcrumb-link">
          {t("navigation.home")}
        </span>
        <span className="breadcrumb-separator">/</span>
        <span
          onClick={() =>
            navigate(
              `/products?category=${
                typeof product.category?.slug === "object"
                  ? product.category.slug.en
                  : product.category?.slug || product.category
              }`
            )
          }
          className="breadcrumb-link"
        >
          {product.category?.name?.[lang] ||
            product.category?.name?.en ||
            product.category?.name ||
            product.category}
        </span>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-current">
          {product.name?.[lang] || product.name?.en || product.name}
        </span>
      <div className="flex items-center gap-2 text-sm mb-8" style={{ color: 'var(--secondary-text)' }}>
        <span onClick={() => navigate('/')} className="cursor-pointer hover:text-blue-600 transition-colors">Home</span>
        <span>/</span>
        <span onClick={() => navigate(`/category/${product.category}`)} className="cursor-pointer hover:text-blue-600 capitalize transition-colors">{product.category}</span>
        <span>/</span>
        <span className="font-semibold" style={{ color: 'var(--primary-text)' }}>{product.title}</span>
      </div>

      <div className="product-details-container">
        {/* Product Images */}
        <div className="product-images">
          <div className="main-image">
            <img
              src={mainImages?.[selectedImage]?.url || mainImages?.[0]?.url}
              alt={product.name?.[lang] || product.name?.en || product.name}
              onError={(e) => {
                e.target.src = "/public/logo.jpg";
              }}
      <section className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Product Image */}
        <div className="flex flex-col items-center justify-center w-full">
          <div className="relative w-full max-w-md aspect-square bg-gradient-to-br from-[rgba(37,99,235,0.05)] to-[rgba(16,185,129,0.03)] rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center overflow-hidden mb-6">
            <img
              src={product.thumbnail}
              alt={product.title}
              className="w-full h-full object-contain p-4 transition-transform duration-300 hover:scale-110"
              style={{ background: 'var(--image-bg, #f8fafc)' }}
            />
            {discount > 0 && <div className="discount-badge">-{discount}%</div>}
            {product.discountPercentage > 0 && (
              <span className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                -{Math.round(product.discountPercentage)}%
              </span>
            )}
            <button 
              onClick={handleToggleFavorite}
              className={`absolute top-3 right-3 rounded-full p-2 shadow-md transition-all duration-200 ${
                isInFavorites(product.id) 
                  ? 'bg-red-500 text-white' 
                  : 'bg-white/90 hover:bg-white text-gray-400 hover:text-red-500'
              }`} 
              aria-label="Add to Favorites"
            >
              <svg className="w-5 h-5" fill={isInFavorites(product.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </button>
          </div>

          {mainImages && mainImages.length > 1 && (
            <div className="image-thumbnails">
              {mainImages.map((image, index) => (
                <img
                  key={index}
                  src={image.url}
                  alt={`${
                    product.name?.[lang] || product.name?.en || product.name
                  } ${index + 1}`}
                  className={`thumbnail ${
                    selectedImage === index ? "active" : ""
                  }`}
                  onClick={() => setSelectedImage(index)}
                  onError={(e) => {
                    e.target.src = "/public/logo.jpg";
                  }}
                />
              ))}
          
          {/* Image Gallery Placeholder */}
          <div className="flex gap-2 justify-center w-full">
            <div className="w-16 h-16 rounded-lg border-2 border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center cursor-pointer">
              <img src={product.thumbnail} alt="Thumbnail 1" className="w-12 h-12 object-contain" />
            </div>
            <div className="w-16 h-16 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex items-center justify-center cursor-pointer hover:border-blue-300">
              <span className="text-xs text-gray-500">+2</span>
            </div>
          </div>
        </div>
        {/* Product Info */}
        <div className="product-info">
          {/* العلامة التجارية */}
          <div className="brand-responsive-row">
            {product.brand?.logoUrl && (
              <img
                src={product.brand.logoUrl}
                alt={product.brand.name?.[lang] || product.brand.name}
                className="brand-logo"
              />
            )}
            <span className="brand-name">
              {product.brand?.name?.[lang] ||
                product.brand?.name?.en ||
                product.brand?.name}
            </span>
          </div>

          {/* المتغيرات */}
          {product.variants && product.variants.length > 0 && (
            <div className="variants-responsive-section">
              <div className="variant-row">
                <span className="variant-label">
                  {product.variants
                    .map((v) => v.name?.[lang] || v.name?.en || v.name)
                    .join(" / ")}
                  :
                </span>
                <div className="variant-options-list">
                  {product.variants.flatMap((variant, vIdx) =>
                    variant.options.map((option, oIdx) => (
                      <button
                        key={option.sku || `${vIdx}-${oIdx}`}
                        className={`variant-btn color-name-btn${
                          selectedOption === option ? " selected" : ""
                        }`}
                        onClick={() => {
                          setSelectedOption(option);
                          if (option.variantImages?.length > 0) {
                            setSelectedImage(0);
                          }
                        }}
                        title={
                          option.value?.[lang] ||
                          option.value?.en ||
                          option.value
                        }
                      >
                        {option.colorHex && (
                          <span
                            className="color-dot"
                            style={{ background: option.colorHex }}
                          ></span>
                        )}
                        <span className="option-name">
                          {option.value?.[lang] ||
                            option.value?.en ||
                            option.value}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* المخزون */}
          <span
            className={`stock-badge-responsive ${
              stock > 0 ? "in-stock" : "out-of-stock"
            }`}
          >
            {stock > 0
              ? t("productDetails.inStock", { count: stock })
              : t("productDetails.outOfStock")}
          </span>

          <h1 className="product-title">
            {product.name?.[lang] || product.name?.en || product.name}
          </h1>

          <div className="rating-section">
            <div className="stars">
              {renderStars(product.averageRating || 0)}
        <div className="flex flex-col gap-6 w-full">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">{product.brand}</span>
            {product.stock > 0 ? (
              <span className="text-xs font-semibold uppercase tracking-wider text-green-600 bg-green-50 px-3 py-1 rounded-full">In Stock</span>
            ) : (
              <span className="text-xs font-semibold uppercase tracking-wider text-red-600 bg-red-50 px-3 py-1 rounded-full">Out of Stock</span>
            )}
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--primary-text)' }}>{product.title}</h1>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex">
              {renderStars(product.rating)}
            </div>
            <span className="rating-value">({product.averageRating || 0})</span>
            <span className="reviews-count">
              •{" "}
              {t("productDetails.reviews.basedOn", {
                count: product.numOfReviews || 0,
              })}
            </span>
            <span className="text-sm text-gray-400">({product.rating})</span>
            <span className="text-xs text-gray-400">Based on {Array.isArray(product.reviews) ? product.reviews.length : (product.reviews || 0)} reviews</span>
          </div>

          <div className="price-section">
            <div className="prices">
              <span className="current-price">
                {price} {t("common.currency")}
              </span>
              {oldPrice && (
                <span className="original-price">
                  {oldPrice} {t("common.currency")}
                </span>
              )}
            </div>
            {discount > 0 && (
              <div className="savings">
                {t("productDetails.youSave", {
                  amount: (oldPrice - price).toFixed(2),
                  percentage: discount,
                })}
              </div>
          <div className="flex items-center gap-4 mb-4">
            <span className="text-3xl font-bold text-blue-600">${product.price}</span>
            {product.discountPercentage > 0 && (
              <span className="text-lg line-through text-red-400">${product.originalPrice}</span>
            )}
            {product.discountPercentage > 0 && (
              <span className="text-base font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">-{Math.round(product.discountPercentage)}%</span>
            )}
          </div>

          <div className="quantity-section">
            <label htmlFor="quantity">{t("productDetails.quantity")}</label>
            <div className="quantity-controls">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
          <p className="text-base text-gray-300 mb-4" style={{ color: 'var(--secondary-text)' }}>{product.description}</p>
          {/* Quantity Selector & Add to Cart */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2 rounded-xl px-3 py-2 shadow-inner theme-card">
              <button 
                onClick={decrementQty} 
                className="w-8 h-8 flex items-center justify-center rounded-full text-xl font-bold transition-all duration-200 hover:scale-110" 
                style={{ 
                  background: 'var(--tertiary-bg)',
                  color: 'var(--primary-text)'
                }}
                aria-label="Decrease Quantity"
              >
                -
              </button>
              <input
                type="number"
                id="quantity"
                min="1"
                max={stock}
                value={quantity}
                onChange={(e) =>
                  setQuantity(
                    Math.max(1, Math.min(stock, parseInt(e.target.value) || 1))
                  )
                }
              />
              <button
                onClick={() => setQuantity(Math.min(stock, quantity + 1))}
                disabled={quantity >= stock}
              <span className="text-lg font-semibold px-3" style={{ color: 'var(--primary-text)' }}>{quantity}</span>
              <button 
                onClick={incrementQty} 
                className="w-8 h-8 flex items-center justify-center rounded-full text-xl font-bold transition-all duration-200 hover:scale-110" 
                style={{ 
                  background: 'var(--tertiary-bg)',
                  color: 'var(--primary-text)'
                }}
                aria-label="Increase Quantity"
              >
                +
              </button>
            </div>
          </div>

          <div className="action-buttons">
            <button
              className={`add-to-cart-btn ${addToCartSuccess ? "in-cart" : ""}`}
              onClick={handleAddToCart}
              disabled={stock === 0}
              style={
                addToCartSuccess ? { background: "#10b981", color: "#fff" } : {}
              }
            <button
              onClick={() => handleAddToCart(product.id, quantity)}
              className="flex-1 py-4 rounded-2xl font-bold text-lg shadow-xl transition-all duration-300 text-white flex items-center justify-center gap-3 hover:scale-105"
              style={{ 
                background: 'var(--gradient-primary)',
                boxShadow: 'var(--shadow-lg)'
              }}
              aria-label="Add to Cart"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M9 22C9.55228 22 10 21.5523 10 21C10 20.4477 9.55228 20 9 20C8.44772 20 8 20.4477 8 21C8 21.5523 8.44772 22 9 22Z" />
                <path d="M20 22C20.5523 22 21 21.5523 21 21C21 20.4477 20.5523 20 20 20C19.4477 20 19 20.4477 19 21C19 21.5523 19.4477 22 20 22Z" />
                <path d="M1 1H5L7.68 14.39C7.77144 14.8504 8.02191 15.264 8.38755 15.5583C8.75318 15.8526 9.2107 16.009 9.68 16H19.4C19.8693 16.009 20.3268 15.8526 20.6925 15.5583C21.0581 15.264 21.3086 14.8504 21.4 14.39L23 6H6" />
              </svg>
              {addToCartSuccess
                ? lang === "ar"
                  ? "في السلة"
                  : "In Cart"
                : t("cart.addToCart")}
            </button>

            <button
              className="buy-now-btn"
              onClick={() => {
                handleAddToCart();
                navigate("/cart");
              }}
              disabled={stock === 0}
            >
              {t("productDetails.buyNow")}
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 22C9.55228 22 10 21.5523 10 21C10 20.4477 9.55228 20 9 20C8.44772 20 8 20.4477 8 21C8 21.5523 8.44772 22 9 22Z"/><path d="M20 22C20.5523 22 21 21.5523 21 21C21 20.4477 20.5523 20 20 20C19.4477 20 19 20.4477 19 21C19 21.5523 19.4477 22 20 22Z"/><path d="M1 1H5L7.68 14.39C7.77144 14.8504 8.02191 15.264 8.38755 15.5583C8.75318 15.8526 9.2107 16.009 9.68 16H19.4C19.8693 16.009 20.3268 15.8526 20.6925 15.5583C21.0581 15.264 21.3086 14.8504 21.4 14.39L23 6H6"/></svg>
              Add to Cart
            </button>
          </div>

          <div className="product-features">
            <div className="feature-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.27,6.96 12,12.01 20.73,6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
              <span>{t("productDetails.features.freeShipping")}</span>
            </div>
            <div className="feature-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9,22 9,12 15,12 15,22" />
              </svg>
              <span>{t("productDetails.features.returns")}</span>
            </div>
            <div className="feature-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="1" y="3" width="15" height="13" />
                <polygon points="16,8 20,8 23,11 23,16 16,16 16,8" />
                <circle cx="5.5" cy="18.5" r="2.5" />
                <circle cx="18.5" cy="18.5" r="2.5" />
              </svg>
              <span>{t("productDetails.features.securePayment")}</span>
            </div>
            <div className="feature-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M9 12l2 2 4-4" />
                <circle cx="12" cy="12" r="10" />
              </svg>
              <span>{t("productDetails.specifications.warranty")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <div className="product-tabs">
        <div className="tab-buttons">
          <button
            className={activeTab === "description" ? "active" : ""}
            onClick={() => setActiveTab("description")}
          >
            {t("productDetails.tabs.description")}
          </button>
          <button
            className={activeTab === "specifications" ? "active" : ""}
            onClick={() => setActiveTab("specifications")}
          >
            {t("productDetails.tabs.specifications")}
          </button>
          <button
            className={activeTab === "reviews" ? "active" : ""}
            onClick={() => setActiveTab("reviews")}
          >
            {t("productDetails.tabs.reviews")}
          </button>
        </div>

        <div className="tab-content">
          {activeTab === "description" && (
            <div className="description-content">
              <p
                dangerouslySetInnerHTML={{
                  __html:
                    product.details?.[lang] ||
                    product.shortDescription?.[lang] ||
                    t("productDetails.description.title"),
                }}
              />
            </div>
          )}

          {activeTab === "specifications" && (
            <div className="specifications-content">
              <table className="specs-table">
                <tbody>
                  {product.specifications &&
                  product.specifications.length > 0 ? (
                    product.specifications.map((spec, idx) => (
                      <tr key={idx}>
                        <td>
                          {spec.name?.[lang] || spec.name?.en || spec.name}
                        </td>
                        <td>
                          {spec.value?.[lang] || spec.value?.en || spec.value}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="2">
                        {t("productDetails.specifications.na")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="reviews-content">
              <div className="reviews-summary">
                <div className="rating-breakdown">
                  <span className="average-rating">
                    {product.averageRating || 0}
                  </span>
                  <div className="stars">
                    {renderStars(product.averageRating || 0)}
                  </div>
                  <span className="reviews-count">
                    {t("productDetails.reviews.basedOn", {
                      count: product.numOfReviews || 0,
                    })}
                  </span>
      </section>
      {/* Related Products */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--primary-text)' }}>Related Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {relatedProducts.map(related => (
            <div key={related.id} className="rounded-2xl shadow-lg border overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-blue-400 cursor-pointer theme-card"
              tabIndex={0}
              aria-label={related.title}
              onClick={() => handleRelatedClick(related)}
            >
              <div className="relative w-full h-48 flex items-center justify-center bg-[var(--image-bg,#f8fafc)]">
                <img src={related.thumbnail} alt={related.title} className="w-full h-full object-contain rounded-2xl" style={{ maxHeight: '140px', maxWidth: '90%' }} />
                {related.discountPercentage > 0 && (
                  <span className="absolute top-3 left-3 bg-gradient-to-r from-blue-600 to-green-400 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg animate-pulse">
                    -{Math.round(related.discountPercentage)}%
                  </span>
                )}
              </div>
              <div className="p-4 flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 truncate">{related.brand}</span>
                <h3 className="font-semibold text-base truncate" style={{ color: 'var(--primary-text)' }}>{related.title}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-blue-600">${related.price}</span>
                  {related.discountPercentage > 0 && (
                    <span className="text-sm line-through text-red-400">${related.originalPrice}</span>
                  )}
                </div>
              </div>
              {product.reviews && product.reviews.length > 0 ? (
                product.reviews.map((review, index) => (
                  <div key={index} className="review-item">
                    <div className="review-header">
                      <span className="reviewer-name">
                        {review.reviewerName}
                      </span>
                      <div className="review-rating">
                        {renderStars(review.rating)}
                      </div>
                      <span className="review-date">
                        {new Date(review.date).toLocaleDateString(lang)}
                      </span>
                    </div>
                    <p className="review-comment">{review.comment}</p>
                  </div>
                ))
              ) : (
                <div className="no-reviews">
                  <p>{t("productDetails.reviews.noReviews")}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="related-products">
          <h2>{t("productDetails.relatedProducts")}</h2>
          <div className="related-products-grid">
            {relatedProducts.map((relatedProduct) => (
              <div
                key={relatedProduct._id || relatedProduct.id}
                className="related-product-card"
                onClick={() => handleRelatedProductClick(relatedProduct)}
              >
                <img
                  src={relatedProduct.images?.[0]?.url}
                  alt={
                    relatedProduct.name?.[lang] ||
                    relatedProduct.name?.en ||
                    relatedProduct.name
                  }
                />
                <h3>
                  {relatedProduct.name?.[lang] ||
                    relatedProduct.name?.en ||
                    relatedProduct.name}
                </h3>
                <p className="related-product-price">
                  {relatedProduct.bestPriceAfterDiscount ||
                    relatedProduct.basePrice ||
                    relatedProduct.price}{" "}
                  {t("common.currency")}
                </p>
                <div className="related-product-rating">
                  {renderStars(relatedProduct.averageRating || 0)}
      </section>
      {/* Reviews Section */}
      {safeReviews.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 py-8">
          <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--primary-text)' }}>Customer Reviews</h2>
          <div className="space-y-6">
            {safeReviews.map((review, idx) => (
              <div key={idx} className="rounded-xl border shadow p-6 theme-card">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-semibold text-base" style={{ color: 'var(--primary-text)' }}>{review.reviewerName}</span>
                  <span className="text-xs text-gray-400">{new Date(review.date).toLocaleDateString()}</span>
                  <div className="flex ml-auto">{renderStars(review.rating)}</div>
                </div>
                <p className="text-sm" style={{ color: 'var(--secondary-text)' }}>{review.comment}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetails;
