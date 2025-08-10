import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useCategory } from "../../context/CategoryContext";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Loading from "../../components/Loading/Loading";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import ProductCard from "../../components/ProductCard/ProductCard";

const MAX_PRICE = 47000;
const MIN_PRICE = 0;
const BRANDS_TO_SHOW = 5;

const Products = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);

  // Extract category from URL params and ensure it's a string
  let categoryFromUrl = params.get("category") || "all";
  if (typeof categoryFromUrl === "object") {
    categoryFromUrl = categoryFromUrl.en || categoryFromUrl.ar || "all";
  }
  const categorySlug = categoryFromUrl.toLowerCase();

  const { setSelectedCategory } = useCategory();
  const { t, i18n } = useTranslation();
  const language = i18n.language === "ar" ? "ar" : "en";

  // --- فلترة ---
  const [selectedBrands, setSelectedBrands] = React.useState([]);
  const [priceRange, setPriceRange] = React.useState([0, 35000]);
  const [rating, setRating] = React.useState(0);
  const [brands, setBrands] = React.useState([]);
  const [viewMode, setViewMode] = useState("grid"); // Add view mode state

  // حالة ظهور الفلتر في الشاشات الصغيرة والمتوسطة
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  // حالة معرفة إذا الشاشة كبيرة أم لا
  const [isLargeScreen, setIsLargeScreen] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(min-width: 1200px)").matches
      : true
  );
  // تتبع الوضع الليلي/الفاتح
  const [themeMode, setThemeMode] = useState(() =>
    typeof document !== "undefined"
      ? document.documentElement.getAttribute("data-theme") || ""
      : ""
  );

  // Listen for view mode changes from SecondNavbar
  useEffect(() => {
    const handleViewModeChange = (event) => {
      setViewMode(event.detail.viewMode);
    };

    window.addEventListener("viewModeChanged", handleViewModeChange);
    return () => {
      window.removeEventListener("viewModeChanged", handleViewModeChange);
    };
  }, []);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setThemeMode(document.documentElement.getAttribute("data-theme") || "");
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);

  // تتبع حجم الشاشة في كل تغيير
  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1200px)");
    const handleChange = () => {
      setIsLargeScreen(mediaQuery.matches);
      console.log(
        "isLargeScreen:",
        mediaQuery.matches,
        "window.innerWidth:",
        window.innerWidth
      );
    };
    handleChange(); // تحديث عند mount
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // الاستماع لحدث الفلتر دائمًا في جميع الشاشات غير الكبيرة
  useEffect(() => {
    if (isLargeScreen) return;
    const toggleFilter = () => {
      console.log(
        "toggleProductFilter event received!",
        "isLargeScreen:",
        isLargeScreen,
        "window.innerWidth:",
        window.innerWidth
      );
      setIsFilterOpen((prev) => !prev);
    };
    window.addEventListener("toggleProductFilter", toggleFilter);
    return () =>
      window.removeEventListener("toggleProductFilter", toggleFilter);
  }, [isLargeScreen]);

  // منع تمرير الصفحة عند فتح الفلتر في الشاشات الصغيرة والمتوسطة
  useEffect(() => {
    if (!isLargeScreen && isFilterOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isLargeScreen, isFilterOpen]);

  // بناء رابط الفلترة
  const buildApiUrl = () => {
    // Ensure categorySlug is a string and handle edge cases
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

    let url = `https://e-commerce-back-end-kappa.vercel.app/api/product?categorySlug=${encodeURIComponent(
      categoryParam
    )}`;
    if (selectedBrands.length > 0) {
      url += `&brandSlug=${selectedBrands.join(",")}`;
    }
    if (priceRange[0] > MIN_PRICE) url += `&basePrice[gte]=${priceRange[0]}`;
    if (priceRange[1] < MAX_PRICE) url += `&basePrice[lte]=${priceRange[1]}`;
    if (rating > 0) url += `&averageRating[gte]=${rating}`;
    return url;
  };

  // جلب المنتجات حسب الفلاتر
  const fetchProducts = async () => {
    try {
      console.log(
        "Fetching products with categorySlug:",
        categorySlug,
        "type:",
        typeof categorySlug
      );
      const url = buildApiUrl();
      console.log("API URL:", url);
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      return data.data;
    } catch (error) {
      console.error("Error fetching products:", error);
      return [];
    }
  };

  // جلب المنتجات
  const { data: products, isLoading } = useQuery({
    queryKey: ["products", categorySlug, selectedBrands, priceRange, rating],
    queryFn: fetchProducts,
    keepPreviousData: true,
  });

  // جلب العلامات التجارية من API
  React.useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await fetch(
          "https://e-commerce-back-end-kappa.vercel.app/api/brand"
        );
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        setBrands(data.data.brands || []);
      } catch (error) {
        console.error("Error fetching brands:", error);
        setBrands([]);
      }
    };
    fetchBrands();
  }, []);

  React.useEffect(() => {
    setSelectedCategory(categorySlug);
  }, [categorySlug, setSelectedCategory]);

  // تحديث الفلاتر من الـ URL عند التحميل الأولي
  React.useEffect(() => {
    // Brands
    const brandsParam = params.get("brands") || params.get("Brands");
    if (brandsParam) {
      setSelectedBrands(brandsParam.split(","));
    } else {
      setSelectedBrands([]);
    }
    // Price
    const minPrice = params.get("minPrice");
    const maxPrice = params.get("maxPrice");
    if (minPrice || maxPrice) {
      setPriceRange([
        minPrice ? Number(minPrice) : 0,
        maxPrice ? Number(maxPrice) : 35000,
      ]);
    } else {
      setPriceRange([0, 35000]);
    }
    // Rating
    const ratingParam = params.get("rating");
    if (ratingParam) {
      setRating(Number(ratingParam));
    } else {
      setRating(0);
    }
    // eslint-disable-next-line
  }, [location.search]);

  // تحديث الـ URL عند تغيير الفلاتر
  React.useEffect(() => {
    const urlParams = new URLSearchParams();

    // Ensure category is a string
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

    urlParams.set("category", categoryParam);
    if (selectedBrands.length > 0) {
      urlParams.set("brands", selectedBrands.join(","));
    }
    if (priceRange[0] > MIN_PRICE) urlParams.set("minPrice", priceRange[0]);
    if (priceRange[1] < MAX_PRICE) urlParams.set("maxPrice", priceRange[1]);
    if (rating > 0) urlParams.set("rating", rating);
    const newUrl = `/products?${urlParams.toString()}`;
    if (location.pathname + location.search !== newUrl) {
      navigate(newUrl, { replace: true });
    }
    // eslint-disable-next-line
  }, [selectedBrands, priceRange, rating, categorySlug]);

  // --- واجهة الفلاتر ---
  const [showAllBrands, setShowAllBrands] = React.useState(false);
  const brandsToDisplay = showAllBrands
    ? brands
    : brands.slice(0, BRANDS_TO_SHOW);

  return (
    <div className="flex gap-8">
      {/* Overlay في الشاشات الصغيرة والمتوسطة */}
      {!isLargeScreen && (
        <div
          className={`fixed inset-0 bg-black/50 z-[9998] transition-opacity duration-300 ${
            isFilterOpen ? "block" : "hidden"
          }`}
          onClick={() => setIsFilterOpen(false)}
        ></div>
      )}
      {/* Sidebar في الشاشات الصغيرة والمتوسطة */}
      {!isLargeScreen && (
        <aside
          className={`fixed top-0 left-0 h-full w-[75vw] max-w-xs min-w-0 shadow-2xl flex flex-col gap-6 p-4
            transition-transform duration-300 z-[9999] border-none rounded-none overflow-y-auto
            ${
              isFilterOpen ? "translate-x-0" : "-translate-x-full"
            } sidebar-filters`}
          data-theme={themeMode}
          style={{ borderRadius: 0, background: "var(--card-bg)" }}
        >
          {/* زر إغلاق دائري صغير في الأعلى يمين */}
          <button
            className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center rounded-full border border-blue-600 bg-white text-blue-600 shadow hover:bg-blue-600 hover:text-white transition"
            onClick={() => setIsFilterOpen(false)}
            aria-label={language === "ar" ? "إغلاق الفلتر" : "Close filter"}
          >
            <span className="text-2xl">×</span>
          </button>
          {/* عنوان الفلتر */}
          <div className="sidebar-title text-lg font-bold text-blue-700 mb-4 text-center">
            {language === "ar" ? "فلترة المنتجات" : "Filter Products"}
          </div>
          {/* باقي عناصر الفلتر */}
          {/* العلامة التجارية */}
          <div
            className="mb-8 rounded-lg shadow-sm flex flex-col"
            style={{
              background: "var(--card-bg)",
              color: "var(--text)",
              border: "1px solid var(--border-color)",
              padding: "2rem",
            }}
          >
            <h3
              className="text-xl font-extrabold mb-4 border-b pb-2"
              style={{ borderColor: "var(--border-color)" }}
            >
              {language === "ar" ? "العلامات التجارية" : "Brands"}
            </h3>
            {brandsToDisplay.map((brand) => (
              <div key={brand.slug} className="mb-3 flex items-center">
                <label className="flex items-center cursor-pointer w-full text-lg gap-3">
                  <input
                    type="checkbox"
                    value={brand.slug}
                    checked={selectedBrands.includes(brand.slug)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedBrands((prev) =>
                          Array.from(new Set([...prev, brand.slug]))
                        );
                      } else {
                        setSelectedBrands((prev) =>
                          prev.filter((slug) => slug !== brand.slug)
                        );
                      }
                    }}
                    className="accent-blue-600 w-6 h-6 mr-2 border-2 border-gray-400 rounded"
                  />
                  {brand.logoUrl && (
                    <img
                      src={brand.logoUrl}
                      alt={brand.slug}
                      className="w-8 h-8 object-contain rounded bg-white mr-2 border"
                    />
                  )}
                  <span className="text-lg font-medium">
                    {typeof brand.name === "object"
                      ? brand.name[language] ||
                        brand.name["en"] ||
                        brand.name["ar"] ||
                        ""
                      : brand.name || ""}
                  </span>
                </label>
              </div>
            ))}
            {brands.length > BRANDS_TO_SHOW && (
              <button
                onClick={() => setShowAllBrands((prev) => !prev)}
                className="text-sm text-blue-600 hover:underline mt-2 font-semibold"
                style={{ color: "var(--primary-blue)" }}
              >
                {showAllBrands
                  ? language === "ar"
                    ? "عرض أقل"
                    : "Show Less"
                  : language === "ar"
                  ? "عرض المزيد"
                  : "Show More"}
              </button>
            )}
            <div>
              <button
                onClick={() => setSelectedBrands([])}
                className="mt-3 text-sm font-semibold px-4 py-2 rounded-full border border-blue-500 bg-blue-50 text-blue-700 transition-colors duration-200 hover:bg-blue-500 hover:text-white shadow-sm"
              >
                {language === "ar" ? "عرض المزيد" : "Show More"}
              </button>
            </div>
          </div>
          {/* السعر (شريط مزدوج) */}
          <div
            className="mb-8 rounded-lg shadow-sm flex flex-col"
            style={{
              background: "var(--card-bg)",
              color: "var(--text)",
              border: "1px solid var(--border-color)",
              padding: "2rem",
            }}
          >
            <h3
              className="text-xl font-extrabold mb-4 border-b pb-2"
              style={{ borderColor: "var(--border-color)" }}
            >
              {t("cart.price")}
            </h3>
            <div
              className="mb-4 text-base font-bold"
              style={{ color: "var(--text)" }}
            >
              {t("common.currency")} {priceRange[0]} – {t("common.currency")}{" "}
              {priceRange[1]}
            </div>
            <div className="px-2 py-4">
              <Slider
                range
                min={MIN_PRICE}
                max={MAX_PRICE}
                step={100}
                value={priceRange}
                onChange={(values) =>
                  setPriceRange([
                    Math.min(values[0], values[1]),
                    Math.max(values[0], values[1]),
                  ])
                }
                trackStyle={[
                  { backgroundColor: "var(--primary-blue)", height: 8 },
                ]}
                handleStyle={[
                  {
                    borderColor: "var(--primary-blue)",
                    height: 24,
                    width: 24,
                    marginTop: -8,
                    backgroundColor: "#fff",
                  },
                  {
                    borderColor: "var(--primary-blue)",
                    height: 24,
                    width: 24,
                    marginTop: -8,
                    backgroundColor: "#fff",
                  },
                ]}
                railStyle={{ backgroundColor: "#cbd5e1", height: 8 }}
              />
            </div>
          </div>
          {/* التقييم */}
          <div
            className="mb-8 rounded-lg shadow-sm flex flex-col"
            style={{
              background: "var(--card-bg)",
              color: "var(--text)",
              border: "1px solid var(--border-color)",
              padding: "2rem",
            }}
          >
            <h3
              className="text-xl font-extrabold mb-4 border-b pb-2"
              style={{ borderColor: "var(--border-color)" }}
            >
              {language === "ar" ? "التقييم" : "Rating"}
            </h3>
            <input
              type="range"
              min={0}
              max={5}
              step={0.5}
              value={rating}
              onChange={(e) => setRating(+e.target.value)}
              className="w-full h-3 rounded-lg accent-blue-600 bg-blue-500"
              style={{ accentColor: "var(--primary-blue)" }}
            />
            <div
              className="text-base mt-2 font-semibold"
              style={{ color: "var(--text)" }}
            >
              {rating}+
            </div>
          </div>
        </aside>
      )}
      {/* Sidebar في الشاشات الكبيرة */}
      {isLargeScreen && (
        <aside
          className="sidebar-filters sticky top-8 self-start min-w-[260px] max-h-[calc(100vh-40px)] h-[calc(100vh-40px)] flex flex-col shadow-xl z-10 overflow-y-auto border-none gap-8 py-10 px-4"
          data-theme={themeMode}
          style={{ color: "var(--text)", background: "var(--card-bg)" }}
        >
          {/* عنوان الفلتر */}
          <div className="sidebar-title text-xl font-bold text-blue-700 mb-6 text-center">
            {language === "ar" ? "فلترة المنتجات" : "Filter Products"}
          </div>
          {/* باقي عناصر الفلتر */}
          {/* العلامة التجارية */}
          <div
            className="mb-8 rounded-lg shadow-sm flex flex-col"
            style={{
              background: "var(--card-bg)",
              color: "var(--text)",
              border: "1px solid var(--border-color)",
              padding: "2rem",
            }}
          >
            <h3
              className="text-xl font-extrabold mb-4 border-b pb-2"
              style={{ borderColor: "var(--border-color)" }}
            >
              {language === "ar" ? "العلامات التجارية" : "Brands"}
            </h3>
            {brandsToDisplay.map((brand) => (
              <div key={brand.slug} className="mb-3 flex items-center">
                <label className="flex items-center cursor-pointer w-full text-lg gap-3">
                  <input
                    type="checkbox"
                    value={brand.slug}
                    checked={selectedBrands.includes(brand.slug)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedBrands((prev) =>
                          Array.from(new Set([...prev, brand.slug]))
                        );
                      } else {
                        setSelectedBrands((prev) =>
                          prev.filter((slug) => slug !== brand.slug)
                        );
                      }
                    }}
                    className="accent-blue-600 w-6 h-6 mr-2 border-2 border-gray-400 rounded"
                  />
                  {brand.logoUrl && (
                    <img
                      src={brand.logoUrl}
                      alt={brand.slug}
                      className="w-8 h-8 object-contain rounded bg-white mr-2 border"
                    />
                  )}
                  <span className="text-lg font-medium">
                    {typeof brand.name === "object"
                      ? brand.name[language] ||
                        brand.name["en"] ||
                        brand.name["ar"] ||
                        ""
                      : brand.name || ""}
                  </span>
                </label>
              </div>
            ))}
            {brands.length > BRANDS_TO_SHOW && (
              <button
                onClick={() => setShowAllBrands((prev) => !prev)}
                className="text-sm text-blue-600 hover:underline mt-2 font-semibold"
                style={{ color: "var(--primary-blue)" }}
              >
                {showAllBrands
                  ? language === "ar"
                    ? "عرض أقل"
                    : "Show Less"
                  : language === "ar"
                  ? "عرض المزيد"
                  : "Show More"}
              </button>
            )}
            <div>
              <button
                onClick={() => setSelectedBrands([])}
                className="mt-3 text-sm font-semibold px-4 py-2 rounded-full border border-blue-500 bg-blue-50 text-blue-700 transition-colors duration-200 hover:bg-blue-500 hover:text-white shadow-sm"
              >
                {language === "ar" ? "عرض المزيد" : "Show More"}
              </button>
            </div>
          </div>
          {/* السعر (شريط مزدوج) */}
          <div
            className="mb-8 rounded-lg shadow-sm flex flex-col"
            style={{
              background: "var(--card-bg)",
              color: "var(--text)",
              border: "1px solid var(--border-color)",
              padding: "2rem",
            }}
          >
            <h3
              className="text-xl font-extrabold mb-4 border-b pb-2"
              style={{ borderColor: "var(--border-color)" }}
            >
              {t("cart.price")}
            </h3>
            <div
              className="mb-4 text-base font-bold"
              style={{ color: "var(--text)" }}
            >
              {t("common.currency")} {priceRange[0]} – {t("common.currency")}{" "}
              {priceRange[1]}
            </div>
            <div className="px-2 py-4">
              <Slider
                range
                min={MIN_PRICE}
                max={MAX_PRICE}
                step={100}
                value={priceRange}
                onChange={(values) =>
                  setPriceRange([
                    Math.min(values[0], values[1]),
                    Math.max(values[0], values[1]),
                  ])
                }
                trackStyle={[
                  { backgroundColor: "var(--primary-blue)", height: 8 },
                ]}
                handleStyle={[
                  {
                    borderColor: "var(--primary-blue)",
                    height: 24,
                    width: 24,
                    marginTop: -8,
                    backgroundColor: "#fff",
                  },
                  {
                    borderColor: "var(--primary-blue)",
                    height: 24,
                    width: 24,
                    marginTop: -8,
                    backgroundColor: "#fff",
                  },
                ]}
                railStyle={{ backgroundColor: "#cbd5e1", height: 8 }}
              />
            </div>
          </div>
          {/* التقييم */}
          <div
            className="mb-8 rounded-lg shadow-sm flex flex-col"
            style={{
              background: "var(--card-bg)",
              color: "var(--text)",
              border: "1px solid var(--border-color)",
              padding: "2rem",
            }}
          >
            <h3
              className="text-xl font-extrabold mb-4 border-b pb-2"
              style={{ borderColor: "var(--border-color)" }}
            >
              {language === "ar" ? "التقييم" : "Rating"}
            </h3>
            <input
              type="range"
              min={0}
              max={5}
              step={0.5}
              value={rating}
              onChange={(e) => setRating(+e.target.value)}
              className="w-full h-3 rounded-lg accent-blue-600 bg-blue-500"
              style={{ accentColor: "var(--primary-blue)" }}
            />
            <div
              className="text-base mt-2 font-semibold"
              style={{ color: "var(--text)" }}
            >
              {rating}+
            </div>
          </div>
        </aside>
      )}
      {/* المنتجات */}
      <div style={{ flex: 1 }}>
        <div className="recommendations-section">
          {isLoading ? (
            <Loading />
          ) : (
            <div
              className={`p-6 w-full ${
                viewMode === "list"
                  ? "space-y-6" // List view: vertical stack with more spacing
                  : "grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5" // Enhanced grid view with better responsive breakpoints
              }`}
            >
              {products?.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  language={language}
                  t={t}
                  navigate={navigate}
                  viewMode={viewMode}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;
