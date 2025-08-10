import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  EffectCards,
  Autoplay,
  Mousewheel,
  Keyboard,
  Pagination,
} from "swiper/modules";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import {
  useLanguage,
  getLocalizedText,
  getDirectionalClass,
  getTextAlignment,
} from "../../utils/languageUtils";
import "swiper/css";
import "swiper/css/effect-cards";
import "swiper/css/pagination";

const NewHeroSection = () => {
  const { t } = useTranslation();
  const { language, isRTL } = useLanguage();
  const navigate = useNavigate();

  // Fetch hero products from API
  const fetchHeroProducts = async () => {
    try {
      console.log("Fetching all hero products...");
      const url = "https://e-commerce-back-end-kappa.vercel.app/api/product";
      console.log("Hero API URL:", url);

      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      console.log("All hero products result:", data.data);
      return data.data || [];
    } catch (error) {
      console.error("Error fetching hero products:", error);
      // Return fallback products if API fails
      return [
        {
          _id: "fallback-1",
          name: { en: "Premium Smartphone", ar: "هاتف ذكي مميز" },
          images: [
            "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop",
          ],
          basePrice: 2999,
          discountPercentage: 15,
          averageRating: 4.5,
          brand: { name: { en: "TechBrand", ar: "تيك براند" } },
          category: { name: { en: "Phones", ar: "الهواتف" } },
        },
        {
          _id: "fallback-2",
          name: { en: "Gaming Laptop", ar: "لابتوب للألعاب" },
          images: [
            "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400&h=400&fit=crop",
          ],
          basePrice: 5999,
          discountPercentage: 20,
          averageRating: 4.8,
          brand: { name: { en: "GameTech", ar: "جيم تيك" } },
          category: { name: { en: "Laptops", ar: "أجهزة الكمبيوتر المحمولة" } },
        },
        {
          _id: "fallback-3",
          name: { en: "Wireless Headphones", ar: "سماعات لاسلكية" },
          images: [
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
          ],
          basePrice: 899,
          discountPercentage: 10,
          averageRating: 4.3,
          brand: { name: { en: "AudioPro", ar: "أوديو برو" } },
          category: { name: { en: "Headphones", ar: "سماعات الرأس" } },
        },
        {
          _id: "fallback-4",
          name: { en: "Smart Watch", ar: "ساعة ذكية" },
          images: [
            "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
          ],
          basePrice: 1299,
          discountPercentage: 25,
          averageRating: 4.6,
          brand: { name: { en: "SmartWear", ar: "سمارت وير" } },
          category: { name: { en: "Smartwatches", ar: "الساعات الذكية" } },
        },
        {
          _id: "fallback-5",
          name: { en: "Gaming Console", ar: "جهاز ألعاب" },
          images: [
            "https://images.unsplash.com/photo-1486401899868-0e435ed85128?w=400&h=400&fit=crop",
          ],
          basePrice: 3999,
          discountPercentage: 12,
          averageRating: 4.7,
          brand: { name: { en: "GameBox", ar: "جيم بوكس" } },
          category: { name: { en: "Gaming", ar: "الألعاب" } },
        },
        {
          _id: "fallback-6",
          name: { en: "4K Monitor", ar: "شاشة 4K" },
          images: [
            "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&h=400&fit=crop",
          ],
          basePrice: 2499,
          discountPercentage: 18,
          averageRating: 4.4,
          brand: { name: { en: "DisplayTech", ar: "ديسبلاي تيك" } },
          category: { name: { en: "Monitors", ar: "الشاشات" } },
        },
      ];
    }
  };

  const { data: heroProducts = [], isLoading } = useQuery({
    queryKey: ["heroProducts"],
    queryFn: fetchHeroProducts,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleProductClick = (product) => {
    console.log("Product clicked:", product);
    // Use the original product ID from the API data
    const productId = product._id || product.id;
    navigate(`/product/${productId}`);
  };

  const getDiscountedPrice = (product) => {
    if (product.discountPercentage && product.discountPercentage > 0) {
      return (
        product.basePrice *
        (1 - product.discountPercentage / 100)
      ).toFixed(2);
    }
    return product.basePrice;
  };

  // Transform product data to match the expected format
  const transformProduct = (product) => {
    // Handle both API data and fallback data structures
    const productName =
      typeof product.name === "object"
        ? getLocalizedText(product.name, language, "")
        : product.name || "";

    const productBrand =
      typeof product.brand?.name === "object"
        ? getLocalizedText(product.brand.name, language, "")
        : product.brand?.name || "";

    const productCategory =
      typeof product.category?.name === "object"
        ? getLocalizedText(product.category.name, language, "")
        : product.category?.name || "";

    // Handle images array or single image
    let productImage = "";
    if (
      product.images &&
      Array.isArray(product.images) &&
      product.images.length > 0
    ) {
      productImage = product.images[0];
    } else if (product.imageUrl) {
      productImage = product.imageUrl;
    } else if (product.thumbnail) {
      productImage = product.thumbnail;
    }

    return {
      id: product._id,
      _id: product._id, // Keep original ID for navigation
      title: productName,
      thumbnail: productImage,
      price: product.basePrice || product.price || 0,
      discountPercentage: product.discountPercentage || 0,
      rating: product.averageRating || product.rating || 0,
      brand: productBrand,
      category: productCategory,
      // Keep original product data for navigation
      originalProduct: product,
    };
  };

  const transformedProducts = heroProducts.map(transformProduct);

  if (isLoading) {
    return (
      <section
        className="py-12 px-4"
        style={{ background: "var(--primary-bg)" }}
      >
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col items-center justify-center min-h-[500px] gap-4">
            <div
              className="w-12 h-12 border-4 rounded-full animate-spin"
              style={{
                borderColor: "var(--accent-text, #2563eb)",
                borderTopColor: "var(--accent-text, #2563eb)",
              }}
            />
            <p className="text-lg" style={{ color: "var(--secondary-text)" }}>
              {t("common.loading") || "Loading..."}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 px-4" style={{ background: "var(--primary-bg)" }}>
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="relative">
          {transformedProducts.length > 0 ? (
            <Swiper
              effect="cards"
              grabCursor={true}
              modules={[
                EffectCards,
                Autoplay,
                Mousewheel,
                Keyboard,
                Pagination,
              ]}
              autoplay={{ delay: 4000, disableOnInteraction: false }}
              loop={transformedProducts.length > 2}
              mousewheel={{ enabled: true }}
              keyboard={{ enabled: true }}
              pagination={{
                clickable: true,
                renderBullet: (index, className) =>
                  `<span class="${className} new-hero-pagination-bullet"></span>`,
                dynamicBullets: true,
                dynamicMainBullets: 3,
              }}
              speed={800}
              slidesPerView={1}
              watchSlidesProgress={true}
              onSlideChange={(swiper) =>
                console.log("Slide changed to:", swiper.activeIndex)
              }
              className="w-full max-w-sm mx-auto"
              dir={isRTL ? "rtl" : "ltr"}
            >
              {transformedProducts.map((product) => (
                <SwiperSlide key={product.id}>
                  <div
                    onClick={() =>
                      handleProductClick(product.originalProduct || product)
                    }
                    className="rounded-3xl shadow-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-3xl hover:-translate-y-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hero-product-card"
                  >
                    {/* Product Image */}
                    <div className="relative w-full h-48 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-700 dark:to-slate-800 rounded-t-3xl overflow-hidden">
                      {product.thumbnail ? (
                        <img
                          src={product.thumbnail}
                          alt={product.title}
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                          onError={(e) => {
                            e.target.src =
                              "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop";
                            e.target.onerror = null;
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-slate-600 dark:to-slate-700">
                          <span className="text-gray-500 dark:text-gray-400 text-sm">
                            {language === "ar" ? "لا توجد صورة" : "No Image"}
                          </span>
                        </div>
                      )}
                      {/* Discount Badge */}
                      {product.discountPercentage > 0 && (
                        <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                          -{product.discountPercentage}%
                        </div>
                      )}
                      {/* Rating Badge */}
                      <div className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                        <span>★</span>
                        <span>{product.rating}</span>
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="p-6 space-y-4">
                      {/* Brand & Category */}
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span className="font-medium">{product.brand}</span>
                        <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-xs">
                          {product.category}
                        </span>
                      </div>

                      {/* Product Title */}
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2 min-h-[3rem]">
                        {product.title}
                      </h3>

                      {/* Price Section */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-gray-900 dark:text-white">
                            {t("common.currency")}
                            {product.price}
                          </span>
                          {product.discountPercentage > 0 && (
                            <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                              {t("common.currency")}
                              {Math.round(
                                product.price /
                                  (1 - product.discountPercentage / 100)
                              )}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Add to Cart Button */}
                      <button
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Add to cart functionality here
                          console.log("Add to cart:", product);
                        }}
                      >
                        {t("cart.addToCart")}
                      </button>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <div
              className={`text-center p-6 bg-white dark:bg-slate-800 rounded-3xl shadow-2xl ${getTextAlignment(
                isRTL,
                "center"
              )}`}
            >
              <div className="w-24 h-24 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-12 h-12 text-slate-400 dark:text-slate-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
              <p className="text-lg text-slate-900 dark:text-white mb-2">
                {t("hero.noProducts") || "No hero products available."}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {language === "ar"
                  ? "جاري تحميل المنتجات..."
                  : "Loading products..."}
              </p>
            </div>
          )}
        </div>

        <div
          className={`text-center lg:text-left ${getTextAlignment(
            isRTL,
            "left"
          )}`}
        >
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-sm font-medium px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                {transformedProducts.length}{" "}
                {language === "ar" ? "منتج متاح" : "Products Available"}
              </span>
            </div>

            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight"
              style={{ color: "var(--primary-text)" }}
            >
              {language === "ar" ? (
                <>
                  اكتشف الإلكترونيات{" "}
                  <span
                    className="bg-clip-text text-transparent"
                    style={{
                      background:
                        "linear-gradient(to right, var(--accent-gradient-from, #2563eb), var(--accent-gradient-to, #7c3aed))",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    المميزة
                  </span>
                </>
              ) : (
                <>
                  Discover Premium{" "}
                  <span
                    className="bg-clip-text text-transparent"
                    style={{
                      background:
                        "linear-gradient(to right, var(--accent-gradient-from, #2563eb), var(--accent-gradient-to, #7c3aed))",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    Electronics
                  </span>
                </>
              )}
            </h1>

            <p
              className="text-lg md:text-xl leading-relaxed max-w-2xl mx-auto lg:mx-0"
              style={{ color: "var(--secondary-text)" }}
            >
              {language === "ar"
                ? "اكتشف مجموعتنا المختارة من التكنولوجيا المتطورة والإلكترونيات المميزة. من الهواتف الذكية إلى الأجهزة الذكية، اعثر على كل ما تحتاجه."
                : "Explore our curated collection of cutting-edge technology and premium electronics. From smartphones to smart devices, find everything you need."}
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate("/products")}
                aria-label={language === "ar" ? "تسوق الآن" : "Shop Now"}
                className={`inline-flex items-center gap-3 font-semibold text-lg px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group ${getDirectionalClass(
                  "",
                  isRTL,
                  "flex-row-reverse",
                  "flex-row"
                )}`}
                style={{
                  background:
                    "linear-gradient(to right, var(--accent-gradient-from, #2563eb), var(--accent-gradient-to, #7c3aed))",
                  color: "white",
                }}
              >
                {language === "ar"
                  ? "تسوق الآن"
                  : t("hero.shopNow") || "Shop Now"}
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  className={`transition-transform duration-300 group-hover:translate-x-1 ${
                    isRTL ? "rotate-180" : ""
                  }`}
                >
                  <path
                    d="M6 12L10 8L6 4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              <button
                onClick={() => navigate("/products")}
                aria-label={
                  language === "ar" ? "عرض جميع المنتجات" : "View All Products"
                }
                className="inline-flex items-center gap-3 font-semibold text-lg px-8 py-4 rounded-full border-2 transition-all duration-300 hover:-translate-y-1"
                style={{
                  borderColor: "var(--accent-text, #2563eb)",
                  color: "var(--accent-text, #2563eb)",
                  background: "transparent",
                }}
              >
                {language === "ar" ? "عرض جميع المنتجات" : "View All Products"}
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  className={`transition-transform duration-300 group-hover:translate-x-1 ${
                    isRTL ? "rotate-180" : ""
                  }`}
                >
                  <path
                    d="M6 12L10 8L6 4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .new-hero-pagination-bullet {
          width: 10px;
          height: 10px;
          background: rgba(37, 99, 235, 0.3);
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .new-hero-pagination-bullet:hover {
          background: rgba(37, 99, 235, 0.6);
          transform: scale(1.2);
        }
        
        .new-hero-pagination-bullet.swiper-pagination-bullet-active {
          background: rgba(37, 99, 235, 0.9);
          transform: scale(1.3);
        }
      `}</style>
    </section>
  );
};

export default NewHeroSection;
