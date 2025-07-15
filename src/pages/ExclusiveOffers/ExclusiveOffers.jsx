import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import ProductCard from "../../components/ProductCard/ProductCard";
import Loading from "../../components/Loading/Loading";

const MAX_PRICE = 47000;
const MIN_PRICE = 0;
const BRANDS_TO_SHOW = 5;

const ExclusiveOffers = () => {
  const { t, i18n } = useTranslation();
  const language = i18n.language === "ar" ? "ar" : "en";
  const navigate = useNavigate();

  // فلترة
  const [selectedBrands, setSelectedBrands] = React.useState([]);
  const [priceRange, setPriceRange] = React.useState([0, 35000]);
  const [rating, setRating] = React.useState(0);
  const [brands, setBrands] = React.useState([]);
  const [products, setProducts] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);

  // حالة ظهور الفلتر في الشاشات الصغيرة والمتوسطة
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  // حالة معرفة إذا الشاشة كبيرة أم لا
  const [isLargeScreen, setIsLargeScreen] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(min-width: 1200px)").matches
      : true
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1200px)");
    const handleChange = () => {
      setIsLargeScreen(mediaQuery.matches);
    };
    handleChange();
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    if (isLargeScreen) return;
    const toggleFilter = () => {
      setIsFilterOpen((prev) => !prev);
    };
    window.addEventListener("toggleProductFilter", toggleFilter);
    return () =>
      window.removeEventListener("toggleProductFilter", toggleFilter);
  }, [isLargeScreen]);

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

  // جلب العلامات التجارية
  React.useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await fetch("http://127.0.0.1:3000/api/brand");
        const data = await res.json();
        setBrands(data.data.brands || []);
      } catch {
        setBrands([]);
      }
    };
    fetchBrands();
  }, []);

  // بناء رابط الفلترة
  const buildApiUrl = () => {
    let url = `http://127.0.0.1:3000/api/product/?variants.options.discount[gt]=0`;
    if (selectedBrands.length > 0) {
      url += `&brandSlug=${selectedBrands.join(",")}`;
    }
    if (priceRange[0] > MIN_PRICE) url += `&basePrice[gte]=${priceRange[0]}`;
    if (priceRange[1] < MAX_PRICE) url += `&basePrice[lte]=${priceRange[1]}`;
    if (rating > 0) url += `&averageRating[gte]=${rating}`;
    return url;
  };

  // جلب المنتجات حسب الفلاتر
  React.useEffect(() => {
    setIsLoading(true);
    fetch(buildApiUrl())
      .then((res) => res.json())
      .then((data) => {
        setProducts(
          data.data && Array.isArray(data.data)
            ? data.data
            : data.data && Array.isArray(data.data.products)
            ? data.data.products
            : Array.isArray(data.products)
            ? data.products
            : []
        );
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
    // eslint-disable-next-line
  }, [selectedBrands, priceRange, rating]);

  // واجهة الفلاتر
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
          className={`fixed top-0 left-0 h-full w-[75vw] max-w-xs min-w-0 bg-white shadow-2xl flex flex-col gap-6 p-4
            transition-transform duration-300 z-[9999] border-none rounded-none overflow-y-auto
            ${isFilterOpen ? "translate-x-0" : "-translate-x-full"}`}
          style={{ borderRadius: 0 }}
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
          {/* السعر */}
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
          className="sidebar-filters sticky top-8 self-start min-w-[260px] max-h-[calc(100vh-40px)] h-[calc(100vh-40px)] flex flex-col shadow-xl z-10 overflow-y-auto border-none gap-8 py-10 px-4 bg-white"
          style={{ color: "var(--text)" }}
        >
          {/* عنوان الفلتر */}
          <div className="sidebar-title text-lg font-bold text-blue-700 mb-4 text-center">
            {language === "ar" ? "فلترة المنتجات" : "Filter Products"}
          </div>
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
          {/* السعر */}
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
        {/* تم حذف عنوان ووصف الصفحة بناءً على طلب المستخدم */}
        {isLoading ? (
          <Loading />
        ) : (
          <div className="grid gap-6 p-6 w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
            {products.length === 0 ? (
              <div className="products-no-results">
                <h3>
                  {language === "ar"
                    ? "لا توجد عروض حالياً"
                    : "No offers available now"}
                </h3>
              </div>
            ) : (
              products.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  language={language}
                  t={t}
                  navigate={navigate}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExclusiveOffers;
