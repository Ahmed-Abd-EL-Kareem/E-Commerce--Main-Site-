// ProductDetails page - improved data view and code comments
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useFavorites } from "../../context/FavoritesContext";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";

const USER_ID = "68491edde1d3d434b3eeed3b";

const ProductDetails = () => {
  // Hooks and context
  const { t, i18n } = useTranslation();
  const lang = i18n.language === "ar" ? "ar" : "en";
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addToFavorites, isInFavorites, removeFromFavorites } = useFavorites();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();

  // State
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [selectedOption, setSelectedOption] = useState(null);
  const [addToCartSuccess, setAddToCartSuccess] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);

  // Helper: Clean HTML tags from text
  const cleanHtmlTags = (text) => {
    if (!text) return "";
    return text
      .replace(/<pre><code[^>]*>([\s\S]*?)<\/code><\/pre>/g, "$1")
      .replace(/<code[^>]*>([\s\S]*?)<\/code>/g, "$1")
      .replace(/<pre[^>]*>([\s\S]*?)<\/pre>/g, "$1")
      .replace(/<[^>]*>/g, "")
      .trim();
  };

  // Fetch product data and related products
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `https://e-commerce-back-end-kappa.vercel.app/api/product/${productId}`
        );
        const data = await response.json();
        const prod = data.data || data;
        setProduct(prod);

        // Fetch related products by category
        let categorySlug =
          prod.category?.slug || prod.category?.en || prod.category;
        let categoryParam = categorySlug;
        if (typeof categorySlug === "object") {
          categoryParam = categorySlug.en || categorySlug.ar || "all";
        } else if (
          !categorySlug ||
          categorySlug === "undefined" ||
          categorySlug === "null"
        ) {
          categoryParam = "all";
        }
        const relatedResponse = await fetch(
          `https://e-commerce-back-end-kappa.vercel.app/api/product?categorySlug=${encodeURIComponent(
            categoryParam
          )}`
        );
        const relatedData = await relatedResponse.json();
        let relatedList = relatedData.data || relatedData.products || [];
        relatedList = relatedList
          .filter((p) => (p._id || p.id) !== productId)
          .slice(0, 4);
        setRelatedProducts(relatedList);

        // Set default selected option if variants exist
        if (prod.variants && prod.variants.length > 0) {
          setSelectedOption(prod.variants[0]?.options[0] || null);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        toast.error(t("errors.general"), {
          icon: "❌",
          style: { background: "#dc2626", color: "#ffffff" },
        });
      } finally {
        setLoading(false);
      }
    };
    if (productId) {
      fetchProduct();
    }
  }, [productId, t]);

  // Calculate current option, price, stock, images
  const currentOption =
    selectedOption || (product?.variants && product.variants[0]?.options[0]);
  const price =
    currentOption?.priceAfterDiscount ||
    currentOption?.price ||
    product?.bestPriceAfterDiscount ||
    product?.basePrice ||
    product?.price;
  const oldPrice =
    currentOption?.price &&
    currentOption?.priceAfterDiscount &&
    currentOption?.price !== currentOption?.priceAfterDiscount
      ? currentOption?.price
      : null;
  const discount = oldPrice
    ? Math.round(((oldPrice - price) / oldPrice) * 100)
    : 0;
  const stock = currentOption?.stock ?? product?.totalStock ?? 0;
  const mainImages =
    currentOption?.variantImages?.length > 0
      ? currentOption.variantImages
      : product?.images || [];

  // Add to cart handler
  const handleAddToCartAPI = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        "https://e-commerce-back-end-kappa.vercel.app/api/cart",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
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
        }
      );
      if (!res.ok) throw new Error("Failed to add to cart");
      setAddToCartSuccess(true);
      toast.success(t("productDetails.addToCartSuccessEn"), {
        icon: "🛒",
        style: { background: "#10b981", color: "#ffffff" },
      });
      window.dispatchEvent(new Event("cartUpdated"));
    } catch {
      setAddToCartSuccess(false);
      toast.error(t("common.error"), {
        icon: "❌",
        style: { background: "#dc2626", color: "#ffffff" },
      });
    }
  };

  // Add to cart (context + API)
  const handleAddToCart = () => {
    if (!product) return;
    addToCart({
      id: product._id || product.id,
      name: product.name?.[lang] || product.name,
      price: price,
      basePrice: product.basePrice,
      image: mainImages?.[0]?.url,
      category: product.category?.name?.[lang] || product.category?.name,
      brand: product.brand?.name?.[lang] || product.brand?.name,
      quantity,
      sku: currentOption?.sku || product.sku || "",
    });
    handleAddToCartAPI();
  };

  // Reset add to cart success on option change
  useEffect(() => {
    setAddToCartSuccess(false);
  }, [selectedOption]);

  // Handle favorite toggle for related products
  const handleToggleFavorite = (e, relatedProduct) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error(t("productDetails.loginToFavorite"), {
        icon: "❌",
        style: { background: "#dc2626", color: "#ffffff" },
      });
      return;
    }
    const favoriteProduct = {
      id: relatedProduct._id || relatedProduct.id,
      name:
        relatedProduct.name?.[lang] ||
        relatedProduct.name?.en ||
        relatedProduct.name,
      price:
        relatedProduct.bestPriceAfterDiscount ||
        relatedProduct.basePrice ||
        relatedProduct.price,
      image: relatedProduct.images?.[0]?.url,
      category:
        relatedProduct.category?.name?.[lang] ||
        relatedProduct.category?.name?.en ||
        relatedProduct.category?.name,
      brand:
        relatedProduct.brand?.name?.[lang] ||
        relatedProduct.brand?.name?.en ||
        relatedProduct.brand?.name,
      description: relatedProduct.description,
    };
    if (isInFavorites(relatedProduct._id || relatedProduct.id)) {
      removeFromFavorites(
        relatedProduct._id || relatedProduct.id,
        favoriteProduct.name
      );
      toast.success(t("productDetails.removedFromFavorites"), {
        icon: "🛒",
        style: { background: "#10b981", color: "#ffffff" },
      });
    } else {
      addToFavorites(favoriteProduct);
      toast.success(t("productDetails.addedToFavorites"), {
        icon: "🛒",
        style: { background: "#10b981", color: "#ffffff" },
      });
    }
  };

  // Handle click on related product
  const handleRelatedProductClick = (relatedProduct) => {
    navigate(`/product/${relatedProduct._id || relatedProduct.id}`);
  };

  // Render rating stars
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

  if (loading) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-[60vh] w-full py-16"
        style={{ background: "var(--primary-bg)" }}
      >
        <div
          className="w-12 h-12 border-4 rounded-full animate-spin mb-6"
          style={{
            borderColor: "var(--accent-text)",
            borderTopColor: "transparent",
          }}
        ></div>
        <p className="text-lg" style={{ color: "var(--secondary-text)" }}>
          {t("productDetails.loading")}
        </p>
      </div>
    );
  }

  if (!product) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-[60vh] w-full py-16"
        style={{ background: "var(--primary-bg)" }}
      >
        <h2
          className="text-2xl font-bold mb-2"
          style={{ color: "var(--primary-text)" }}
        >
          {t("productDetails.notFound")}
        </h2>
        <p className="mb-6" style={{ color: "var(--secondary-text)" }}>
          {t("productDetails.notFoundDescription")}
        </p>
        <button
          onClick={() => navigate("/")}
          className="px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:scale-105"
          style={{
            background: "var(--gradient-primary)",
            color: "white",
            boxShadow: "var(--shadow-md)",
          }}
        >
          {t("common.backToHome")}
        </button>
      </div>
    );
  }

  // Define features as an array of translation keys
  const features = [
    "productDetails.features.returns",
    "productDetails.features.freeShipping",
    "product.specifications.warranty", // Corrected key
    "productDetails.features.securePayment",
  ];

  return (
    <div
      className="max-w-[1200px] mx-auto px-4 py-10 w-full"
      style={{ background: "var(--primary-bg)" }}
    >
      {/* Breadcrumb */}
      <div
        className="flex items-center gap-2 text-sm mb-8"
        style={{ color: "var(--secondary-text)" }}
      >
        <span
          onClick={() => navigate("/")}
          className="cursor-pointer hover:text-blue-600 transition-colors"
        >
          {t("navigation.home")}
        </span>
        <span>/</span>
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
          className="cursor-pointer hover:text-blue-600 capitalize transition-colors"
        >
          {product.category?.name?.[lang] ||
            product.category?.name?.en ||
            product.category?.name ||
            product.category}
        </span>
        <span>/</span>
        <span
          className="font-semibold"
          style={{ color: "var(--primary-text)" }}
        >
          {product.name?.[lang] || product.name?.en || product.name}
        </span>
      </div>

      <section className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Product Image */}
        <div className="flex flex-col items-center justify-center w-full">
          <div className="relative w-full max-w-md aspect-square bg-gradient-to-br from-[rgba(37,99,235,0.05)] to-[rgba(16,185,129,0.03)] rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center overflow-hidden mb-6">
            <img
              src={mainImages?.[selectedImage]?.url || mainImages?.[0]?.url}
              alt={product.name?.[lang] || product.name?.en || product.name}
              className="w-full h-full object-contain p-4 transition-transform duration-300 hover:scale-110"
              style={{ background: "var(--image-bg, #f8fafc)" }}
              onError={(e) => {
                e.target.src = "/public/logo.jpg";
              }}
            />
            {discount > 0 && (
              <span className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                -{discount}%
              </span>
            )}

            {/* Favorite Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (!isAuthenticated) {
                  toast.error(t("productDetails.loginToFavorite"), {
                    icon: "❌",
                    style: { background: "#dc2626", color: "#ffffff" },
                  });
                  return;
                }

                const favoriteProduct = {
                  id: product._id || product.id,
                  name:
                    product.name?.[lang] || product.name?.en || product.name,
                  price: price,
                  image: mainImages?.[0]?.url,
                  category:
                    product.category?.name?.[lang] ||
                    product.category?.name?.en ||
                    product.category?.name,
                  brand:
                    product.brand?.name?.[lang] ||
                    product.brand?.name?.en ||
                    product.brand?.name,
                  description: product.description,
                };

                if (isInFavorites(product._id || product.id)) {
                  removeFromFavorites(
                    product._id || product.id,
                    favoriteProduct.name
                  );
                  toast.success(t("productDetails.removedFromFavorites"), {
                    icon: "🛒",
                    style: { background: "#10b981", color: "#ffffff" },
                  });
                } else {
                  addToFavorites(favoriteProduct);
                  toast.success(t("productDetails.addedToFavorites"), {
                    icon: "🛒",
                    style: { background: "#10b981", color: "#ffffff" },
                  });
                }
              }}
              className={`absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 ${
                isInFavorites(product._id || product.id)
                  ? "bg-red-500 text-white"
                  : "bg-white/90 hover:bg-white text-gray-600 hover:text-red-500"
              }`}
              title={
                isInFavorites(product._id || product.id)
                  ? t("productDetails.removeFromFavorites")
                  : t("productDetails.addToFavorites")
              }
            >
              <svg
                className="w-5 h-5"
                fill={
                  isInFavorites(product._id || product.id)
                    ? "currentColor"
                    : "none"
                }
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </button>
          </div>

          {/* Image Gallery */}
          {mainImages && mainImages.length > 1 && (
            <div className="flex gap-2 justify-center w-full">
              {mainImages.map((image, index) => (
                <div
                  key={index}
                  className={`w-16 h-16 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                    selectedImage === index
                      ? "border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100"
                      : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:border-blue-300"
                  }`}
                  onClick={() => setSelectedImage(index)}
                >
                  <img
                    src={image.url}
                    alt={`${
                      product.name?.[lang] || product.name?.en || product.name
                    } ${index + 1}`}
                    className="w-12 h-12 object-contain mx-auto mt-1"
                    onError={(e) => {
                      e.target.src = "/public/logo.jpg";
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex flex-col gap-6 w-full">
          {/* Brand and Stock Status */}
          <div className="flex items-center gap-3 mb-2">
            {product.brand?.logoUrl && (
              <img
                src={product.brand.logoUrl}
                alt={product.brand.name?.[lang] || product.brand.name}
                className="w-6 h-6 object-contain rounded-full border border-gray-200"
              />
            )}
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              {product.brand?.name?.[lang] ||
                product.brand?.name?.en ||
                product.brand?.name}
            </span>
            {stock > 0 ? (
              <span className="text-xs font-semibold uppercase tracking-wider text-green-600 bg-green-50 px-3 py-1 rounded-full">
                {t("productDetails.inStock", { count: stock })}
              </span>
            ) : (
              <span className="text-xs font-semibold uppercase tracking-wider text-red-600 bg-red-50 px-3 py-1 rounded-full">
                {t("productDetails.outOfStock")}
              </span>
            )}
          </div>

          {/* Product Title */}
          <h1
            className="text-3xl font-bold mb-2"
            style={{ color: "var(--primary-text)" }}
          >
            {product.name?.[lang] || product.name?.en || product.name}
          </h1>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-2">
            <div className="flex">
              {renderStars(product.averageRating || 0)}
            </div>
            <span className="text-sm text-gray-400">
              ({product.averageRating || 0})
            </span>
            <span className="text-xs text-gray-400">
              {t("productDetails.reviews.basedOn", {
                count: product.numOfReviews || 0,
              })}
            </span>
          </div>

          {/* Price Section */}
          <div className="flex items-center gap-4 mb-4">
            <span className="text-3xl font-bold text-blue-600">
              {price} {t("common.currency")}
            </span>
            {oldPrice && (
              <span className="text-lg line-through text-red-400">
                {oldPrice} {t("common.currency")}
              </span>
            )}
            {discount > 0 && (
              <span className="text-base font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                -{discount}%
              </span>
            )}
          </div>

          {/* Variants */}
          {product.variants && product.variants.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-3">
                <span
                  className="text-sm font-medium"
                  style={{ color: "var(--primary-text)" }}
                >
                  {product.variants
                    .map((v) => v.name?.[lang] || v.name?.en || v.name)
                    .join(" / ")}
                  :
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.variants.flatMap((variant, vIdx) =>
                  variant.options.map((option, oIdx) => (
                    <button
                      key={option.sku || `${vIdx}-${oIdx}`}
                      className={`px-4 py-2 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                        selectedOption === option
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-200 hover:border-blue-300"
                      }`}
                      onClick={() => {
                        setSelectedOption(option);
                        if (option.variantImages?.length > 0) {
                          setSelectedImage(0);
                        }
                      }}
                      title={
                        option.value?.[lang] || option.value?.en || option.value
                      }
                    >
                      {option.colorHex && (
                        <span
                          className="inline-block w-4 h-4 rounded-full mr-2"
                          style={{ background: option.colorHex }}
                        ></span>
                      )}
                      <span className="text-sm">
                        {option.value?.[lang] ||
                          option.value?.en ||
                          option.value}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Description */}
          <p
            className="text-base mb-4"
            style={{ color: "var(--secondary-text)" }}
          >
            {cleanHtmlTags(
              product.shortDescription?.[lang] ||
                product.shortDescription?.[lang] ||
                t("productDetails.description.title")
            )}
          </p>

          {/* Quantity Selector & Add to Cart */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2 rounded-xl px-3 py-2 shadow-inner theme-card">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                className="w-8 h-8 flex items-center justify-center rounded-full text-xl font-bold transition-all duration-200 hover:scale-110 disabled:opacity-50"
                style={{
                  background: "var(--tertiary-bg)",
                  color: "var(--primary-text)",
                }}
                aria-label={t("productDetails.decreaseQuantity")}
              >
                -
              </button>
              <span
                className="text-lg font-semibold px-3"
                style={{ color: "var(--primary-text)" }}
              >
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(Math.min(stock, quantity + 1))}
                disabled={quantity >= stock}
                className="w-8 h-8 flex items-center justify-center rounded-full text-xl font-bold transition-all duration-200 hover:scale-110 disabled:opacity-50"
                style={{
                  background: "var(--tertiary-bg)",
                  color: "var(--primary-text)",
                }}
                aria-label={t("productDetails.increaseQuantity")}
              >
                +
              </button>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={stock === 0}
              className={`flex-1 py-4 rounded-2xl font-bold text-lg shadow-xl transition-all duration-300 text-white flex items-center justify-center gap-3 hover:scale-105 disabled:opacity-50 ${
                addToCartSuccess ? "bg-green-600" : ""
              }`}
              style={{
                background: addToCartSuccess
                  ? "#10b981"
                  : "var(--gradient-primary)",
                boxShadow: "var(--shadow-lg)",
              }}
              aria-label={t("cart.addToCart")}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M9 22C9.55228 22 10 21.5523 10 21C10 20.4477 9.55228 20 9 20C8.44772 20 8 20.4477 8 21C8 21.5523 8.44772 22 9 22Z" />
                <path d="M20 22C20.5523 22 21 21.5523 21 21C21 20.4477 20.5523 20 20 20C19.4477 20 19 20.4477 19 21C19 21.5523 19.4477 22 20 22Z" />
                <path d="M1 1H5L7.68 14.39C7.77144 14.8504 8.02191 15.264 8.38755 15.5583C8.75318 15.8526 9.2107 16.009 9.68 16H19.4C19.8693 16.009 20.3268 15.8526 20.6925 15.5583C21.0581 15.264 21.3086 14.8504 21.4 14.39L23 6H6" />
              </svg>
              {addToCartSuccess
                ? lang === "ar"
                  ? t("productDetails.inCartAr")
                  : t("productDetails.inCartEn")
                : t("cart.addToCart")}
            </button>
          </div>

          {/* Buy Now Button */}
          <button
            onClick={() => {
              handleAddToCart();
              navigate("/cart");
            }}
            disabled={stock === 0}
            className="w-full py-4 rounded-2xl font-bold text-lg shadow-xl transition-all duration-300 text-white flex items-center justify-center gap-3 hover:scale-105 disabled:opacity-50"
            style={{
              background: "var(--gradient-secondary)",
              boxShadow: "var(--shadow-lg)",
            }}
            aria-label={t("productDetails.buyNow")}
          >
            {t("productDetails.buyNow")}
          </button>

          {/* Product Features */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            {features.map((f, idx) => (
              <div
                key={f}
                className="flex items-center gap-3 p-3 rounded-lg"
                style={{ background: "var(--card-bg)" }}
              >
                {/* يمكنك وضع الأيقونة حسب idx أو حسب المفتاح */}
                {/* مثال: */}
                {idx === 0 && (
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9,22 9,12 15,12 15,22" />
                  </svg>
                )}
                {idx === 1 && (
                  <svg
                    className="w-5 h-5 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                    <polyline points="3.27,6.96 12,12.01 20.73,6.96" />
                    <line x1="12" y1="22.08" x2="12" y2="12" />
                  </svg>
                )}
                {idx === 2 && (
                  <svg
                    className="w-5 h-5 text-yellow-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M9 12l2 2 4-4" />
                    <circle cx="12" cy="12" r="10" />
                  </svg>
                )}
                {idx === 3 && (
                  <svg
                    className="w-5 h-5 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <rect x="1" y="3" width="15" height="13" />
                    <polygon points="16,8 20,8 23,11 23,16 16,16 16,8" />
                    <circle cx="5.5" cy="18.5" r="2.5" />
                    <circle cx="18.5" cy="18.5" r="2.5" />
                  </svg>
                )}
                <span
                  className="text-sm font-medium"
                  style={{ color: "var(--primary-text)" }}
                >
                  {t(f)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Details Tabs */}
      <section className="max-w-4xl mx-auto px-4 py-8">
        <div
          className="rounded-2xl shadow-lg border overflow-hidden"
          style={{
            background: "var(--card-bg)",
            borderColor: "var(--card-border)",
          }}
        >
          <div
            className="flex border-b"
            style={{
              borderColor: "var(--card-border)",
              background: "var(--secondary-bg)",
            }}
          >
            <button
              className={`flex-1 px-6 py-4 text-sm font-medium transition-all duration-200 ${
                activeTab === "description"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-[var(--primary-text)] hover:text-blue-600"
              }`}
              style={{
                background:
                  activeTab === "description"
                    ? "var(--card-bg)"
                    : "var(--secondary-bg)",
                borderColor:
                  activeTab === "description" ? "#2563eb" : "transparent",
              }}
              onClick={() => setActiveTab("description")}
            >
              {t("productDetails.tabs.description")}
            </button>
            <button
              className={`flex-1 px-6 py-4 text-sm font-medium transition-all duration-200 ${
                activeTab === "specifications"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-[var(--primary-text)] hover:text-blue-600"
              }`}
              style={{
                background:
                  activeTab === "specifications"
                    ? "var(--card-bg)"
                    : "var(--secondary-bg)",
                borderColor:
                  activeTab === "specifications" ? "#2563eb" : "transparent",
              }}
              onClick={() => setActiveTab("specifications")}
            >
              {t("productDetails.tabs.specifications")}
            </button>
            <button
              className={`flex-1 px-6 py-4 text-sm font-medium transition-all duration-200 ${
                activeTab === "reviews"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-[var(--primary-text)] hover:text-blue-600"
              }`}
              style={{
                background:
                  activeTab === "reviews"
                    ? "var(--card-bg)"
                    : "var(--secondary-bg)",
                borderColor:
                  activeTab === "reviews" ? "#2563eb" : "transparent",
              }}
              onClick={() => setActiveTab("reviews")}
            >
              {t("productDetails.tabs.reviews")}
            </button>
          </div>
          <div
            className="p-6"
            style={{
              background: "var(--card-bg)",
              color: "var(--primary-text)",
            }}
          >
            {activeTab === "description" && (
              <div
                className="prose max-w-none"
                style={{ color: "var(--primary-text)" }}
              >
                <div
                  dangerouslySetInnerHTML={{
                    __html: (
                      product.details?.[lang] ||
                      product.shortDescription?.[lang] ||
                      t("productDetails.description.title")
                    )
                      .replace(
                        /<pre><code[^>]*>([\s\S]*?)<\/code><\/pre>/g,
                        "$1"
                      )
                      .replace(/<code[^>]*>([\s\S]*?)<\/code>/g, "$1")
                      .replace(/<pre[^>]*>([\s\S]*?)<\/pre>/g, "$1"),
                  }}
                />
              </div>
            )}

            {activeTab === "specifications" && (
              <div className="space-y-4">
                {product.specifications && product.specifications.length > 0 ? (
                  <div className="grid gap-4">
                    {product.specifications.map((spec, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                      >
                        <span
                          className="font-medium"
                          style={{ color: "var(--primary-text)" }}
                        >
                          {spec.name?.[lang] || spec.name?.en || spec.name}
                        </span>
                        <span className="text-gray-600 dark:text-gray-400">
                          {spec.value?.[lang] || spec.value?.en || spec.value}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    {t("productDetails.specifications.na")}
                  </p>
                )}
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="space-y-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {product.averageRating || 0}
                    </div>
                    <div className="flex justify-center mt-2">
                      {renderStars(product.averageRating || 0)}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {t("productDetails.reviews.basedOn", {
                        count: product.numOfReviews || 0,
                      })}
                    </div>
                  </div>
                </div>

                {product.reviews && product.reviews.length > 0 ? (
                  <div className="space-y-4">
                    {product.reviews.map((review, index) => (
                      <div
                        key={index}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className="font-semibold"
                            style={{ color: "var(--primary-text)" }}
                          >
                            {review.reviewerName}
                          </span>
                          <span className="text-sm text-gray-500">
                            {new Date(review.date).toLocaleDateString(lang)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          {renderStars(review.rating)}
                        </div>
                        <p
                          className="text-sm"
                          style={{ color: "var(--secondary-text)" }}
                        >
                          {review.comment}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">
                      {t("productDetails.reviews.noReviews")}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-8">
          <h2
            className="text-2xl font-bold mb-6"
            style={{ color: "var(--primary-text)" }}
          >
            {t("productDetails.relatedProducts")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {relatedProducts.map((relatedProduct) => (
              <div
                key={relatedProduct._id || relatedProduct.id}
                className="rounded-2xl shadow-lg border overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-blue-400 cursor-pointer theme-card"
                onClick={() => handleRelatedProductClick(relatedProduct)}
              >
                <div className="relative w-full h-48 flex items-center justify-center bg-[var(--image-bg,#f8fafc)]">
                  <img
                    src={relatedProduct.images?.[0]?.url}
                    alt={
                      relatedProduct.name?.[lang] ||
                      relatedProduct.name?.en ||
                      relatedProduct.name
                    }
                    className="w-full h-full object-contain rounded-2xl"
                    style={{ maxHeight: "140px", maxWidth: "90%" }}
                  />
                  {(relatedProduct.bestPriceAfterDiscount ||
                    relatedProduct.basePrice ||
                    relatedProduct.price) !==
                    (relatedProduct.basePrice || relatedProduct.price) && (
                    <span className="absolute top-3 left-3 bg-gradient-to-r from-blue-600 to-green-400 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg animate-pulse">
                      -
                      {Math.round(
                        (((relatedProduct.basePrice || relatedProduct.price) -
                          (relatedProduct.bestPriceAfterDiscount ||
                            relatedProduct.basePrice ||
                            relatedProduct.price)) /
                          (relatedProduct.basePrice || relatedProduct.price)) *
                          100
                      )}
                      %
                    </span>
                  )}
                </div>
                <div className="p-4 flex flex-col gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 truncate">
                    {relatedProduct.brand?.name?.[lang] ||
                      relatedProduct.brand?.name?.en ||
                      relatedProduct.brand?.name}
                  </span>
                  <h3
                    className="font-semibold text-base truncate"
                    style={{ color: "var(--primary-text)" }}
                  >
                    {relatedProduct.name?.[lang] ||
                      relatedProduct.name?.en ||
                      relatedProduct.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-blue-600">
                      {relatedProduct.bestPriceAfterDiscount ||
                        relatedProduct.basePrice ||
                        relatedProduct.price}{" "}
                      {t("common.currency")}
                    </span>
                    {(relatedProduct.bestPriceAfterDiscount ||
                      relatedProduct.basePrice ||
                      relatedProduct.price) !==
                      (relatedProduct.basePrice || relatedProduct.price) && (
                      <span className="text-sm line-through text-red-400">
                        {relatedProduct.basePrice || relatedProduct.price}{" "}
                        {t("common.currency")}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {renderStars(relatedProduct.averageRating || 0)}
                  </div>
                  <button
                    onClick={(e) => handleToggleFavorite(e, relatedProduct)}
                    className={`mt-2 px-3 py-1 rounded-full text-xs font-semibold transition-colors duration-200 ${
                      isInFavorites(relatedProduct._id || relatedProduct.id)
                        ? "bg-red-500 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                    title={
                      isInFavorites(relatedProduct._id || relatedProduct.id)
                        ? t("productDetails.unfavorite")
                        : t("productDetails.favorite")
                    }
                    aria-label={
                      isInFavorites(relatedProduct._id || relatedProduct.id)
                        ? t("productDetails.unfavorite")
                        : t("productDetails.favorite")
                    }
                  >
                    {isInFavorites(relatedProduct._id || relatedProduct.id)
                      ? "★"
                      : "☆"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetails;
