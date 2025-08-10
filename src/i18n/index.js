import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import enTranslations from './locales/en.json';
import arTranslations from './locales/ar.json';

const resources = {
  en: {
    translation: enTranslations
  },
  ar: {
    translation: arTranslations
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    
    interpolation: {
      escapeValue: false, // React already does escaping
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
    
    react: {
      useSuspense: false,
    }
  });

// Enhanced language switching with smooth transitions
i18n.on('languageChanged', (lng) => {
  const dir = lng === 'ar' ? 'rtl' : 'ltr';
  
  // Add transition class to body for smooth language switching
  document.body.classList.add('language-transitioning');
  
  // Update document attributes
  document.documentElement.dir = dir;
  document.documentElement.lang = lng;
  document.documentElement.setAttribute('data-language', lng);
  
  // Remove transition class after animation completes
  setTimeout(() => {
    document.body.classList.remove('language-transitioning');
  }, 300);
  
  // Trigger custom event for components to react to language changes
  window.dispatchEvent(new CustomEvent('languageChanged', { 
    detail: { language: lng, direction: dir } 
  }));
});

// Set initial direction and language
const currentLang = i18n.language || 'en';
const dir = currentLang === 'ar' ? 'rtl' : 'ltr';
document.documentElement.dir = dir;
document.documentElement.lang = currentLang;
document.documentElement.setAttribute('data-language', currentLang);

export default i18n; 