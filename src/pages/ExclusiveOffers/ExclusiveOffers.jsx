import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import ProductCard from "../../components/ProductCard/ProductCard";
import Loading from "../../components/Loading/Loading";
import ProductFilterSidebar from "../../components/ProductFilterSidebar";

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
        const res = await fetch(
          "https://e-commerce-back-end-kappa.vercel.app/api/brand"
        );
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
    let url = `https://e-commerce-back-end-kappa.vercel.app/api/product/?variants.options.discount[gt]=0`;
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
      {/* Sidebar موحد */}
      <ProductFilterSidebar
        brands={brands}
        selectedBrands={selectedBrands}
        setSelectedBrands={setSelectedBrands}
        priceRange={priceRange}
        setPriceRange={setPriceRange}
        rating={rating}
        setRating={setRating}
        showAllBrands={showAllBrands}
        setShowAllBrands={setShowAllBrands}
        isLargeScreen={isLargeScreen}
        isFilterOpen={isFilterOpen}
        setIsFilterOpen={setIsFilterOpen}
        language={language}
        t={t}
        themeMode={
          typeof document !== "undefined"
            ? document.documentElement.getAttribute("data-theme") || ""
            : ""
        }
      />
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
