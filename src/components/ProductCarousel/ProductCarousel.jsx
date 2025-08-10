import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { useTranslation } from "react-i18next";
import { useCart } from "../../context/CartContext";
import toast from "react-hot-toast";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import { swiperConfigs, createSwiperConfig } from "../../utils/swiperConfig";

const ProductCarousel = ({
  products,
  onProductClick,
  className = "",
  showNavigation = true,
  showPagination = false,
  autoplay = true,
  customConfig = {},
}) => {
  const { t, i18n } = useTranslation();
  const { addToCart, isInCart, getItemQuantity } = useCart();
  const isRTL = i18n.language === "ar";

  const swiperConfig = createSwiperConfig(
    swiperConfigs.products,
    {
      ...customConfig,
      autoplay: autoplay ? swiperConfigs.products.autoplay : false,
    },
    isRTL
  );

  const getReviewCount = (product) => {
    return Math.floor(Math.random() * 500) + 50;
  };

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    const cartProduct = {
      id: product.id,
      name: product.title,
      price: `$${product.price}`,
      basePrice: `$${product.basePrice}`,
      image: product.thumbnail,
      category: product.category,
      brand: product.brand,
    };
    addToCart(cartProduct);
    toast.success(t("cart.addedToCart", { product: product.title }), {
      icon: "🛒",
      style: {
        background: "#10b981",
        color: "#ffffff",
      },
    });
  };

  return (
    <div className={`relative w-full my-8 ${className}`}>
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        {...swiperConfig}
        navigation={
          showNavigation
            ? {
                nextEl: ".product-swiper-button-next",
                prevEl: ".product-swiper-button-prev",
              }
            : false
        }
        pagination={
          showPagination
            ? {
                el: ".product-swiper-pagination",
                clickable: true,
              }
            : false
        }
        className="w-full pb-6"
      >
        {products.map((product) => (
          <SwiperSlide key={product.id}>
            <div
              style={{
                background: "var(--primary-bg)",
                color: "var(--primary-text)",
              }}
              className="relative flex flex-col rounded-2xl shadow-md hover:shadow-[0_8px_32px_rgba(37,99,235,0.15)] border border-slate-200 dark:border-slate-700 p-6 transition-all duration-300 h-full overflow-hidden group cursor-pointer hover:-translate-y-1"
              onClick={() => onProductClick?.(product)}
            >
              {/* Top gradient bar on hover */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
              {/* Product Image */}
              <div className="relative w-full h-48 mb-6 flex items-center justify-center bg-slate-50 dark:bg-slate-900 rounded-xl overflow-hidden">
                <img
                  src={product.thumbnail}
                  alt={product.title}
                  className="max-w-[85%] max-h-[85%] object-contain transition-transform duration-300 group-hover:scale-105"
                />
                {product.salePrice && (
                  <div
                    className={`absolute top-3 ${
                      isRTL ? "right-3" : "left-3"
                    } bg-gradient-to-br from-red-500 to-red-700 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-[0_2px_8px_rgba(239,68,68,0.3)] z-20`}
                  >
                    -
                    {Math.round(
                      (product.salePrice /
                        (product.price + product.salePrice)) *
                        100
                    )}
                    %
                  </div>
                )}
              </div>
              {/* Product Info */}
              <div className="flex flex-col gap-3 flex-1">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-blue-600 dark:text-blue-400 font-semibold uppercase tracking-wide">
                    {product.brand}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-400">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M7 1L8.854 5.078L13 5.724L10 8.84L10.708 13L7 11.078L3.292 13L4 8.84L1 5.724L5.146 5.078L7 1Z"
                        fill="#FFC107"
                        stroke="#FFC107"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span>{product.rating}</span>
                    <span className="ml-1">({getReviewCount(product)})</span>
                  </div>
                </div>
                <h3
                  style={{ color: "var(--primary-text)" }}
                  className="text-base font-semibold mb-2 leading-tight line-clamp-2 min-h-[2.8em]"
                >
                  {product.title}
                </h3>
                <div className="flex items-center gap-3 mb-4 flex-wrap">
                  <span className="font-bold text-lg text-blue-600 dark:text-blue-400">
                    {t("common.currency")}
                    {product.price}
                  </span>
                  {product.salePrice && (
                    <span className="text-base text-slate-400 line-through">
                      {t("common.currency")}
                      {product.price + product.salePrice}
                    </span>
                  )}
                </div>
                <button
                  className={`flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl w-full min-h-[44px] uppercase tracking-wide transition-all duration-300 mt-auto shadow-[0_2px_8px_rgba(37,99,235,0.2)] bg-gradient-to-br ${
                    isInCart(product.id)
                      ? "from-emerald-500 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white"
                      : "from-blue-600 to-blue-400 hover:from-blue-900 hover:to-blue-600 text-white"
                  } hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(37,99,235,0.3)]`}
                  onClick={(e) => handleAddToCart(e, product)}
                >
                  {isInCart(product.id)
                    ? `${t("cart.inCart")} (${getItemQuantity(product.id)})`
                    : t("cart.addToCart")}
                </button>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      {showNavigation && (
        <>
          <div
            className={`product-swiper-button-prev product-swiper-button absolute top-1/2 -translate-y-1/2 left-[-22px] z-10 w-12 h-12 bg-white/95 dark:bg-slate-800/95 border border-slate-200 dark:border-slate-700 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 shadow-lg backdrop-blur-[10px] hover:bg-white hover:scale-110 hover:shadow-xl ${
              isRTL ? "right-[-22px] left-auto" : ""
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              className="w-5 h-5 text-orange-500"
            >
              <polyline points="15,18 9,12 15,6"></polyline>
            </svg>
          </div>
          <div
            className={`product-swiper-button-next product-swiper-button absolute top-1/2 -translate-y-1/2 right-[-22px] z-10 w-12 h-12 bg-white/95 dark:bg-slate-800/95 border border-slate-200 dark:border-slate-700 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 shadow-lg backdrop-blur-[10px] hover:bg-white hover:scale-110 hover:shadow-xl ${
              isRTL ? "left-[-22px] right-auto" : ""
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              className="w-5 h-5 text-orange-500"
            >
              <polyline points="9,18 15,12 9,6"></polyline>
            </svg>
          </div>
        </>
      )}
      {showPagination && (
        <div className="product-swiper-pagination mt-4 flex justify-center"></div>
      )}
    </div>
  );
};

export default ProductCarousel;
