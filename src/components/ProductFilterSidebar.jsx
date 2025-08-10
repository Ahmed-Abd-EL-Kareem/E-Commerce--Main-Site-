import React from "react";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";

const BRANDS_TO_SHOW = 5;

const ProductFilterSidebar = ({
  brands = [],
  selectedBrands = [],
  setSelectedBrands = () => {},
  priceRange = [0, 35000],
  setPriceRange = () => {},
  rating = 0,
  setRating = () => {},
  showAllBrands = false,
  setShowAllBrands = () => {},
  isLargeScreen = false,
  isFilterOpen = false,
  setIsFilterOpen = () => {},
  language = "en",
  t = (x) => x,
  themeMode = "",
}) => {
  const brandsToDisplay = showAllBrands
    ? brands
    : brands.slice(0, BRANDS_TO_SHOW);

  return (
    <>
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
            className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center rounded-full border border-blue-600 bg-[var(--card-bg)] text-blue-600 shadow hover:bg-blue-600 hover:text-white transition"
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
              color: "var(--primary-text)",
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
              color: "var(--primary-text)",
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
              style={{ color: "var(--primary-text)" }}
            >
              {t("common.currency")} {priceRange[0]} – {t("common.currency")}{" "}
              {priceRange[1]}
            </div>
            <div className="px-2 py-4">
              <Slider
                range
                min={0}
                max={47000}
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
                    backgroundColor: "var(--card-bg)",
                  },
                  {
                    borderColor: "var(--primary-blue)",
                    height: 24,
                    width: 24,
                    marginTop: -8,
                    backgroundColor: "var(--card-bg)",
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
              color: "var(--primary-text)",
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
              style={{ color: "var(--primary-text)" }}
            >
              {rating}+
            </div>
          </div>
        </aside>
      )}
      {/* Sidebar في الشاشات الكبيرة */}
      {isLargeScreen && (
        <aside
          className="sidebar-filters sticky top-8 self-start min-w-[260px] max-h-[calc(100vh-40px)] h-[calc(100vh-40px)] flex flex-col shadow-xl z-10 overflow-y-auto border-none gap-8 py-10 px-4 bg-[var(--card-bg)]"
          data-theme={themeMode}
          style={{
            color: "var(--primary-text)",
            background: "var(--card-bg)",
            borderColor: "var(--border-color)",
          }}
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
              color: "var(--primary-text)",
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
              color: "var(--primary-text)",
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
              style={{ color: "var(--primary-text)" }}
            >
              {t("common.currency")} {priceRange[0]} – {t("common.currency")}{" "}
              {priceRange[1]}
            </div>
            <div className="px-2 py-4">
              <Slider
                range
                min={0}
                max={47000}
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
                    backgroundColor: "var(--card-bg)",
                  },
                  {
                    borderColor: "var(--primary-blue)",
                    height: 24,
                    width: 24,
                    marginTop: -8,
                    backgroundColor: "var(--card-bg)",
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
              color: "var(--primary-text)",
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
              style={{ color: "var(--primary-text)" }}
            >
              {rating}+
            </div>
          </div>
        </aside>
      )}
    </>
  );
};

export default ProductFilterSidebar;
