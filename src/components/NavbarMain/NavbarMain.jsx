import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { useCart } from '../../context/CartContext';
import { useSearch } from '../../context/SearchContext';
import { useAuth } from '../../context/AuthContext';
import { useFavorites } from '../../context/FavoritesContext';
import SearchDropdown from '../SearchDropdown/SearchDropdown';

const NavbarMain = () => {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const { getCartCount } = useCart();
  const { searchQuery, setSearchQuery, performSearch } = useSearch();
  const { user, logout, isAuthenticated } = useAuth();
  const { getFavoritesCount } = useFavorites();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const [isMobileSearchDropdownOpen, setIsMobileSearchDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const searchRef = useRef(null);
  const mobileSearchRef = useRef(null);
  const userDropdownRef = useRef(null);
  const isRTL = i18n.language === 'ar';

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setIsMobileSearchDropdownOpen(false);
  };

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        closeMobileMenu();
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isMobileMenuOpen]);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    document.documentElement.setAttribute('lang', lng);
    document.documentElement.setAttribute('dir', lng === 'ar' ? 'rtl' : 'ltr');
    closeMobileMenu();
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchDropdownOpen(false);
      setIsMobileSearchDropdownOpen(false);
      closeMobileMenu();
    } else {
      navigate('/search');
      setIsSearchDropdownOpen(false);
      setIsMobileSearchDropdownOpen(false);
      closeMobileMenu();
    }
  };

  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setIsSearchDropdownOpen(value.length > 0);
  };

  const handleMobileSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setIsMobileSearchDropdownOpen(value.length > 0);
  };

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchDropdownOpen(false);
      }
      if (mobileSearchRef.current && !mobileSearchRef.current.contains(event.target)) {
        setIsMobileSearchDropdownOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const cartCount = getCartCount();
  const favoritesCount = getFavoritesCount();

  return (
    <>
      {/* Top Banner */}
      <div
        className="text-center py-3 px-4 text-sm font-semibold tracking-wide"
        style={{
          background: 'var(--gradient-primary)',
          color: 'white',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <p className="m-0 drop-shadow-sm">{t('navbar.topBanner')}</p>
      </div>

      {/* Main Navbar */}
      <nav
        className="border-b sticky top-0 z-[100] w-full transition-all duration-300"
        style={{
          background: 'var(--primary-bg)',
          borderColor: 'var(--card-border)',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <div
          className={`max-w-[1400px] mx-auto px-4 flex items-center justify-between h-[75px] gap-4 ${
            isRTL ? 'flex-row-reverse' : ''
          }`}
        >
          {/* Logo */}
          <div className="flex-shrink-0">
            <img
              src="/logo.jpg"
              alt="Logo"
              className="h-11 w-auto cursor-pointer"
              onClick={() => navigate('/')}
            />
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden flex flex-col justify-around w-6 h-6 bg-transparent border-none cursor-pointer p-0 z-[101]"
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
          >
            <span
              className="w-6 h-0.5 rounded-sm transition-all duration-300 origin-[1px]"
              style={{ background: 'var(--primary-text)' }}
            />
            <span
              className="w-6 h-0.5 rounded-sm transition-all duration-300 origin-[1px]"
              style={{ background: 'var(--primary-text)' }}
            />
            <span
              className="w-6 h-0.5 rounded-sm transition-all duration-300 origin-[1px]"
              style={{ background: 'var(--primary-text)' }}
            />
          </button>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex gap-10 items-center">
            <a
              href="/"
              className="no-underline font-semibold text-base transition-all duration-300 py-3 relative hover:-translate-y-0.5 px-2 rounded-lg hover:bg-opacity-10"
              style={{
                color: 'var(--primary-text)',
                background: 'transparent',
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'var(--accent-text)';
                e.target.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.color = 'var(--primary-text)';
              }}
            >
              {t('navigation.home')}
            </a>
            <a
              href="/products"
              className="no-underline font-semibold text-base transition-all duration-300 py-3 relative hover:-translate-y-0.5 px-2 rounded-lg hover:bg-opacity-10"
              style={{
                color: 'var(--primary-text)',
                background: 'transparent',
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'var(--accent-text)';
                e.target.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.color = 'var(--primary-text)';
              }}
            >
              {t('navigation.products')}
            </a>
            <a
              href="/categories"
              className="no-underline font-semibold text-base transition-all duration-300 py-3 relative hover:-translate-y-0.5 px-2 rounded-lg hover:bg-opacity-10"
              style={{
                color: 'var(--primary-text)',
                background: 'transparent',
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'var(--accent-text)';
                e.target.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.color = 'var(--primary-text)';
              }}
            >
              {t('navigation.categories')}
            </a>
            <a
              href="/about"
              className="no-underline font-semibold text-base transition-all duration-300 py-3 relative hover:-translate-y-0.5 px-2 rounded-lg hover:bg-opacity-10"
              style={{
                color: 'var(--primary-text)',
                background: 'transparent',
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'var(--accent-text)';
                e.target.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.color = 'var(--primary-text)';
              }}
            >
              {t('navigation.about')}
            </a>
          </div>

          {/* Desktop Search */}
          <div className="hidden lg:flex flex-1 max-w-md mx-4 relative" ref={searchRef}>
            <form onSubmit={handleSearch} className="w-full relative group">
              <div className="relative">
                <input
                  type="text"
                  placeholder={t('navbar.searchPlaceholder')}
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  className="w-full py-3 px-4 pr-12 border-2 rounded-xl text-base transition-all duration-300 focus:outline-none group-hover:shadow-lg theme-input focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-white dark:border-slate-700"
                  style={{
                    color: 'var(--primary-text)',
                    background: 'var(--input-bg, #f8fafc)',
                    borderColor: 'var(--card-border)',
                  }}
                  dir="ltr"
                  aria-label={t('navbar.searchPlaceholder')}
                />
                <div className="absolute inset-0 rounded-xl border-2 border-transparent group-focus-within:border-blue-500 transition-all duration-300 pointer-events-none" />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 transition-all duration-300 hover:scale-110"
                  style={{ color: 'var(--accent-text, #2563eb)' }}
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setIsSearchDropdownOpen(false);
                    }}
                    className="absolute right-10 top-1/2 -translate-y-1/2 p-1 transition-all duration-300 hover:scale-110 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700"
                    style={{ color: 'var(--secondary-text)' }}
                    aria-label="Clear search"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                )}
              </div>
            </form>

            {/* Desktop Search Dropdown */}
            {isSearchDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 z-50">
                <SearchDropdown
                  isOpen={isSearchDropdownOpen}
                  onClose={() => setIsSearchDropdownOpen(false)}
                  onSearchSelect={(query) => {
                    setSearchQuery(query);
                    setIsSearchDropdownOpen(false);
                    performSearch(query);
                    navigate('/search');
                  }}
                />
              </div>
            )}
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            className="p-2 rounded-lg transition-all duration-200 flex items-center justify-center hover:scale-110"
            style={{
              color: 'var(--primary-text)',
              background: 'transparent',
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'var(--tertiary-bg)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
            }}
          >
            {theme === 'dark' ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>

          {/* Language Switcher */}
          <div className="relative">
            <button
              onClick={() => changeLanguage(i18n.language === 'en' ? 'ar' : 'en')}
              className="flex items-center gap-1 bg-transparent border-none cursor-pointer p-2 rounded-lg transition-all duration-200 hover:scale-110"
              style={{
                color: 'var(--primary-text)',
                background: 'transparent',
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'var(--tertiary-bg)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
              }}
              aria-label="Switch language"
            >
              <span className="text-sm font-medium">{i18n.language === 'en' ? 'العربية' : 'EN'}</span>
            </button>
          </div>

          {/* Favorites Button */}
          <button
            onClick={() => navigate('/profile?tab=favorites')}
            className="relative bg-transparent border-none cursor-pointer p-2 rounded-lg transition-all duration-200 flex items-center justify-center hover:scale-110"
            style={{
              color: 'var(--primary-text)',
              background: 'transparent',
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'var(--tertiary-bg)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
            }}
            aria-label="Favorites"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            {favoritesCount > 0 && (
              <span
                className="absolute -top-2 -right-2 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 leading-none p-0 m-0 box-border animate-pulse"
                style={{
                  background: 'var(--error-text)',
                  borderColor: 'var(--primary-bg)',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
              {favoritesCount}
              </span>
            )}
          </button>

          {/* Cart Button */}
          <button
            onClick={() => navigate('/cart')}
            className="relative bg-transparent border-none cursor-pointer p-2 rounded-lg transition-all duration-200 flex items-center justify-center hover:scale-110"
            style={{
              color: 'var(--primary-text)',
              background: 'transparent',
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'var(--tertiary-bg)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
            }}
            aria-label="Shopping cart"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12L8.1 13h7.45c.75 0 1.41-.41 1.75-1.03L21.7 4H5.21l-.94-2H1zm16 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
            </svg>
            {cartCount > 0 && (
              <span
                className="absolute -top-2 -right-2 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 leading-none p-0 m-0 box-border animate-pulse"
                style={{
                  background: 'var(--error-text)',
                  borderColor: 'var(--primary-bg)',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                {cartCount}
              </span>
            )}
          </button>

          {/* User Button */}
          <div className="relative" ref={userDropdownRef}>
            <button
              onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
              className="relative bg-transparent border-none cursor-pointer p-2 rounded-lg transition-colors duration-200 flex items-center justify-center"
              style={{ color: 'var(--primary-text)' }}
              aria-label="User account"
            >
              {isAuthenticated && user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-6 h-6 rounded-full object-cover" />
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              )}
            </button>

            {/* User Dropdown */}
            {isUserDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-48 rounded-xl shadow-xl border py-2 z-[9999]"
                style={{
                  background: 'var(--card-bg)',
                  borderColor: 'var(--card-border)',
                }}
              >
                {isAuthenticated ? (
                  <>
                    <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--card-border)' }}>
                      <p className="text-sm font-medium" style={{ color: 'var(--primary-text)' }}>
                        {user?.name}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--secondary-text)' }}>
                        {user?.email}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        navigate('/profile');
                        setIsUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm transition-colors flex items-center gap-2"
                      style={{ color: 'var(--primary-text)' }}
                    >
                      <svg
                        className="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                      Profile
                    </button>
                    <button
                      onClick={() => {
                        navigate('/profile?tab=favorites');
                        setIsUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm transition-colors flex items-center gap-2"
                      style={{ color: 'var(--primary-text)' }}
                    >
                      <svg
                        className="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      </svg>
                      Favorites {favoritesCount > 0 && `(${favoritesCount})`}
                    </button>
                    <button
                      onClick={() => {
                        logout();
                        setIsUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm transition-colors flex items-center gap-2"
                      style={{ color: 'var(--error-text, #dc2626)' }}
                    >
                      <svg
                        className="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5l-5-5zm9 12h-8v2h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-8v2h8v14z" />
                      </svg>
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        navigate('/login');
                        setIsUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm transition-colors flex items-center gap-2"
                      style={{ color: 'var(--primary-text)' }}
                    >
                      <svg
                        className="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M11 7L9.6 8.4l2.6 2.6H2v2h10.2l-2.6 2.6L11 17l5-5l-5-5zm9 12h-8v2h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-8v2h8v14z" />
                      </svg>
                      {t('navbar.login')}
                    </button>
                    <button
                      onClick={() => {
                        navigate('/signup');
                        setIsUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm transition-colors flex items-center gap-2"
                      style={{ color: 'var(--primary-text)' }}
                    >
                      <svg
                        className="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                      {t('navbar.signup')}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};

export default NavbarMain;
