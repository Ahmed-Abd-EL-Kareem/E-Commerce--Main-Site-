import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
// حذف useTheme لأننا لا نستخدم theme هنا
// import { useTheme } from "../../context/ThemeContext";
import toast from "react-hot-toast";

const API_URL =
  "https://e-commerce-back-end-kappa.vercel.app/api/orders/myorders";

const OrdersTab = () => {
  const { t, i18n } = useTranslation();
  // const { theme } = useTheme(); // حذف theme
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("token");
    if (!token) {
      setError(
        t(
          "profile.noToken",
          "لم يتم العثور على رمز الدخول. يرجى تسجيل الدخول أولاً."
        )
      );
      setLoading(false);
      return;
    }
    fetch(API_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((data) => {
        setOrders(data.data?.orders || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [t, i18n.language]);

  // إضافة دالة إلغاء الطلب
  const handleCancelOrder = async (orderId) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `https://e-commerce-back-end-kappa.vercel.app/api/orders/${orderId}/cancel`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "خطأ في إلغاء الطلب");
      toast.success(t("profile.cancelSuccess", "تم إلغاء الطلب بنجاح"));
      // تحديث الطلبات محلياً بدون إعادة تحميل كامل
      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId
            ? {
                ...order,
                status: "cancelled",
                statusDisplay: {
                  ...order.statusDisplay,
                  [i18n.language]: t("profile.cancelled", "ملغي"),
                },
                statusText: t("profile.cancelled", "ملغي"),
              }
            : order
        )
      );
    } catch (err) {
      toast.error(err.message || t("common.error"));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <span className="text-lg text-blue-600 dark:text-blue-400 animate-pulse">
          {t("common.loading")}
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center py-12">
        <span className="text-lg text-red-600 dark:text-red-400">
          {t("common.error")}: {error}
        </span>
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="flex flex-col items-center py-12">
        <svg
          className="w-16 h-16 text-slate-400 dark:text-slate-500 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7M3 7l9 6 9-6"
          />
        </svg>
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
          {t("profile.noOrders", "لا توجد طلبات")}
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          {t("profile.noOrdersDesc", "لم تقم بأي طلبات بعد.")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
        {t("profile.orders", "الطلبات")}
      </h3>
      <div className="flex flex-col gap-6">
        {orders.map((order) => (
          <div
            key={order._id}
            className="rounded-2xl border shadow-lg p-6 mb-4"
            style={{
              background: "var(--card-bg)",
              borderColor: "var(--card-border)",
              color: "var(--primary-text)",
            }}
          >
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-2">
              <div>
                <span
                  className="font-semibold"
                  style={{ color: "var(--accent-text)" }}
                >
                  {t("profile.orderId", "رقم الطلب")}:{" "}
                </span>
                <span>{order._id}</span>
              </div>
              <div>
                <span className="font-semibold">
                  {t("profile.status", "الحالة")}:{" "}
                </span>
                <span style={{ color: "#eab308" }}>
                  {order.statusDisplay?.[i18n.language] || order.statusText}
                </span>
              </div>
              <div>
                <span className="font-semibold">
                  {t("profile.total", "الإجمالي")}:{" "}
                </span>
                <span style={{ color: "#22c55e", fontWeight: "bold" }}>
                  {order.totalOrderPrice} {t("common.currency")}
                </span>
              </div>
            </div>
            <div className="flex flex-col md:flex-row md:gap-8 mb-4">
              <div className="flex-1 mb-4 md:mb-0">
                <h4
                  className="font-semibold mb-2"
                  style={{ color: "var(--primary-text)" }}
                >
                  {t("profile.shippingAddress", "عنوان الشحن")}
                </h4>
                <div
                  style={{ color: "var(--secondary-text)", fontSize: "0.95em" }}
                >
                  <div>
                    {order.shippingAddress?.address?.[i18n.language] || "-"}
                  </div>
                  <div>
                    {order.shippingAddress?.city?.[i18n.language] || "-"},{" "}
                    {order.shippingAddress?.country?.[i18n.language] || "-"}
                  </div>
                  <div>{order.shippingAddress?.postalCode}</div>
                </div>
              </div>
              <div className="flex-1">
                <h4
                  className="font-semibold mb-2"
                  style={{ color: "var(--primary-text)" }}
                >
                  {t("profile.payment", "الدفع")}
                </h4>
                <div
                  style={{ color: "var(--secondary-text)", fontSize: "0.95em" }}
                >
                  <div>
                    {t("profile.paymentMethod", "طريقة الدفع")}:{" "}
                    {order.paymentMethodDisplay?.[i18n.language] ||
                      order.paymentMethodText}
                  </div>
                  <div>
                    {t("profile.paymentStatus", "حالة الدفع")}:{" "}
                    {order.paymentStatusDisplay?.[i18n.language] ||
                      order.paymentStatusText}
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h4
                className="font-semibold mb-2"
                style={{ color: "var(--primary-text)" }}
              >
                {t("profile.items", "المنتجات")}
              </h4>
              <div className="overflow-x-auto">
                <table
                  className="min-w-full divide-y text-sm"
                  style={{ borderColor: "var(--card-border)" }}
                >
                  <thead>
                    <tr>
                      <th
                        className="px-2 py-2 font-semibold"
                        style={{ color: "var(--secondary-text)" }}
                      >
                        {t("profile.product", "المنتج")}
                      </th>
                      <th
                        className="px-2 py-2 font-semibold"
                        style={{ color: "var(--secondary-text)" }}
                      >
                        {t("profile.quantity", "الكمية")}
                      </th>
                      <th
                        className="px-2 py-2 font-semibold"
                        style={{ color: "var(--secondary-text)" }}
                      >
                        {t("profile.price", "السعر")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(order.items || order.cartItems || []).map((item, idx) => (
                      <tr
                        key={item._id || idx}
                        style={{ borderBottom: `1px solid var(--card-border)` }}
                      >
                        <td className="px-2 py-2 flex items-center gap-2">
                          {item.product?.images?.[0]?.url && (
                            <img
                              src={item.product.images[0].url}
                              alt={
                                item.product.images[0].altText?.[
                                  i18n.language
                                ] || "img"
                              }
                              className="w-10 h-10 rounded object-cover"
                              style={{ border: "1px solid var(--card-border)" }}
                            />
                          )}
                          <span>
                            {item.product?.name?.[i18n.language] ||
                              t("profile.deletedProduct", "منتج محذوف")}
                          </span>
                        </td>
                        <td className="px-2 py-2">{item.quantity}</td>
                        <td className="px-2 py-2">
                          {item.price} {t("common.currency")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <span
                style={{ color: "var(--secondary-text)", fontSize: "0.85em" }}
              >
                {t("profile.orderedAt", "تاريخ الطلب")}:{" "}
                {new Date(order.createdAt).toLocaleString(i18n.language)}
              </span>
            </div>
            {/* زر إلغاء الطلب في الأسفل */}
            {order.status === "pending" && (
              <div
                className="flex"
                style={{
                  justifyContent:
                    i18n.language === "ar" ? "flex-start" : "flex-end",
                  marginTop: "1.5rem",
                }}
              >
                <button
                  onClick={() => handleCancelOrder(order._id)}
                  className="flex items-center gap-2 px-7 py-2 rounded-full text-base font-bold border transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-red-300 hover:scale-105 active:scale-95"
                  style={{
                    background:
                      "linear-gradient(90deg, #fee2e2 60%, #fecaca 100%)",
                    color: "#ef4444",
                    borderColor: "#fecaca",
                    boxShadow: "0 2px 8px rgba(239,68,68,0.08)",
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  {t("profile.cancelOrder", "إلغاء الطلب")}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrdersTab;
