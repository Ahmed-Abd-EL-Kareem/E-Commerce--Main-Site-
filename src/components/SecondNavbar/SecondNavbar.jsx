import React, { useState, useEffect, useRef } from "react";
import "./SecondNavbar.css";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { useCategory } from "../../context/CategoryContext";

const getMaxVisible = () => {
  if (typeof window !== "undefined") {
    if (window.innerWidth < 1000) {
      return 4;
    }
  }
  return 7;
};

const fetchCategories = async () => {
  const { data } = await axios.get("http://127.0.0.1:3000/api/categories");
  return data.data;
};

const SecondNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedCategory, setSelectedCategory } = useCategory();
  const [isSticky, setIsSticky] = useState(false);
  const { i18n } = useTranslation();
  const language = i18n.language === "ar" ? "ar" : "en";
  const prevLang = useRef(language);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const showMoreBtnRef = useRef(null);

  // إغلاق القائمة عند الضغط خارجها
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        showMoreBtnRef.current &&
        !showMoreBtnRef.current.contains(event.target)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle scroll for sticky behavior
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      setIsSticky(scrollTop > 150);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const { data: categories, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  // ترتيب التصنيفات: العروض الحصرية أولاً ثم باقي التصنيفات
  let sortedCategories = [];
  if (categories) {
    sortedCategories = [...categories];
    // لا تكرر العروض الحصرية إذا كانت موجودة ضمن التصنيفات
    sortedCategories = sortedCategories.filter(
      (cat) =>
        !(typeof cat.name === "object"
          ? cat.name["en"] === "Exclusive Offers"
          : cat.name === "Exclusive Offers")
    );
  }

  // عند تغيير اللغة، ابحث عن التصنيف الحالي وخذ دومًا السلاج الإنجليزي
  useEffect(() => {
    if (!categories) return;
    if (prevLang.current !== language) {
      if (selectedCategory !== "all") {
        // ابحث عن التصنيف الحالي في جميع لغات السلاج
        const currentCat = categories.find((cat) => {
          if (typeof cat.slug === "object") {
            return Object.values(cat.slug)
              .map((s) => (s ? s.toLowerCase() : s))
              .includes(selectedCategory.toLowerCase());
          }
          return (
            cat.slug &&
            cat.slug.toLowerCase() === selectedCategory.toLowerCase()
          );
        });
        if (currentCat) {
          const newSlug =
            typeof currentCat.slug === "object"
              ? currentCat.slug["en"] // دومًا السلاج الإنجليزي
              : currentCat.slug;
          setSelectedCategory(newSlug ? newSlug.toLowerCase() : "all");
        } else {
          setSelectedCategory("all");
        }
      }
      prevLang.current = language;
    }
  }, [language, categories, selectedCategory]);

  // عند الضغط على تصنيف، دومًا خزّن السلاج الإنجليزي
  const handleCategoryClick = (slug) => {
    setSelectedCategory(slug);
    navigate(`/products?category=${slug}`);
  };

  const [maxVisible, setMaxVisible] = useState(getMaxVisible());
  useEffect(() => {
    const handleResize = () => setMaxVisible(getMaxVisible());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // العدد الكلي للأزرار (الكل + العروض الحصرية + التصنيفات)
  const totalButtons = 2 + sortedCategories.length;
  // عدد التصنيفات التي ستظهر بجانب الكل والعروض الحصرية
  const visibleCategories = sortedCategories.slice(0, maxVisible - 2); // -2 لأن الكل والعروض الحصرية دائمًا ظاهرين
  const hiddenCategories = sortedCategories.slice(maxVisible - 2);
  // إذا كان العدد الكلي أكبر من maxVisible، أظهر زر عرض المزيد
  const showMoreButton = totalButtons > maxVisible;

  return (
    <nav className={`second-navbar ${isSticky ? "sticky" : ""}`}>
      <div className="second-navbar-container">
        {/* Categories Navigation */}
        <div className="categories-nav flex items-center gap-2">
          <div
            className="categories-scroll flex items-center gap-2"
            style={{ overflowX: "visible" }}
          >
            <button
              className={`category-btn ${
                selectedCategory === "all" &&
                location.pathname !== "/exclusive-offers"
                  ? "active"
                  : ""
              }`}
              onClick={() => handleCategoryClick("all")}
            >
              <span className="category-label">
                {language === "ar" ? "الكل" : "All"}
              </span>
            </button>
            {/* زر العروض الحصرية */}
            <button
              className={`category-btn ml-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 to-blue-400 text-white font-bold shadow hover:from-blue-700 hover:to-blue-500 transition ${
                location.pathname === "/exclusive-offers" ? "active" : ""
              }`}
              onClick={() => navigate("/exclusive-offers")}
              style={{ fontSize: "1rem", marginInlineStart: 8 }}
            >
              {language === "ar" ? "العروض الحصرية" : "Exclusive Offers"}
            </button>
            {/* التصنيفات الظاهرة */}
            {!isLoading &&
              visibleCategories.map((cat) => {
                const catName =
                  typeof cat.name === "object"
                    ? cat.name[language] || cat.name["en"] || cat.name["ar"]
                    : cat.name;
                const catSlugEn =
                  typeof cat.slug === "object" ? cat.slug["en"] : cat.slug;
                return (
                  <button
                    key={cat._id}
                    className={`category-btn ${
                      location.pathname !== "/exclusive-offers" &&
                      selectedCategory ===
                        (catSlugEn ? catSlugEn.toLowerCase() : "")
                        ? "active"
                        : ""
                    }`}
                    onClick={() =>
                      handleCategoryClick(
                        catSlugEn ? catSlugEn.toLowerCase() : ""
                      )
                    }
                  >
                    <span className="category-label">{catName}</span>
                  </button>
                );
              })}
            {/* زر عرض المزيد */}
            {showMoreButton && hiddenCategories.length > 0 && (
              <div className="relative">
                <button
                  className="category-btn font-bold px-4 py-2"
                  style={{ minWidth: 90 }}
                  ref={showMoreBtnRef}
                  onClick={() => {
                    setDropdownOpen((prev) => !prev);
                  }}
                >
                  {language === "ar" ? "عرض المزيد" : "Show More"}
                </button>
                {/* خلفية شفافة عند فتح القائمة */}
                {dropdownOpen && (
                  <div
                    className="fixed inset-0 bg-black/10 z-[99990]"
                    onClick={() => setDropdownOpen(false)}
                  ></div>
                )}
                {/* القائمة المنسدلة */}
                <div
                  ref={dropdownRef}
                  className={`fixed left-1/2 top-20 min-w-[180px] z-[99999] bg-white rounded-2xl shadow-2xl ring-1 ring-blue-100 flex flex-col py-2 transition-all duration-200 ${
                    dropdownOpen
                      ? "opacity-100 scale-100 pointer-events-auto"
                      : "opacity-0 scale-95 pointer-events-none"
                  } animate-fade-in`}
                  style={{ transform: "translateX(-50%)", marginTop: "8px" }}
                >
                  {/* السهم أعلى القائمة */}
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-5 h-5 overflow-hidden z-10">
                    <div className="w-4 h-4 bg-white border-l border-t border-blue-100 rotate-45 mx-auto shadow -z-10"></div>
                  </div>
                  {hiddenCategories.map((cat) => {
                    const catName =
                      typeof cat.name === "object"
                        ? cat.name[language] || cat.name["en"] || cat.name["ar"]
                        : cat.name;
                    const catSlugEn =
                      typeof cat.slug === "object" ? cat.slug["en"] : cat.slug;
                    return (
                      <button
                        key={cat._id}
                        className={`category-btn w-full text-center px-4 py-2 my-1 rounded-full transition-colors duration-150 font-semibold text-base ${
                          location.pathname !== "/exclusive-offers" &&
                          selectedCategory ===
                            (catSlugEn ? catSlugEn.toLowerCase() : "")
                            ? "bg-blue-600 text-white shadow"
                            : "hover:bg-blue-50 hover:text-blue-700"
                        }`}
                        onClick={() => {
                          handleCategoryClick(
                            catSlugEn ? catSlugEn.toLowerCase() : ""
                          );
                          setDropdownOpen(false);
                        }}
                      >
                        {catName}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Quick Actions */}
        <div className="quick-actions">
          <button
            className="quick-action-btn filter-btn"
            onClick={() => {
              window.dispatchEvent(new Event("toggleProductFilter"));
              console.log("Filter button clicked!");
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46" />
            </svg>
            <span>Filter</span>
          </button>

          <button className="quick-action-btn sort-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M3 6h18M7 12h10m-7 6h4" />
            </svg>
            <span>Sort</span>
          </button>

          <button className="quick-action-btn view-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
            <span>Grid</span>
          </button>
        </div>
      </div>

      {/* Mobile Category Selector */}
      <div className="mobile-category-selector">
        <select
          value={
            location.pathname === "/exclusive-offers"
              ? "exclusive-offers"
              : selectedCategory
          }
          onChange={(e) => {
            if (e.target.value === "exclusive-offers") {
              navigate("/exclusive-offers");
            } else {
              handleCategoryClick(e.target.value);
            }
          }}
          className="mobile-category-select"
        >
          <option value="all">{language === "ar" ? "الكل" : "All"}</option>
          <option value="exclusive-offers">
            {language === "ar" ? "العروض الحصرية" : "Exclusive Offers"}
          </option>
          {categories?.map((category) => {
            const catName =
              typeof category.name === "object"
                ? category.name[language] ||
                  category.name["en"] ||
                  category.name["ar"]
                : category.name;
            const catSlugEn =
              typeof category.slug === "object"
                ? category.slug["en"]
                : category.slug;
            return (
              <option
                key={category._id}
                value={catSlugEn ? catSlugEn.toLowerCase() : ""}
              >
                {catName}
              </option>
            );
          })}
        </select>

        <div className="mobile-quick-actions">
          <button
            className="mobile-quick-btn"
            onClick={() => {
              window.dispatchEvent(new Event("toggleProductFilter"));
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46" />
            </svg>
          </button>
          <button className="mobile-quick-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M3 6h18M7 12h10m-7 6h4" />
            </svg>
          </button>
        </div>
      </div>
      {/* Mobile: Hide on small screens, add mobile version if needed */}
    </nav>
  );
};

export default SecondNavbar;
