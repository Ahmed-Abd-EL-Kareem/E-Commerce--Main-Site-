import React, { useState, useEffect, useRef } from "react";
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
  const [viewMode, setViewMode] = useState('grid'); // grid or list

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

  // Handle view mode toggle
  const handleViewModeToggle = () => {
    const newViewMode = viewMode === 'grid' ? 'list' : 'grid';
    setViewMode(newViewMode);
    // Dispatch custom event for other components to listen to
    window.dispatchEvent(new CustomEvent('viewModeChanged', { 
      detail: { viewMode: newViewMode } 
    }));
  };

  return (
    <nav 
      className={`border-b relative z-[90] transition-all duration-300 ${
        isSticky ? 'fixed top-0 left-0 right-0 z-[95] backdrop-blur-[10px] animate-[slideDown_0.3s_ease-out]' : ''
      }`}
      style={{
        background: isSticky ? 'var(--card-bg)' : 'var(--primary-bg)',
        borderColor: 'var(--card-border)',
        boxShadow: isSticky ? 'var(--shadow-lg)' : 'none'
      }}
    >
      <div className="max-w-[1400px] mx-auto px-4 flex items-center justify-between min-h-[60px] gap-8">
        {/* Categories Navigation */}
        <div className="flex-1 overflow-hidden relative">
          <div 
            className="flex gap-2 overflow-x-auto py-2 no-scrollbar scroll-smooth relative" 
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {/* All Products Button */}
            <button
              className={`relative flex items-center gap-2 py-3 px-4 bg-transparent border rounded-full cursor-pointer transition-all duration-200 whitespace-nowrap text-sm font-medium min-w-fit focus:outline-none focus:ring-2 focus:ring-offset-2 hover:scale-105 ${
                selectedCategory === "all" && location.pathname !== "/exclusive-offers"
                  ? 'font-semibold -translate-y-0.5'
                  : 'hover:-translate-y-0.5'
              }`}
              style={{
                background: selectedCategory === "all" && location.pathname !== "/exclusive-offers" ? 'var(--accent-text)' : 'transparent',
                color: selectedCategory === "all" && location.pathname !== "/exclusive-offers" ? 'white' : 'var(--secondary-text)',
                borderColor: selectedCategory === "all" && location.pathname !== "/exclusive-offers" ? 'var(--accent-text)' : 'var(--card-border)',
                borderWidth: '1px',
                boxShadow: selectedCategory === "all" && location.pathname !== "/exclusive-offers" ? 'var(--shadow-md)' : 'none'
              }}
              onClick={() => handleCategoryClick("all")}
              onMouseEnter={(e) => {
                if (selectedCategory !== "all" || location.pathname === "/exclusive-offers") {
                  e.target.style.background = 'var(--tertiary-bg)';
                  e.target.style.color = 'var(--primary-text)';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedCategory !== "all" || location.pathname === "/exclusive-offers") {
                  e.target.style.background = 'transparent';
                  e.target.style.color = 'var(--secondary-text)';
                }
              }}
            >
              <span className="text-base flex items-center justify-center">🏪</span>
              <span className="font-medium">{language === "ar" ? "الكل" : "All"}</span>
              {selectedCategory === "all" && location.pathname !== "/exclusive-offers" && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-sm animate-[slideIn_0.3s_ease]"
                  style={{ background: 'white' }}
                />
              )}
            </button>

            {/* Exclusive Offers Button */}
            <button
              className={`relative flex items-center gap-2 py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-400 text-white font-bold border rounded-full cursor-pointer transition-all duration-200 whitespace-nowrap text-sm min-w-fit focus:outline-none focus:ring-2 focus:ring-offset-2 hover:scale-105 hover:from-blue-700 hover:to-blue-500 ${
                location.pathname === "/exclusive-offers" ? 'font-semibold -translate-y-0.5' : 'hover:-translate-y-0.5'
              }`}
              style={{
                borderColor: 'var(--accent-text)',
                borderWidth: '1px',
                boxShadow: location.pathname === "/exclusive-offers" ? 'var(--shadow-md)' : 'none'
              }}
              onClick={() => navigate("/exclusive-offers")}
            >
              <span className="text-base flex items-center justify-center">🎯</span>
              <span className="font-medium">{language === "ar" ? "العروض الحصرية" : "Exclusive Offers"}</span>
              {location.pathname === "/exclusive-offers" && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-sm animate-[slideIn_0.3s_ease]"
                  style={{ background: 'white' }}
                />
              )}
            </button>

            {/* Visible Categories */}
            {!isLoading &&
              visibleCategories.map((cat) => {
                const catName =
                  typeof cat.name === "object"
                    ? cat.name[language] || cat.name["en"] || cat.name["ar"]
                    : cat.name;
                const catSlugEn =
                  typeof cat.slug === "object" ? cat.slug["en"] : cat.slug;
                const isActive = location.pathname !== "/exclusive-offers" &&
                  selectedCategory === (catSlugEn ? catSlugEn.toLowerCase() : "");
                
                return (
                  <button
                    key={cat._id}
                    className={`relative flex items-center gap-2 py-3 px-4 bg-transparent border rounded-full cursor-pointer transition-all duration-200 whitespace-nowrap text-sm font-medium min-w-fit focus:outline-none focus:ring-2 focus:ring-offset-2 hover:scale-105 ${
                      isActive ? 'font-semibold -translate-y-0.5' : 'hover:-translate-y-0.5'
                    }`}
                    style={{
                      background: isActive ? 'var(--accent-text)' : 'transparent',
                      color: isActive ? 'white' : 'var(--secondary-text)',
                      borderColor: isActive ? 'var(--accent-text)' : 'var(--card-border)',
                      borderWidth: '1px',
                      boxShadow: isActive ? 'var(--shadow-md)' : 'none'
                    }}
                    onClick={() =>
                      handleCategoryClick(
                        catSlugEn ? catSlugEn.toLowerCase() : ""
                      )
                    }
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.target.style.background = 'var(--tertiary-bg)';
                        e.target.style.color = 'var(--primary-text)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.target.style.background = 'transparent';
                        e.target.style.color = 'var(--secondary-text)';
                      }
                    }}
                  >
                    <span className="text-base flex items-center justify-center">📦</span>
                    <span className="font-medium">{catName}</span>
                    {isActive && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-sm animate-[slideIn_0.3s_ease]"
                        style={{ background: 'white' }}
                      />
                    )}
                  </button>
                );
              })}

            {/* Show More Button */}
            {showMoreButton && hiddenCategories.length > 0 && (
              <div className="relative">
                <button
                  className="relative flex items-center gap-2 py-3 px-4 bg-transparent border rounded-full cursor-pointer transition-all duration-200 whitespace-nowrap text-sm font-medium min-w-fit focus:outline-none focus:ring-2 focus:ring-offset-2 hover:scale-105 hover:-translate-y-0.5"
                  style={{
                    color: 'var(--secondary-text)',
                    borderColor: 'var(--card-border)',
                    borderWidth: '1px'
                  }}
                  ref={showMoreBtnRef}
                  onClick={() => {
                    setDropdownOpen((prev) => !prev);
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'var(--tertiary-bg)';
                    e.target.style.color = 'var(--primary-text)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'transparent';
                    e.target.style.color = 'var(--secondary-text)';
                  }}
                >
                  <span className="text-base flex items-center justify-center">⋯</span>
                  <span className="font-medium">{language === "ar" ? "عرض المزيد" : "Show More"}</span>
                </button>

                {/* Dropdown Background */}
                {dropdownOpen && (
                  <div
                    className="fixed inset-0 bg-black/10 z-[99990]"
                    onClick={() => setDropdownOpen(false)}
                  ></div>
                )}

                {/* Dropdown Menu */}
                <div
                  ref={dropdownRef}
                  className={`fixed left-1/2 top-20 min-w-[180px] z-[99999] bg-white rounded-2xl shadow-2xl ring-1 ring-blue-100 flex flex-col py-2 transition-all duration-200 ${
                    dropdownOpen
                      ? "opacity-100 scale-100 pointer-events-auto"
                      : "opacity-0 scale-95 pointer-events-none"
                  } animate-fade-in`}
                  style={{ transform: "translateX(-50%)", marginTop: "8px" }}
                >
                  {/* Dropdown Arrow */}
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
                    const isActive = location.pathname !== "/exclusive-offers" &&
                      selectedCategory === (catSlugEn ? catSlugEn.toLowerCase() : "");
                    
                    return (
                      <button
                        key={cat._id}
                        className={`w-full text-center px-4 py-2 my-1 rounded-full transition-colors duration-150 font-semibold text-base ${
                          isActive
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

          {/* Gradient fade for scrollable categories */}
          <span className="pointer-events-none absolute top-0 right-0 w-8 h-full z-10 hidden md:block"
            style={{
              background: 'linear-gradient(to left, var(--primary-bg), transparent)'
            }}
          />
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <button 
            className="px-4 py-2 border rounded-lg text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 hover:scale-105 theme-button-secondary"
            style={{
              color: 'var(--secondary-text)'
            }}
            onClick={() => {
              window.dispatchEvent(new Event("toggleProductFilter"));
              console.log("Filter button clicked!");
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'var(--accent-text)';
              e.target.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'var(--card-bg)';
              e.target.style.color = 'var(--secondary-text)';
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4 mr-2">
              <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46" />
            </svg>
            Filter
          </button>

          <button 
            className="px-4 py-2 border rounded-lg text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 hover:scale-105 theme-button-secondary"
            style={{
              color: 'var(--secondary-text)'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'var(--accent-text)';
              e.target.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'var(--card-bg)';
              e.target.style.color = 'var(--secondary-text)';
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4 mr-2">
              <path d="M3 6h18M7 12h10m-7 6h4" />
            </svg>
            Sort
          </button>

          <button 
            className={`px-4 py-2 border rounded-lg text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 hover:scale-105 ${
              viewMode === 'list' ? 'bg-blue-600 text-white' : 'theme-button-secondary'
            }`}
            style={{
              color: viewMode === 'list' ? 'white' : 'var(--secondary-text)',
              borderColor: viewMode === 'list' ? 'var(--accent-text)' : 'var(--card-border)'
            }}
            onClick={handleViewModeToggle}
            onMouseEnter={(e) => {
              if (viewMode !== 'list') {
                e.target.style.background = 'var(--accent-text)';
                e.target.style.color = 'white';
              }
            }}
            onMouseLeave={(e) => {
              if (viewMode !== 'list') {
                e.target.style.background = 'var(--card-bg)';
                e.target.style.color = 'var(--secondary-text)';
              }
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4 mr-2">
              {viewMode === 'list' ? (
                // List view icon
                <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              ) : (
                // Grid view icon
                <>
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </>
              )}
            </svg>
            {viewMode === 'list' ? 'List' : 'Grid'}
          </button>
        </div>
      </div>

      {/* Mobile Category Selector */}
      <div className="md:hidden border-t" style={{ borderColor: 'var(--card-border)' }}>
        <div className="max-w-[1400px] mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
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
              className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={{
                background: 'var(--card-bg)',
                color: 'var(--primary-text)',
                borderColor: 'var(--card-border)'
              }}
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

            <div className="flex items-center gap-2">
              <button 
                className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200"
                style={{
                  background: 'var(--card-bg)',
                  color: 'var(--secondary-text)',
                  borderColor: 'var(--card-border)'
                }}
                onClick={() => {
                  window.dispatchEvent(new Event("toggleProductFilter"));
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4">
                  <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46" />
                </svg>
              </button>
              <button 
                className={`p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 ${
                  viewMode === 'list' ? 'bg-blue-600 text-white' : ''
                }`}
                style={{
                  background: viewMode === 'list' ? 'var(--accent-text)' : 'var(--card-bg)',
                  color: viewMode === 'list' ? 'white' : 'var(--secondary-text)',
                  borderColor: viewMode === 'list' ? 'var(--accent-text)' : 'var(--card-border)'
                }}
                onClick={handleViewModeToggle}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4">
                  {viewMode === 'list' ? (
                    <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  ) : (
                    <>
                      <rect x="3" y="3" width="7" height="7" />
                      <rect x="14" y="3" width="7" height="7" />
                      <rect x="14" y="14" width="7" height="7" />
                      <rect x="3" y="14" width="7" height="7" />
                    </>
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default SecondNavbar;