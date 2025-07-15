import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
// لم نعد بحاجة لاستخدام useCart هنا
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import "./ProductDetails.css";

const USER_ID = "68491edde1d3d434b3eeed3b"; // ثابت حسب طلبك

const ProductDetails = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language === "ar" ? "ar" : "en";
  const { productId } = useParams();
  const navigate = useNavigate();
  // لم نعد بحاجة لاستخدام useCart هنا

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
        const response = await fetch(
          `http://127.0.0.1:3000/api/product/${productId}`
        );
        const data = await response.json();
        const prod = data.data || data;
        setProduct(prod);

        let categorySlug =
          prod.category?.slug || prod.category?.en || prod.category;
        const relatedResponse = await fetch(
          `http://127.0.0.1:3000/api/product?category=${categorySlug}`
        );
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

  if (loading) {
    return (
      <div className="product-details-loading">
        <div className="loading-spinner"></div>
        <p>{t("productDetails.loading")}</p>
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
        </button>
      </div>
    );
  }

  const currentOption =
    selectedOption || (product.variants && product.variants[0]?.options[0]);
  const price =
    currentOption?.priceAfterDiscount ||
    currentOption?.price ||
    product.bestPriceAfterDiscount ||
    product.basePrice ||
    product.price;
  const oldPrice =
    currentOption?.price &&
    currentOption?.priceAfterDiscount &&
    currentOption?.price !== currentOption?.priceAfterDiscount
      ? currentOption?.price
      : null;
  const discount = oldPrice
    ? Math.round(((oldPrice - price) / oldPrice) * 100)
    : 0;
  const stock = currentOption?.stock ?? product.totalStock;
  const mainImages =
    currentOption?.variantImages?.length > 0
      ? currentOption.variantImages
      : product.images;

  return (
    <div className="product-details">
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
            />
            {discount > 0 && <div className="discount-badge">-{discount}%</div>}
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
            </div>
          )}
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
            </div>
            <span className="rating-value">({product.averageRating || 0})</span>
            <span className="reviews-count">
              •{" "}
              {t("productDetails.reviews.basedOn", {
                count: product.numOfReviews || 0,
              })}
            </span>
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
            )}
          </div>

          <div className="quantity-section">
            <label htmlFor="quantity">{t("productDetails.quantity")}</label>
            <div className="quantity-controls">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
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
          )}
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
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
