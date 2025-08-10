import React, { createContext, useContext, useReducer, useEffect } from "react";

const CartContext = createContext();

// Cart reducer to handle all cart actions
const cartReducer = (state, action) => {
  switch (action.type) {
    case "SET_CART":
      return {
        ...state,
        items: action.payload || [],
      };
    default:
      return state;
  }
};

// Initial cart state
const initialState = {
  items: [],
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // جلب السلة من الـ API
  const fetchCart = async () => {
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
      const items = data.data?.items || data.cart?.items || data.items || [];
      dispatch({ type: "SET_CART", payload: items });
    } catch {
      dispatch({ type: "SET_CART", payload: [] });
    }
  };

  // تحميل السلة عند أول تحميل
  useEffect(() => {
    fetchCart();
    // الاستماع لتحديث السلة من أماكن أخرى
    const handleCartUpdated = () => fetchCart();
    window.addEventListener("cartUpdated", handleCartUpdated);
    return () => window.removeEventListener("cartUpdated", handleCartUpdated);
  }, []);

  // إضافة منتج للسلة
  const addToCart = async (product) => {
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
            items: [
              {
                product: product.id,
                sku: product.sku || "",
                quantity: product.quantity || 1,
              },
            ],
          }),
        }
      );
      if (!res.ok) throw new Error("فشل الإضافة للسلة");
      await fetchCart();
      window.dispatchEvent(new Event("cartUpdated"));
    } catch {
      // لا شيء
    }
  };

  // حذف منتج من السلة
  const removeFromCart = async (productId, sku) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `https://e-commerce-back-end-kappa.vercel.app/api/cart/${productId}/${
          sku || ""
        }`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) throw new Error("فشل حذف المنتج");
      await fetchCart();
      window.dispatchEvent(new Event("cartUpdated"));
    } catch {
      // لا شيء
    }
  };

  // تعديل الكمية
  const updateQuantity = async (productId, sku, quantity) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `https://e-commerce-back-end-kappa.vercel.app/api/cart/${productId}/${
          sku || ""
        }`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ quantity }),
        }
      );
      if (!res.ok) throw new Error("فشل تعديل الكمية");
      await fetchCart();
      window.dispatchEvent(new Event("cartUpdated"));
    } catch {
      // لا شيء
    }
  };

  // تصفير السلة
  const clearCart = async () => {
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
      await fetchCart();
      window.dispatchEvent(new Event("cartUpdated"));
    } catch {
      // لا شيء
    }
  };

  // حساب الإجمالي
  const getCartTotal = () => {
    return state.items.reduce((total, item) => {
      const price =
        typeof item.price === "string"
          ? parseFloat(item.price.replace(/[^0-9.-]+/g, ""))
          : item.price || 0;
      return total + price * item.quantity;
    }, 0);
  };

  // عدد المنتجات في السلة
  const getCartCount = () => {
    return state.items.reduce((count, item) => count + (item.quantity || 0), 0);
  };

  // كمية منتج معين
  const getItemQuantity = (productId) => {
    const item = state.items.find(
      (item) => item.productId === productId || item.id === productId
    );
    return item ? item.quantity : 0;
  };

  // هل المنتج موجود في السلة
  const isInCart = (productId) => {
    return state.items.some(
      (item) => item.productId === productId || item.id === productId
    );
  };

  const value = {
    items: state.items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartCount,
    getItemQuantity,
    isInCart,
    fetchCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
