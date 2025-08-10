import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useCart } from "../../context/CartContext";

const Cart = () => {
  const [cartData, setCartData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [shippingForm, setShippingForm] = useState({
    address_en: "",
    address_ar: "",
    city_en: "",
    city_ar: "",
    country_en: "",
    country_ar: "",
    postalCode: "",
    notes: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const language = i18n.language === "ar" ? "ar" : "en";
  const { clearCart, removeFromCart } = useCart();

  // جلب السلة من الـ API
  const fetchCart = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        "https://e-commerce-back-end-kappa.vercel.app/api/cart",
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) throw new Error("فشل جلب السلة");
      const data = await res.json();
      setCartData(data.data || data.cart || data);
    } catch {
      setCartData(null);
      toast.error("فشل جلب السلة", {
        icon: "❌",
        style: { background: "#dc2626", color: "#ffffff" },
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // حذف منتج من السلة
  const handleRemoveItem = async (productId, sku) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `https://e-commerce-back-end-kappa.vercel.app/api/cart/${productId}/${sku}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) throw new Error("فشل حذف المنتج");
      toast.success("تم حذف المنتج من السلة", {
        icon: "🛒",
        style: { background: "#10b981", color: "#ffffff" },
      });
      await fetchCart();
      removeFromCart(productId); // تحديث السلة محلياً
      window.dispatchEvent(new Event("cartUpdated"));
    } catch {
      toast.error("حدث خطأ أثناء حذف المنتج", {
        icon: "❌",
        style: { background: "#dc2626", color: "#ffffff" },
      });
    }
  };

  // تعديل الكمية
  const handleUpdateQuantity = async (productId, sku, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `https://e-commerce-back-end-kappa.vercel.app/api/cart/${productId}/${sku}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ quantity: newQuantity }),
        }
      );
      if (!res.ok) throw new Error("فشل تعديل الكمية");
      await fetchCart();
      window.dispatchEvent(new Event("cartUpdated")); // تحديث عداد السلة في النافبار
    } catch {
      toast.error("حدث خطأ أثناء تعديل الكمية", {
        icon: "❌",
        style: { background: "#dc2626", color: "#ffffff" },
      });
    }
  };

  // حذف كل السلة
  const handleClearCart = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        "https://e-commerce-back-end-kappa.vercel.app/api/cart",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) throw new Error("فشل حذف السلة");
      toast.success("تم حذف كل السلة", {
        icon: "🛒",
        style: { background: "#10b981", color: "#ffffff" },
      });
      await fetchCart();
      clearCart(); // تصفير السلة محلياً
      // تحديث عداد السلة في النافبار
      window.dispatchEvent(new Event("cartUpdated"));
    } catch {
      toast.error("حدث خطأ أثناء حذف السلة", {
        icon: "❌",
        style: { background: "#dc2626", color: "#ffffff" },
      });
    }
  };

  // كوبون الخصم
  const handlePromoCode = () => {
    const validCodes = {
      SAVE10: 0.1,
      WELCOME20: 0.2,
      STUDENT15: 0.15,
    };
    if (validCodes[promoCode.toUpperCase()]) {
      setDiscount(validCodes[promoCode.toUpperCase()]);
      toast.success(
        `Promo code applied! ${(
          validCodes[promoCode.toUpperCase()] * 100
        ).toFixed(0)}% discount`,
        {
          icon: "🛒",
          style: { background: "#10b981", color: "#ffffff" },
        }
      );
    } else {
      toast.error("Invalid promo code", {
        icon: "❌",
        style: { background: "#dc2626", color: "#ffffff" },
      });
      setDiscount(0);
    }
  };

  // حساب الإجماليات
  const items = cartData?.items || [];
  const subtotal = items.reduce(
    (acc, item) => acc + (item.price || 0) * item.quantity,
    0
  );
  const discountAmount = subtotal * discount;
  const shipping = subtotal > 100 ? 0 : 9.99;
  const tax = (subtotal - discountAmount) * 0.08;
  const total = subtotal - discountAmount + shipping + tax;

  // دالة تحقق النموذج
  const validateShippingForm = () => {
    const errors = {};
    if (!shippingForm.address_en)
      errors.address_en = "Address (EN) is required";
    if (!shippingForm.address_ar) errors.address_ar = "العنوان بالعربية مطلوب";
    if (!shippingForm.city_en) errors.city_en = "City (EN) is required";
    if (!shippingForm.city_ar) errors.city_ar = "المدينة بالعربية مطلوبة";
    if (!shippingForm.country_en)
      errors.country_en = "Country (EN) is required";
    if (!shippingForm.country_ar) errors.country_ar = "الدولة بالعربية مطلوبة";
    if (!shippingForm.postalCode) errors.postalCode = "Postal code is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // دالة تنفيذ الطلب
  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    if (!validateShippingForm()) return;
    setIsCheckingOut(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        "https://e-commerce-back-end-kappa.vercel.app/api/orders",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            shippingAddress: {
              address: {
                en: shippingForm.address_en,
                ar: shippingForm.address_ar,
              },
              city: { en: shippingForm.city_en, ar: shippingForm.city_ar },
              country: {
                en: shippingForm.country_en,
                ar: shippingForm.country_ar,
              },
              postalCode: shippingForm.postalCode,
            },
            notes: shippingForm.notes,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Order failed");
      toast.success(t("profile.cancelSuccess", "تم إلغاء الطلب بنجاح"));
      await handleClearCart();
      setShowCheckoutModal(false);
      setIsCheckingOut(false);
      navigate("/profile");
    } catch (err) {
      toast.error(err.message || t("common.error"));
      setIsCheckingOut(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-xl">
        {t("common.loading")}
      </div>
    );
  }

  if (!items.length) {
    return (
      <div
        className="min-h-screen w-full flex items-center justify-center"
        style={{ background: "var(--primary-bg)" }}
      >
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex flex-col items-center justify-center text-center py-20">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center mb-8 shadow-lg border"
              style={{
                background: "var(--card-bg)",
                borderColor: "var(--card-border)",
              }}
            >
              <svg
                className="w-12 h-12"
                style={{ color: "var(--secondary-text)" }}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
            </div>
            <h2
              className="text-3xl font-bold mb-4 transition-colors"
              style={{ color: "var(--primary-text)" }}
            >
              {t("cart.empty")}
            </h2>
            <p
              className="text-lg mb-8 max-w-md transition-colors"
              style={{ color: "var(--secondary-text)" }}
            >
              {t("cart.continueShopping")}
            </p>
            <button
              className="px-8 py-4 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              style={{ background: "var(--gradient-primary)", color: "white" }}
              onClick={() => navigate("/")}
            >
              {t("cart.continueShopping")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen w-full transition-colors duration-300 mt-8"
      style={{ background: "var(--primary-bg)" }}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1
            className="text-4xl font-extrabold mb-2 transition-colors"
            style={{ color: "var(--primary-text)" }}
          >
            {t("cart.title")}
          </h1>
          <p
            className="transition-colors"
            style={{ color: "var(--secondary-text)" }}
          >
            {items.length} {t("cart.quantity")}
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2 flex flex-col gap-6">
            {items.map((item) => {
              const price = item.price || 0;
              const itemTotal = price * item.quantity;
              return (
                <div
                  key={item._id || item.id}
                  className="rounded-2xl shadow-lg border flex flex-col md:flex-row gap-4 p-6 items-center theme-card hover:shadow-xl transition-all duration-300"
                  style={{
                    borderColor: "var(--card-border)",
                    background: "var(--card-bg)",
                  }}
                >
                  {/* صورة المنتج */}
                  <div
                    className="w-24 h-24 flex items-center justify-center rounded-xl bg-[var(--secondary-bg)] border shrink-0"
                    style={{ borderColor: "var(--card-border)" }}
                  >
                    <img
                      src={item.images?.[0]?.url}
                      alt={item.productName?.[language]}
                      className="w-20 h-20 object-contain"
                    />
                  </div>
                  {/* معلومات المنتج */}
                  <div className="flex-1 flex flex-col gap-2 items-start md:items-start">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className="font-semibold text-lg"
                        style={{ color: "var(--primary-text)" }}
                      >
                        {item.productName?.[language] || item.productName}
                      </span>
                      {/* لون المنتج */}
                      {item.variant?.colorHex && (
                        <span
                          className="inline-block w-5 h-5 rounded-full border ml-1 align-middle"
                          style={{
                            background: item.variant.colorHex,
                            borderColor: "var(--card-border)",
                          }}
                          title={
                            item.variant.color?.[language] || item.variant.color
                          }
                        ></span>
                      )}
                    </div>
                    {item.variant?.label && (
                      <span
                        className="text-sm"
                        style={{ color: "var(--secondary-text)" }}
                      >
                        {item.variant.label[language] || item.variant.label}
                      </span>
                    )}
                    {item.variant?.color && (
                      <span
                        className="text-xs px-2 py-1 rounded-md"
                        style={{
                          background: "var(--secondary-bg)",
                          color: "var(--secondary-text)",
                        }}
                      >
                        {item.variant?.type?.[language] ||
                          item.variant?.type ||
                          ""}
                        : {item.variant.color[language] || item.variant.color}
                      </span>
                    )}
                  </div>
                  {/* السعر */}
                  <div className="flex flex-col items-center gap-2 min-w-[120px]">
                    <span
                      className="text-lg font-semibold"
                      style={{ color: "var(--primary-text)" }}
                    >
                      {price} {t("common.currency")}
                    </span>
                    <span
                      className="text-xl font-bold"
                      style={{ color: "var(--accent-text)" }}
                    >
                      {itemTotal} {t("common.currency")}
                    </span>
                  </div>
                  {/* التحكم في الكمية */}
                  <div className="flex items-center gap-2">
                    <button
                      className="w-9 h-9 rounded-full font-bold flex items-center justify-center shadow-sm border text-xl"
                      style={{
                        background: "var(--card-bg)",
                        color: "var(--secondary-text)",
                        borderColor: "var(--card-border)",
                      }}
                      onClick={() =>
                        handleUpdateQuantity(
                          item.productId,
                          item.sku,
                          item.quantity - 1
                        )
                      }
                      disabled={item.quantity <= 1}
                      title={t("cart.quantity")}
                    >
                      -
                    </button>
                    <span
                      className="w-10 text-center font-semibold text-lg"
                      style={{ color: "var(--primary-text)" }}
                    >
                      {item.quantity}
                    </span>
                    <button
                      className="w-9 h-9 rounded-full font-bold flex items-center justify-center shadow-sm border text-xl"
                      style={{
                        background: "var(--card-bg)",
                        color: "var(--secondary-text)",
                        borderColor: "var(--card-border)",
                      }}
                      onClick={() =>
                        handleUpdateQuantity(
                          item.productId,
                          item.sku,
                          item.quantity + 1
                        )
                      }
                      title={t("cart.quantity")}
                    >
                      +
                    </button>
                  </div>
                  {/* زر الحذف */}
                  <button
                    className="w-10 h-10 rounded-full flex items-center justify-center shadow-sm border transition-colors"
                    style={{
                      background: "#fee2e2",
                      color: "#ef4444",
                      borderColor: "#fecaca",
                    }}
                    onClick={() => handleRemoveItem(item.productId, item.sku)}
                    title={t("cart.remove")}
                  >
                    <svg
                      className="w-5 h-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polyline points="3,6 5,6 21,6" />
                      <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6" />
                    </svg>
                  </button>
                </div>
              );
            })}
            {/* أزرار أسفل المنتجات */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mt-6">
              <button
                className="px-6 py-3 text-white font-semibold rounded-lg transition-colors"
                style={{ background: "#ef4444" }}
                onClick={handleClearCart}
              >
                {t("cart.clearCart")}
              </button>
              <button
                className="px-6 py-3 font-semibold transition-colors"
                style={{ color: "var(--accent-text)" }}
                onClick={() => navigate("/")}
              >
                {t("cart.continueShopping")}
              </button>
            </div>
          </div>
          {/* ملخص السلة */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl shadow-lg border p-6 sticky top-8 transition-all duration-300 theme-card flex flex-col gap-6">
              <h3
                className="text-2xl font-bold mb-6"
                style={{ color: "var(--primary-text)" }}
              >
                {t("cart.title")}
              </h3>
              <div className="mb-6">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder={
                      t("cart.promoPlaceholder") ||
                      t("cart.apply") ||
                      "Enter promo code"
                    }
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    style={{
                      background: "var(--input-bg)",
                      color: "var(--primary-text)",
                      borderColor: "var(--input-border)",
                    }}
                  />
                  <button
                    onClick={handlePromoCode}
                    className="px-6 py-3 font-semibold rounded-lg transition-colors"
                    style={{ background: "var(--accent-text)", color: "white" }}
                  >
                    {t("cart.apply")}
                  </button>
                </div>
              </div>
              <div className="space-y-4 mb-6">
                <div
                  className="flex justify-between"
                  style={{ color: "var(--secondary-text)" }}
                >
                  <span>
                    {t("cart.subtotal")} ({items.length} {t("cart.quantity")})
                  </span>
                  <span
                    className="font-semibold"
                    style={{ color: "var(--primary-text)" }}
                  >
                    {subtotal.toFixed(2)} {t("common.currency")}
                  </span>
                </div>
                {discount > 0 && (
                  <div
                    className="flex justify-between"
                    style={{ color: "#22c55e" }}
                  >
                    <span>
                      {t("cart.discount") || "Discount"} (
                      {(discount * 100).toFixed(0)}%)
                    </span>
                    <span className="font-semibold">
                      -{discountAmount.toFixed(2)} {t("common.currency")}
                    </span>
                  </div>
                )}
                <div
                  className="flex justify-between"
                  style={{ color: "var(--secondary-text)" }}
                >
                  <span>{t("cart.shipping")}</span>
                  <span
                    className="font-semibold"
                    style={{ color: "var(--primary-text)" }}
                  >
                    {shipping === 0
                      ? t("cart.free")
                      : `${shipping.toFixed(2)} ${t("common.currency")}`}
                  </span>
                </div>
                <div
                  className="flex justify-between"
                  style={{ color: "var(--secondary-text)" }}
                >
                  <span>{t("cart.tax")}</span>
                  <span
                    className="font-semibold"
                    style={{ color: "var(--primary-text)" }}
                  >
                    {tax.toFixed(2)} {t("common.currency")}
                  </span>
                </div>
                <div
                  className="border-t pt-4"
                  style={{ borderColor: "var(--card-border)" }}
                >
                  <div
                    className="flex justify-between text-xl font-bold"
                    style={{ color: "var(--primary-text)" }}
                  >
                    <span>{t("cart.total")}</span>
                    <span>
                      {total.toFixed(2)} {t("common.currency")}
                    </span>
                  </div>
                </div>
              </div>
              <button
                className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-300 ${
                  isCheckingOut
                    ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                    : ""
                }`}
                style={
                  isCheckingOut
                    ? {
                        background: "var(--card-border)",
                        color: "var(--secondary-text)",
                      }
                    : { background: "var(--gradient-primary)", color: "white" }
                }
                onClick={() => setShowCheckoutModal(true)}
                disabled={isCheckingOut}
              >
                {isCheckingOut ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {t("cart.processing") || "Processing..."}
                  </div>
                ) : (
                  t("cart.checkout")
                )}
              </button>
              <div
                className="flex items-center justify-center gap-2 mt-6 text-sm"
                style={{ color: "var(--secondary-text)" }}
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <circle cx="12" cy="16" r="1" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <span>
                  {language === "ar"
                    ? "دفع آمن 100%"
                    : "Secure checkout guaranteed"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* نموذج منبثق */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <form
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 w-full max-w-lg space-y-4 relative"
            onSubmit={handleOrderSubmit}
          >
            <button
              type="button"
              className="absolute top-4 right-4 text-slate-400 hover:text-red-500 text-xl"
              onClick={() => setShowCheckoutModal(false)}
            >
              ×
            </button>
            <h2
              className="text-2xl font-bold mb-4 text-center"
              style={{ color: "var(--primary-text)" }}
            >
              {t("cart.shipping")}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 text-sm font-semibold">
                  Address (EN)
                </label>
                <input
                  type="text"
                  className="theme-input w-full px-3 py-2 rounded-lg"
                  value={shippingForm.address_en}
                  onChange={(e) =>
                    setShippingForm((f) => ({
                      ...f,
                      address_en: e.target.value,
                    }))
                  }
                />
                {formErrors.address_en && (
                  <span className="text-red-500 text-xs">
                    {formErrors.address_en}
                  </span>
                )}
              </div>
              <div>
                <label className="block mb-1 text-sm font-semibold">
                  العنوان (AR)
                </label>
                <input
                  type="text"
                  className="theme-input w-full px-3 py-2 rounded-lg"
                  value={shippingForm.address_ar}
                  onChange={(e) =>
                    setShippingForm((f) => ({
                      ...f,
                      address_ar: e.target.value,
                    }))
                  }
                />
                {formErrors.address_ar && (
                  <span className="text-red-500 text-xs">
                    {formErrors.address_ar}
                  </span>
                )}
              </div>
              <div>
                <label className="block mb-1 text-sm font-semibold">
                  City (EN)
                </label>
                <input
                  type="text"
                  className="theme-input w-full px-3 py-2 rounded-lg"
                  value={shippingForm.city_en}
                  onChange={(e) =>
                    setShippingForm((f) => ({ ...f, city_en: e.target.value }))
                  }
                />
                {formErrors.city_en && (
                  <span className="text-red-500 text-xs">
                    {formErrors.city_en}
                  </span>
                )}
              </div>
              <div>
                <label className="block mb-1 text-sm font-semibold">
                  المدينة (AR)
                </label>
                <input
                  type="text"
                  className="theme-input w-full px-3 py-2 rounded-lg"
                  value={shippingForm.city_ar}
                  onChange={(e) =>
                    setShippingForm((f) => ({ ...f, city_ar: e.target.value }))
                  }
                />
                {formErrors.city_ar && (
                  <span className="text-red-500 text-xs">
                    {formErrors.city_ar}
                  </span>
                )}
              </div>
              <div>
                <label className="block mb-1 text-sm font-semibold">
                  Country (EN)
                </label>
                <input
                  type="text"
                  className="theme-input w-full px-3 py-2 rounded-lg"
                  value={shippingForm.country_en}
                  onChange={(e) =>
                    setShippingForm((f) => ({
                      ...f,
                      country_en: e.target.value,
                    }))
                  }
                />
                {formErrors.country_en && (
                  <span className="text-red-500 text-xs">
                    {formErrors.country_en}
                  </span>
                )}
              </div>
              <div>
                <label className="block mb-1 text-sm font-semibold">
                  الدولة (AR)
                </label>
                <input
                  type="text"
                  className="theme-input w-full px-3 py-2 rounded-lg"
                  value={shippingForm.country_ar}
                  onChange={(e) =>
                    setShippingForm((f) => ({
                      ...f,
                      country_ar: e.target.value,
                    }))
                  }
                />
                {formErrors.country_ar && (
                  <span className="text-red-500 text-xs">
                    {formErrors.country_ar}
                  </span>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="block mb-1 text-sm font-semibold">
                  Postal Code
                </label>
                <input
                  type="text"
                  className="theme-input w-full px-3 py-2 rounded-lg"
                  value={shippingForm.postalCode}
                  onChange={(e) =>
                    setShippingForm((f) => ({
                      ...f,
                      postalCode: e.target.value,
                    }))
                  }
                />
                {formErrors.postalCode && (
                  <span className="text-red-500 text-xs">
                    {formErrors.postalCode}
                  </span>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="block mb-1 text-sm font-semibold">
                  {t("cart.notes", "ملاحظات (اختياري)")}
                </label>
                <textarea
                  className="theme-input w-full px-3 py-2 rounded-lg"
                  value={shippingForm.notes}
                  onChange={(e) =>
                    setShippingForm((f) => ({ ...f, notes: e.target.value }))
                  }
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full mt-6 py-3 rounded-xl font-semibold text-lg theme-button-primary"
              disabled={isCheckingOut}
            >
              {isCheckingOut ? t("cart.processing") : t("cart.checkout")}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Cart;
