import React from "react";

const USER_ID = "68491edde1d3d434b3eeed3b"; // ثابت حسب طلبك

const ProductCard = ({ product, language, t, navigate }) => {
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
      const res = await fetch("http://127.0.0.1:3000/api/cart", {
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

  return (
    <div
      key={product._id}
      className="recommendation-card"
      style={{ position: "relative", cursor: "pointer" }}
      onClick={() => navigate(`/product/${product._id}`)}
    >
      {/* شارة التصنيف */}
      <span
        style={{
          position: "absolute",
          top: "16px",
          left: "16px",
          background: "#2563eb",
          color: "#fff",
          borderRadius: "20px",
          padding: "4px 18px",
          fontWeight: 600,
          fontSize: "0.95rem",
          boxShadow: "0 2px 8px rgba(37,99,235,0.10)",
          zIndex: 2,
        }}
      >
        {categoryName}
      </span>
      <div className="recommendation-image-wrapper">
        <img src={imageUrl} alt={imageAlt} className="recommendation-image" />
        {discount > 0 && <span className="discount-badge">-{discount}%</span>}
      </div>
      {/* ألوان المتغيرات الفريدة */}
      {uniqueColors.length > 0 && (
        <div
          style={{
            display: "flex",
            gap: 6,
            margin: "8px 0 0 0",
            justifyContent: "center",
          }}
        >
          {uniqueColors.map((color) => (
            <span
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
              style={{
                display: "inline-block",
                width: 20,
                height: 20,
                borderRadius: "50%",
                background: color.colorHex,
                border:
                  selectedColorHex === color.colorHex
                    ? "2.5px solid #2563eb"
                    : "1.5px solid #aaa",
                marginInlineEnd: 4,
                cursor: "pointer",
                boxShadow:
                  selectedColorHex === color.colorHex
                    ? "0 2px 8px #2563eb22"
                    : undefined,
              }}
            ></span>
          ))}
        </div>
      )}
      <div className="recommendation-info">
        <div className="brand-row">
          <span className="recommendation-brand">{brandName}</span>
        </div>
        <span className="recommendation-title">
          {typeof product.name === "object"
            ? product.name[language] ||
              product.name["en"] ||
              product.name["ar"] ||
              ""
            : product.name || ""}
        </span>
      </div>
      <div className="price-row">
        <span className="recommendation-price">
          {priceAfterDiscount} {t("common.currency")}
        </span>
        {oldPrice && (
          <span
            className="recommendation-price old"
            style={{
              textDecoration: "line-through",
              color: "#888",
              marginInlineStart: 8,
            }}
          >
            {oldPrice} {t("common.currency")}
          </span>
        )}
      </div>
      <button className="add-to-cart-btn" onClick={handleAddToCart}>
        {t("cart.addToCart")}
      </button>
    </div>
  );
};

export default ProductCard;
