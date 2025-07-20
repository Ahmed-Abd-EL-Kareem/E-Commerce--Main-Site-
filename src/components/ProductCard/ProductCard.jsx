import React from "react";

const USER_ID = "68491edde1d3d434b3eeed3b"; // ثابت حسب طلبك

const ProductCard = ({ product, language, t, navigate, viewMode = 'grid' }) => {
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
      ? featuredImage.altText[language] ||
        featuredImage.altText["en"] ||
        featuredImage.altText["ar"] ||
        ""
      : featuredImage?.altText || "";
  const brandName =
    typeof product.brand?.name === "object"
      ? product.brand.name[language] ||
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
      ? product.category.name[language] ||
        product.category.name["en"] ||
        product.category.name["ar"] ||
        ""
      : product.category?.name || "";

  // دالة إضافة للسلة
  const handleAddToCart = async (e) => {
    e.stopPropagation();
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      alert(
        language === "ar"
          ? "تمت الإضافة للسلة بنجاح"
          : "Added to cart successfully"
      );
    } catch {
      alert(
        language === "ar"
          ? "حدث خطأ أثناء الإضافة للسلة"
          : "Error adding to cart"
      );
    }
  };

  // List View Layout
  if (viewMode === 'list') {
    return (
      <div
        className="group relative bg-white dark:bg-slate-800 rounded-2xl shadow-md hover:shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden transition-all duration-300 hover:-translate-y-1 cursor-pointer"
        style={{ 
          background: 'var(--card-bg)',
          borderColor: 'var(--card-border)',
          minHeight: '160px'
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
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)'
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
                    background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
                    boxShadow: '0 2px 8px rgba(255, 107, 107, 0.3)'
                  }}
                >
                  -{discount}%
                </span>
              </div>
            )}

            {/* Quick Actions - Compact */}
            <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
              <button className="w-6 h-6 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200 hover:scale-110">
                <svg className="w-3 h-3 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
              <button className="w-6 h-6 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200 hover:scale-110">
                <svg className="w-3 h-3 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
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
              <h3 className="text-base font-bold leading-tight line-clamp-2" style={{ color: 'var(--primary-text)' }}>
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
                          ? 'ring-2 ring-blue-500 ring-offset-1' 
                          : 'hover:ring-1 hover:ring-slate-300'
                      }`}
                      style={{
                        background: color.colorHex,
                        boxShadow: selectedColorHex === color.colorHex 
                          ? '0 0 0 1px #3b82f6, 0 2px 6px rgba(59, 130, 246, 0.3)' 
                          : '0 1px 3px rgba(0, 0, 0, 0.1)'
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
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
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
      className="group relative bg-white dark:bg-slate-800 rounded-3xl shadow-lg hover:shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden transition-all duration-500 hover:-translate-y-2 cursor-pointer transform hover:scale-[1.02]"
      style={{ 
        background: 'var(--card-bg)',
        borderColor: 'var(--card-border)',
        minHeight: '420px'
      }}
      onClick={() => navigate(`/product/${product._id}`)}
    >
      {/* Category Badge */}
      <div className="absolute top-4 left-4 z-20">
        <span
          className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold text-white shadow-lg"
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
          }}
        >
          {categoryName}
        </span>
      </div>

      {/* Discount Badge */}
      {discount > 0 && (
        <div className="absolute top-4 right-4 z-20">
          <span
            className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold text-white shadow-lg animate-pulse"
            style={{
              background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
              boxShadow: '0 4px 15px rgba(255, 107, 107, 0.4)'
            }}
          >
            -{discount}%
          </span>
        </div>
      )}

      {/* Image Container */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800">
        <div className="aspect-square relative">
          <img 
            src={imageUrl} 
            alt={imageAlt} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            style={{ minHeight: '280px' }}
          />
          
          {/* Image Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>

        {/* Quick Actions Overlay */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
          <button className="w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110">
            <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
          <button className="w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110">
            <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
            </svg>
          </button>
        </div>
      </div>

      {/* Color Variants */}
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
                className={`w-6 h-6 rounded-full transition-all duration-200 hover:scale-110 ${
                  selectedColorHex === color.colorHex 
                    ? 'ring-2 ring-blue-500 ring-offset-2' 
                    : 'hover:ring-2 hover:ring-slate-300'
                }`}
                style={{
                  background: color.colorHex,
                  boxShadow: selectedColorHex === color.colorHex 
                    ? '0 0 0 2px #3b82f6, 0 4px 12px rgba(59, 130, 246, 0.3)' 
                    : '0 2px 8px rgba(0, 0, 0, 0.1)'
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-5 space-y-3">
        {/* Brand */}
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

        {/* Product Name */}
        <h3 className="text-lg font-bold leading-tight line-clamp-2" style={{ color: 'var(--primary-text)' }}>
          {typeof product.name === "object"
            ? product.name[language] ||
              product.name["en"] ||
              product.name["ar"] ||
              ""
            : product.name || ""}
        </h3>

        {/* Rating */}
        {product.averageRating && (
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-4 h-4 ${
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
            <span className="text-sm text-slate-500 dark:text-slate-400">
              ({product.averageRating})
            </span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold text-green-600 dark:text-green-400">
            {priceAfterDiscount} {t("common.currency")}
          </span>
          {oldPrice && (
            <span
              className="text-lg text-slate-400 dark:text-slate-500 line-through"
            >
              {oldPrice} {t("common.currency")}
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        <button 
          className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95"
          onClick={handleAddToCart}
        >
          <span className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
            </svg>
            {t("cart.addToCart")}
          </span>
        </button>
      </div>

      {/* Hover Effect Border */}
      <div className="absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-blue-500/20 transition-colors duration-300 pointer-events-none"></div>
    </div>
  );
};

export default ProductCard;
