import React from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useCart } from "../../context/CartContext";
import { useFavorites } from "../../context/FavoritesContext";

const USER_ID = "68491edde1d3d434b3eeed3b"; // ثابت حسب طلبك

const ProductCard = ({ product, language, t, navigate, viewMode = "grid" }) => {
  const { i18n } = useTranslation();
  const lang = language || i18n.language || "en";
  const { addToCart } = useCart();
  const { addToFavorites, removeFromFavorites, isInFavorites } = useFavorites();
  // جمع جميع الخيارات من جميع المتغيرات
  const allOptions = (product.variants || []).flatMap((v) => v.options || []);
  // استخراج الألوان الفريدة فقط
  const uniqueColors = [];
  const colorMap = {};
  allOptions.forEach((opt, idx) => {
    if (opt.colorHex && !colorMap[opt.colorHex]) {
      colorMap[opt.colorHex] = { option: opt, idx };
      uniqueColors.push({
        colorHex: opt.colorHex,
        colorName: opt.colorName,
        value: opt.value,
        option: opt,
        idx,
      });
    }
  });
  // حالة اللون المختار
  const [selectedColorHex, setSelectedColorHex] = React.useState(
    uniqueColors[0]?.colorHex || null
  );
  // إيجاد أول option يحمل اللون المختار
  const selectedOption =
    allOptions.find((opt) => opt.colorHex === selectedColorHex) ||
    allOptions[0];
  // الصورة
  const featuredImage =
    selectedOption &&
    selectedOption.variantImages &&
    selectedOption.variantImages[0]?.url
      ? selectedOption.variantImages[0]
      : product.images?.find((img) => img.isFeatured) || product.images?.[0];
  const imageUrl =
    featuredImage?.url ||
    "https://dummyimage.com/300x200/eee/333&text=No+Image";
  const imageAlt =
    typeof featuredImage?.altText === "object"
      ? featuredImage.altText[lang] ||
        featuredImage.altText["en"] ||
        featuredImage.altText["ar"] ||
        ""
      : featuredImage?.altText || "";
  const brandName =
    typeof product.brand?.name === "object"
      ? product.brand.name[lang] ||
        product.brand.name["en"] ||
        product.brand.name["ar"] ||
        ""
      : product.brand?.name || "";
  // السعر والخصم حسب الخيار المختار فقط
  let price = selectedOption?.price || product.basePrice || product.price || 0;
  let priceAfterDiscount = selectedOption?.priceAfterDiscount || price;
  let oldPrice = null;
  let discount = 0;
  if (
    selectedOption &&
    selectedOption.price &&
    selectedOption.priceAfterDiscount &&
    selectedOption.price !== selectedOption.priceAfterDiscount
  ) {
    oldPrice = selectedOption.price;
    discount = Math.round(((oldPrice - priceAfterDiscount) / oldPrice) * 100);
  } else if (
    selectedOption &&
    selectedOption.discount &&
    selectedOption.discount > 0
  ) {
    oldPrice = price;
    discount = selectedOption.discount;
  } else if (product.discount || product.discountPercentage) {
    oldPrice = price;
    discount = product.discount || product.discountPercentage;
  }
  const categoryName =
    typeof product.category?.name === "object"
      ? product.category.name[lang] ||
        product.category.name["en"] ||
        product.category.name["ar"] ||
        ""
      : product.category?.name || "";

  // حالة المفضلة
  const [isFav, setIsFav] = React.useState(() => isInFavorites(product._id));
  React.useEffect(() => {
    setIsFav(isInFavorites(product._id));
  }, [product._id, isInFavorites]);

  // دالة المفضلة
  const handleFavorite = (e) => {
    e.stopPropagation();
    if (isFav) {
      removeFromFavorites(
        product._id,
        typeof product.name === "object" ? product.name[lang] : product.name
      );
      setIsFav(false);
    } else {
      addToFavorites({
        id: product._id,
        name:
          typeof product.name === "object" ? product.name[lang] : product.name,
        image: imageUrl,
        price: priceAfterDiscount,
        brand: brandName,
        category: categoryName,
      });
      setIsFav(true);
    }
  };

  // دالة إضافة للسلة
  const handleAddToCart = async (e) => {
    e.stopPropagation();
    // تحديث السلة محلياً (context)
    addToCart({
      id: product._id || product.id,
      name:
        typeof product.name === "object"
          ? product.name[lang] || product.name.en || product.name.ar
          : product.name,
      price: priceAfterDiscount,
      basePrice: product.basePrice,
      image: imageUrl,
      category:
        typeof product.category?.name === "object"
          ? product.category.name[lang] ||
            product.category.name.en ||
            product.category.name.ar
          : product.category?.name,
      brand:
        typeof product.brand?.name === "object"
          ? product.brand.name[lang] ||
            product.brand.name.en ||
            product.brand.name.ar
          : product.brand?.name,
      sku: selectedOption?.sku || product.sku || "",
      quantity: 1,
    });
    try {
      // جلب التوكن إذا كان موجوداً
      const token = localStorage.getItem("token");
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          user: { $oid: USER_ID },
          items: [
            {
              product: product._id,
              sku: selectedOption?.sku || product.sku || "",
              quantity: 1,
            },
          ],
          notes: {
            en: "Fast delivery please",
            ar: "يرجى التوصيل بسرعة",
          },
        }),
      });
      if (!res.ok) throw new Error("فشل الإضافة للسلة");
      toast.success(
        lang === "ar"
          ? "تمت الإضافة للسلة بنجاح"
          : "Added to cart successfully",
        { icon: "🛒", style: { background: "#10b981", color: "#ffffff" } }
      );
      // تحديث عداد السلة في النافبار
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      console.error("Error adding to cart:", err);
      toast.error(
        lang === "ar" ? "حدث خطأ أثناء الإضافة للسلة" : "Error adding to cart",
        { icon: "❌", style: { background: "#dc2626", color: "#ffffff" } }
      );
    }
  };

  // List View Layout
  if (viewMode === "list") {
    return (
      <div
        className="group relative bg-white dark:bg-slate-800 rounded-2xl shadow-md hover:shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden transition-all duration-300 hover:-translate-y-1 cursor-pointer"
        style={{
          background: "var(--card-bg)",
          borderColor: "var(--card-border)",
          minHeight: "160px",
        }}
        onClick={() => navigate(`/product/${product._id}`)}
      >
        <div className="flex h-full">
          {/* Image Section - Smaller and Compact */}
          <div className="relative w-32 h-32 flex-shrink-0">
            <div className="w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800">
              <img
                src={imageUrl}
                alt={imageAlt}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>

            {/* Category Badge - Smaller */}
            <div className="absolute top-2 left-2">
              <span
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold text-white shadow-md"
                style={{
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  boxShadow: "0 2px 8px rgba(102, 126, 234, 0.3)",
                }}
              >
                {categoryName}
              </span>
            </div>

            {/* Discount Badge - Smaller */}
            {discount > 0 && (
              <div className="absolute top-2 right-2">
                <span
                  className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-bold text-white shadow-md"
                  style={{
                    background:
                      "linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)",
                    boxShadow: "0 2px 8px rgba(255, 107, 107, 0.3)",
                  }}
                >
                  -{discount}%
                </span>
              </div>
            )}

            {/* Quick Actions - Compact */}
            <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
              <button className="w-6 h-6 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200 hover:scale-110">
                <svg
                  className="w-3 h-3 text-slate-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </button>
              <button className="w-6 h-6 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200 hover:scale-110">
                <svg
                  className="w-3 h-3 text-slate-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Content Section */}
          <div className="flex-1 flex flex-col justify-between p-4">
            <div className="space-y-2">
              {/* Brand and Category Row */}
              <div className="flex items-center gap-2">
                {product.brand?.logoUrl && (
                  <img
                    src={product.brand.logoUrl}
                    alt={brandName}
                    className="w-4 h-4 object-contain rounded-full border border-slate-200 dark:border-slate-600"
                  />
                )}
                <span className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                  {brandName}
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {product.category?.name || product.category}
                </span>
              </div>

              {/* Product Name */}
              <h3
                className="text-base font-bold leading-tight line-clamp-2"
                style={{ color: "var(--primary-text)" }}
              >
                {typeof product.name === "object"
                  ? product.name[language] ||
                    product.name["en"] ||
                    product.name["ar"] ||
                    ""
                  : product.name || ""}
              </h3>

              {/* Rating - Compact */}
              {product.averageRating && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-3 h-3 ${
                          i < Math.floor(product.averageRating)
                            ? "text-yellow-400 fill-current"
                            : "text-slate-300 dark:text-slate-600"
                        }`}
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    ({product.averageRating})
                  </span>
                </div>
              )}

              {/* Color Variants - Compact */}
              {uniqueColors.length > 0 && (
                <div className="flex items-center gap-1">
                  {uniqueColors.map((color) => (
                    <button
                      key={color.colorHex}
                      title={
                        color.colorName?.[language] ||
                        color.colorName?.en ||
                        color.colorName ||
                        color.value?.[language] ||
                        color.value?.en ||
                        color.value
                      }
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedColorHex(color.colorHex);
                      }}
                      className={`w-4 h-4 rounded-full transition-all duration-200 hover:scale-110 ${
                        selectedColorHex === color.colorHex
                          ? "ring-2 ring-blue-500 ring-offset-1"
                          : "hover:ring-1 hover:ring-slate-300"
                      }`}
                      style={{
                        background: color.colorHex,
                        boxShadow:
                          selectedColorHex === color.colorHex
                            ? "0 0 0 1px #3b82f6, 0 2px 6px rgba(59, 130, 246, 0.3)"
                            : "0 1px 3px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Price and Action Row */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-green-600 dark:text-green-400">
                  {priceAfterDiscount} {t("common.currency")}
                </span>
                {oldPrice && (
                  <span className="text-sm text-slate-400 dark:text-slate-500 line-through">
                    {oldPrice} {t("common.currency")}
                  </span>
                )}
              </div>

              <button
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95"
                onClick={handleAddToCart}
              >
                <span className="flex items-center gap-1">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"
                    />
                  </svg>
                  {t("cart.addToCart")}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Hover Effect Border */}
        <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-blue-500/20 transition-colors duration-300 pointer-events-none"></div>
      </div>
    );
  }

  // Grid View Layout (Original Enhanced Design)
  return (
    <div
      className="group relative bg-white dark:bg-slate-800 rounded-3xl shadow-lg hover:shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden transition-all duration-500 hover:-translate-y-2 cursor-pointer transform hover:scale-[1.04] hover:shadow-blue-200 dark:hover:shadow-blue-900"
      style={{
        background: "var(--card-bg)",
        borderColor: "var(--card-border)",
        minHeight: "440px",
        boxShadow: "0 4px 24px rgba(59,130,246,0.07)",
      }}
      onClick={() => navigate(`/product/${product._id}`)}
    >
      {/* شارة جديد */}
      {product.isNew && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30">
          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-lg bg-gradient-to-r from-green-400 to-blue-500 animate-pulse">
            {language === "ar" ? "جديد" : "NEW"}
          </span>
        </div>
      )}
      {/* شارة التصنيف */}
      <div className="absolute top-4 left-4 z-20 flex flex-col items-start gap-2">
        <span
          className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold text-white shadow-lg"
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
          }}
        >
          {categoryName}
        </span>
        {/* زر المفضلة أسفل شارة التصنيف */}
        <button
          className={`mt-1 w-9 h-9 flex items-center justify-center rounded-full border shadow transition-all duration-200
            ${
              isFav
                ? "bg-red-100/90 border-red-300 animate-pulse"
                : "bg-white/90 dark:bg-slate-700 border-slate-200 dark:border-slate-600 hover:bg-blue-50"
            }
            hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-400`}
          onClick={handleFavorite}
          aria-label={
            isFav
              ? language === "ar"
                ? "إزالة من المفضلة"
                : "Remove from favorites"
              : language === "ar"
              ? "أضف للمفضلة"
              : "Add to favorites"
          }
          style={{ boxShadow: isFav ? "0 0 0 4px #fee2e2" : undefined }}
        >
          <svg
            className={`w-5 h-5 transition-all duration-200 ${
              isFav
                ? "text-red-500 fill-red-500 scale-110"
                : "text-slate-400 group-hover:text-blue-500"
            }`}
            fill={isFav ? "currentColor" : "none"}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </button>
      </div>
      {/* شارة الخصم */}
      {discount > 0 && (
        <div className="absolute top-4 right-4 z-20">
          <span
            className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold text-white shadow-lg animate-pulse"
            style={{
              background: "linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)",
              boxShadow: "0 4px 15px rgba(255, 107, 107, 0.4)",
            }}
          >
            -{discount}%
          </span>
        </div>
      )}
      {/* صورة المنتج */}
      <div className="relative overflow-visible">
        <div className="aspect-square relative flex items-center justify-center">
          <div className="absolute inset-0 z-0 rounded-3xl bg-gradient-to-br from-blue-100/40 to-blue-200/10 dark:from-slate-700 dark:to-slate-800 shadow-lg group-hover:shadow-blue-200 dark:group-hover:shadow-blue-900 transition-all duration-500 scale-95 group-hover:scale-100" />
          <img
            src={imageUrl}
            alt={imageAlt}
            className="relative z-10 w-full h-full object-contain rounded-2xl shadow-md transition-transform duration-700 group-hover:scale-110 group-hover:brightness-105 group-hover:shadow-2xl"
            style={{
              minHeight: "220px",
              maxHeight: "280px",
              background: "var(--image-bg)",
            }}
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
        </div>
      </div>
      {/* خيارات الألوان */}
      {uniqueColors.length > 0 && (
        <div className="px-4 pt-3 pb-2">
          <div className="flex items-center justify-center gap-2">
            {uniqueColors.map((color) => (
              <button
                key={color.colorHex}
                title={
                  color.colorName?.[language] ||
                  color.colorName?.en ||
                  color.colorName ||
                  color.value?.[language] ||
                  color.value?.en ||
                  color.value
                }
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedColorHex(color.colorHex);
                }}
                className={`w-7 h-7 rounded-full border-2 transition-all duration-200 hover:scale-110 ${
                  selectedColorHex === color.colorHex
                    ? "ring-2 ring-blue-500 border-blue-500"
                    : "border-slate-300 dark:border-slate-600"
                }`}
                style={{
                  background: color.colorHex,
                  boxShadow:
                    selectedColorHex === color.colorHex
                      ? "0 0 0 2px #3b82f6, 0 4px 12px rgba(59, 130, 246, 0.3)"
                      : "0 2px 8px rgba(0, 0, 0, 0.1)",
                }}
              >
                <span className="sr-only">
                  {color.colorName?.[language] ||
                    color.colorName ||
                    color.value}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
      {/* محتوى البطاقة */}
      <div className="p-5 space-y-3">
        {/* الماركة */}
        <div className="flex items-center gap-2">
          {product.brand?.logoUrl && (
            <img
              src={product.brand.logoUrl}
              alt={brandName}
              className="w-5 h-5 object-contain rounded-full border border-slate-200 dark:border-slate-600"
            />
          )}
          <span className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide">
            {brandName}
          </span>
        </div>
        {/* اسم المنتج */}
        <h3
          className="text-lg font-bold leading-tight line-clamp-2 product-card-title"
          style={{ color: "var(--primary-text)" }}
        >
          {typeof product.name === "object"
            ? product.name[language] ||
              product.name["en"] ||
              product.name["ar"] ||
              ""
            : product.name || ""}
        </h3>
        {/* التقييم */}
        <div className="flex items-center gap-2">
          <div className="flex items-center rating-stars">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`w-4 h-4 rating-star ${
                  i < Math.round(product.averageRating || 0)
                    ? "text-yellow-400 fill-current"
                    : "text-slate-300 dark:text-slate-600 empty"
                }`}
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {product.averageRating ? `${product.averageRating}★` : "-"}
          </span>
          {product.reviewsCount && (
            <span className="text-xs text-slate-400 ml-1">
              ({product.reviewsCount})
            </span>
          )}
        </div>
        {/* السعر */}
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold text-green-600 dark:text-green-400 price-current">
            {priceAfterDiscount} {t("common.currency")}
          </span>
          {oldPrice && (
            <span className="text-lg text-slate-400 dark:text-slate-500 line-through price-original">
              {oldPrice} {t("common.currency")}
            </span>
          )}
        </div>
        {/* زر السلة */}
        <button
          className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 add-to-cart-btn flex items-center justify-center gap-2 relative overflow-hidden group/addcart"
          onClick={handleAddToCart}
        >
          <span className="flex items-center gap-2">
            <span className="relative flex items-center">
              <svg
                className="w-5 h-5 transition-transform duration-300 group-active/addcart:scale-125 group-hover/addcart:rotate-[-12deg]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"
                />
              </svg>
              {/* تأثير موجة عند الضغط */}
              {/* تمت إزالة الخلفية هنا */}
            </span>
            {t("cart.addToCart")}
          </span>
        </button>
      </div>
      {/* إطار متدرج عند المرور */}
      <div className="absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-blue-400/30 group-hover:shadow-lg transition-colors duration-300 pointer-events-none"></div>
    </div>
  );
};

export default ProductCard;
