import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { useCart } from '../../context/CartContext';
import { useSearch } from '../../context/SearchContext';
import { useAuth } from '../../context/AuthContext';
import { useFavorites } from '../../context/FavoritesContext';
import { useLanguage, getDirectionalClass, getTextAlignment } from '../../utils/languageUtils';
import SearchDropdown from '../SearchDropdown/SearchDropdown';
import logoImage from '../../assets/images/logoo.png';

const NavbarMain = () => {
  const { t, i18n } = useTranslation();
  const { language, isRTL } = useLanguage();
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
        className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-700 transition-all duration-300 main-navbar"
        style={{
          background: 'var(--navbar-bg)',
          backdropFilter: 'blur(10px)',
          borderColor: 'var(--border-color)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className={`flex items-center justify-between h-16 ${getDirectionalClass('', isRTL, 'flex-row-reverse', 'flex-row')}`}>
            {/* Logo */}
            <div className="flex items-center navbar-logo">
              <button
                onClick={() => navigate('/')}
                className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
                style={{ color: 'var(--primary-text)' }}
              >
                <img
                  src={logoImage}
                  alt="VT TECH Digital Solutions"
                  className="h-20 w-auto object-contain"
                />
                {/* <span className="text-xl font-bold hidden sm:block ml-2">
                  {language === 'ar' ? 'العالمية' : 'Al Alamya'}
                </span> */}
              </button>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
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
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    style={{
                      background: 'var(--input-bg)',
                      color: 'var(--primary-text)',
                      borderColor: 'var(--border-color)',
                    }}
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                </div>
                {isSearchDropdownOpen && (
                  <SearchDropdown
                    query={searchQuery}
                    onClose={() => setIsSearchDropdownOpen(false)}
                  />
                )}
              </form>
            </div>

            {/* Desktop Actions */}
            <div className={`hidden lg:flex items-center space-x-4 ${getDirectionalClass('', isRTL, 'flex-row-reverse', 'flex-row')}`}>
              {/* Language Switcher */}
              <button
                onClick={() => changeLanguage(language === 'en' ? 'ar' : 'en')}
                className="px-3 py-2 rounded-lg transition-all duration-200 hover:bg-opacity-10 font-medium"
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
                <span className="text-sm font-medium">{language === 'en' ? 'العربية' : 'EN'}</span>
              </button>

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
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
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
                aria-label="Cart"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="bg-transparent border-none cursor-pointer p-2 rounded-lg transition-all duration-200 flex items-center justify-center hover:scale-110"
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
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {theme === 'dark' ? (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>

              {/* User Menu */}
              {isAuthenticated ? (
                <div className="relative" ref={userDropdownRef}>
                  <button
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    className="flex items-center space-x-2 p-2 rounded-lg transition-all duration-200 hover:bg-opacity-10"
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
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                      {user?.name?.charAt(0) || 'U'}
                    </div>
                    <span className="hidden md:block text-sm font-medium">
                      {user?.name || 'User'}
                    </span>
                    <svg 
                      className={`w-4 h-4 transition-transform duration-200 ${isUserDropdownOpen ? 'rotate-180' : ''}`}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isUserDropdownOpen && (
                    <div className={`absolute ${isRTL ? 'left-0' : 'right-0'} mt-2 w-48 rounded-lg shadow-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 z-[9999] user-dropdown`}>
                      <div className="py-2">
                        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                          <p className="text-sm font-medium text-slate-900 dark:text-white">
                            {user?.name || 'User'}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {user?.email || 'user@example.com'}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            navigate('/profile');
                            setIsUserDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 user-dropdown-item"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          {language === 'ar' ? 'الملف الشخصي' : 'Profile'}
                        </button>
                        <button
                          onClick={() => {
                            navigate('/profile?tab=favorites');
                            setIsUserDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 user-dropdown-item"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                          </svg>
                          {language === 'ar' ? 'المفضلة' : 'Favorites'}
                          {favoritesCount > 0 && (
                            <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-1">
                              {favoritesCount}
                            </span>
                          )}
                        </button>
                        <button
                          onClick={() => {
                            logout();
                            setIsUserDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2 user-dropdown-item"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          {language === 'ar' ? 'تسجيل الخروج' : 'Logout'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className={`flex items-center space-x-2 ${getDirectionalClass('', isRTL, 'flex-row-reverse', 'flex-row')}`}>
                  <button
                    onClick={() => navigate('/login')}
                    className="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:bg-opacity-10"
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
                    {t('navbar.login')}
                  </button>
                  <button
                    onClick={() => navigate('/signup')}
                    className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {t('navbar.signup')}
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <button
                onClick={toggleMobileMenu}
                className="p-2 rounded-lg transition-all duration-200 hover:bg-opacity-10"
                style={{
                  color: 'var(--primary-text)',
                  background: 'transparent',
                }}
                aria-label="Toggle mobile menu"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
              {/* Mobile Search */}
              <div className="relative mb-4" ref={mobileSearchRef}>
                <form onSubmit={handleSearch} className="relative">
                  <input
                    type="text"
                    placeholder={t('navbar.searchPlaceholder')}
                    value={searchQuery}
                    onChange={handleMobileSearchInputChange}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    style={{
                      background: 'var(--input-bg)',
                      color: 'var(--primary-text)',
                      borderColor: 'var(--border-color)',
                    }}
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                </form>
                {isMobileSearchDropdownOpen && (
                  <SearchDropdown
                    query={searchQuery}
                    onClose={() => setIsMobileSearchDropdownOpen(false)}
                  />
                )}
              </div>

              {/* Mobile Navigation Links */}
              <a
                href="/"
                className="block px-3 py-2 rounded-md text-base font-medium transition-colors"
                style={{
                  color: 'var(--primary-text)',
                  background: 'transparent',
                }}
                onClick={closeMobileMenu}
              >
                {t('navigation.home')}
              </a>
              <a
                href="/products"
                className="block px-3 py-2 rounded-md text-base font-medium transition-colors"
                style={{
                  color: 'var(--primary-text)',
                  background: 'transparent',
                }}
                onClick={closeMobileMenu}
              >
                {t('navigation.categories')}
              </a>
              <a
                href="/about"
                className="block px-3 py-2 rounded-md text-base font-medium transition-colors"
                style={{
                  color: 'var(--primary-text)',
                  background: 'transparent',
                }}
                onClick={closeMobileMenu}
              >
                {t('navigation.about')}
              </a>

              {/* Mobile Actions */}
              <div className="pt-4 pb-3 border-t border-slate-200 dark:border-slate-700">
                <div className={`flex items-center justify-between ${getDirectionalClass('', isRTL, 'flex-row-reverse', 'flex-row')}`}>
                  <button
                    onClick={() => changeLanguage(language === 'en' ? 'ar' : 'en')}
                    className="px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:bg-opacity-10"
                    style={{
                      color: 'var(--primary-text)',
                      background: 'transparent',
                    }}
                  >
                    {language === 'en' ? 'العربية' : 'EN'}
                  </button>
                  <button
                    onClick={toggleTheme}
                    className="px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:bg-opacity-10"
                    style={{
                      color: 'var(--primary-text)',
                      background: 'transparent',
                    }}
                  >
                    {theme === 'dark' ? t('navbar.lightMode') : t('navbar.darkMode')}
                  </button>
                </div>

                {isAuthenticated ? (
                  <div className="mt-4">
                    <button
                      onClick={() => {
                        navigate('/profile');
                        closeMobileMenu();
                      }}
                      className="block w-full text-left px-3 py-2 text-sm font-medium rounded-lg transition-colors"
                      style={{
                        color: 'var(--primary-text)',
                        background: 'transparent',
                      }}
                    >
                      {language === 'ar' ? 'الملف الشخصي' : 'Profile'}
                    </button>
                    <button
                      onClick={() => {
                        logout();
                        closeMobileMenu();
                      }}
                      className="block w-full text-left px-3 py-2 text-sm font-medium rounded-lg transition-colors"
                      style={{
                        color: 'var(--primary-text)',
                        background: 'transparent',
                      }}
                    >
                      {language === 'ar' ? 'تسجيل الخروج' : 'Logout'}
                    </button>
                  </div>
                ) : (
                  <div className={`mt-4 flex space-x-2 ${getDirectionalClass('', isRTL, 'flex-row-reverse', 'flex-row')}`}>
                    <button
                      onClick={() => {
                        navigate('/login');
                        closeMobileMenu();
                      }}
                      className="flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:bg-opacity-10"
                      style={{
                        color: 'var(--primary-text)',
                        background: 'transparent',
                      }}
                    >
                      {t('navbar.login')}
                    </button>
                    <button
                      onClick={() => {
                        navigate('/signup');
                        closeMobileMenu();
                      }}
                      className="flex-1 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {t('navbar.signup')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default NavbarMain;
