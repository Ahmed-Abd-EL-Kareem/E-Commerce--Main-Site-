import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Custom hook for consistent language handling
 * Provides language state, direction, and utility functions
 */
export const useLanguage = () => {
  const { i18n, t } = useTranslation();
  const [language, setLanguage] = useState(i18n.language);
  const [direction, setDirection] = useState(i18n.language === 'ar' ? 'rtl' : 'ltr');

  useEffect(() => {
    const handleLanguageChange = (event) => {
      const newLanguage = event.detail?.language || i18n.language;
      const newDirection = newLanguage === 'ar' ? 'rtl' : 'ltr';
      
      setLanguage(newLanguage);
      setDirection(newDirection);
    };

    // Listen for language changes
    window.addEventListener('languageChanged', handleLanguageChange);
    
    // Initial setup
    setLanguage(i18n.language);
    setDirection(i18n.language === 'ar' ? 'rtl' : 'ltr');

    return () => {
      window.removeEventListener('languageChanged', handleLanguageChange);
    };
  }, [i18n.language]);

  const isRTL = direction === 'rtl';
  const isLTR = direction === 'ltr';

  return {
    language,
    direction,
    isRTL,
    isLTR,
    t
  };
};

/**
 * Utility function to get localized text from object
 * @param {Object} textObj - Object with language keys
 * @param {string} language - Current language
 * @param {string} fallback - Fallback text
 * @returns {string} Localized text
 */
export const getLocalizedText = (textObj, language, fallback = '') => {
  if (!textObj) return fallback;
  
  if (typeof textObj === 'string') return textObj;
  
  if (typeof textObj === 'object') {
    return textObj[language] || textObj['en'] || textObj['ar'] || fallback;
  }
  
  return fallback;
};

/**
 * Utility function to get localized image from object
 * @param {Object} imageObj - Object with language keys
 * @param {string} language - Current language
 * @param {string} fallback - Fallback image URL
 * @returns {string} Localized image URL
 */
export const getLocalizedImage = (imageObj, language, fallback = '') => {
  if (!imageObj) return fallback;
  
  if (typeof imageObj === 'string') return imageObj;
  
  if (typeof imageObj === 'object') {
    return imageObj[language] || imageObj['en'] || imageObj['ar'] || fallback;
  }
  
  return fallback;
};

/**
 * Utility function to format currency based on language
 * @param {number} amount - Amount to format
 * @param {string} language - Current language
 * @returns {string} Formatted currency
 */
export const formatCurrency = (amount, language) => {
  if (language === 'ar') {
    return `${amount} ر.س`;
  }
  return `$${amount}`;
};

/**
 * Utility function to get RTL-aware class names
 * @param {string} baseClass - Base CSS class
 * @param {boolean} isRTL - Whether current direction is RTL
 * @param {string} rtlClass - RTL-specific class
 * @param {string} ltrClass - LTR-specific class
 * @returns {string} Combined class names
 */
export const getDirectionalClass = (baseClass, isRTL, rtlClass = '', ltrClass = '') => {
  const classes = [baseClass];
  
  if (isRTL && rtlClass) {
    classes.push(rtlClass);
  } else if (!isRTL && ltrClass) {
    classes.push(ltrClass);
  }
  
  return classes.join(' ');
};

/**
 * Utility function to get RTL-aware flex direction
 * @param {boolean} isRTL - Whether current direction is RTL
 * @param {string} defaultDir - Default direction (row/column)
 * @returns {string} Flex direction class
 */
export const getFlexDirection = (isRTL, defaultDir = 'row') => {
  if (defaultDir === 'row') {
    return isRTL ? 'flex-row-reverse' : 'flex-row';
  }
  return `flex-${defaultDir}`;
};

/**
 * Utility function to get RTL-aware text alignment
 * @param {boolean} isRTL - Whether current direction is RTL
 * @param {string} defaultAlign - Default alignment
 * @returns {string} Text alignment class
 */
export const getTextAlignment = (isRTL, defaultAlign = 'left') => {
  if (defaultAlign === 'left') {
    return isRTL ? 'text-right' : 'text-left';
  }
  if (defaultAlign === 'right') {
    return isRTL ? 'text-left' : 'text-right';
  }
  return `text-${defaultAlign}`;
};

/**
 * Utility function to get RTL-aware margin/padding
 * @param {boolean} isRTL - Whether current direction is RTL
 * @param {string} side - Side (left/right)
 * @param {string} size - Size (sm/md/lg/xl)
 * @param {string} type - Type (margin/padding)
 * @returns {string} Spacing class
 */
export const getSpacing = (isRTL, side, size, type = 'margin') => {
  const rtlSide = side === 'left' ? 'right' : 'left';
  const actualSide = isRTL ? rtlSide : side;
  return `${type}-${actualSide}-${size}`;
};

/**
 * Utility function to transform icon for RTL
 * @param {boolean} isRTL - Whether current direction is RTL
 * @param {string} iconClass - Icon CSS class
 * @returns {string} Transformed icon class
 */
export const getIconClass = (isRTL, iconClass) => {
  if (isRTL && (iconClass.includes('arrow-left') || iconClass.includes('arrow-right'))) {
    return iconClass.replace('arrow-left', 'arrow-right').replace('arrow-right', 'arrow-left');
  }
  return iconClass;
};

/**
 * Utility function to get RTL-aware animation
 * @param {boolean} isRTL - Whether current direction is RTL
 * @param {string} animation - Animation name
 * @returns {string} Animation class
 */
export const getAnimation = (isRTL, animation) => {
  if (isRTL && animation.includes('slide')) {
    return animation.replace('slide-left', 'slide-right').replace('slide-right', 'slide-left');
  }
  return animation;
};

/**
 * Utility function to get RTL-aware transform
 * @param {boolean} isRTL - Whether current direction is RTL
 * @param {string} transform - Transform value
 * @returns {string} RTL-aware transform
 */
export const getTransform = (isRTL, transform) => {
  if (isRTL && transform.includes('translateX')) {
    return transform.replace('translateX(-', 'translateX(').replace('translateX(', 'translateX(-');
  }
  return transform;
};

/**
 * Utility function to get RTL-aware position
 * @param {boolean} isRTL - Whether current direction is RTL
 * @param {string} position - Position value (left/right)
 * @returns {string} RTL-aware position
 */
export const getPosition = (isRTL, position) => {
  if (position === 'left') {
    return isRTL ? 'right' : 'left';
  }
  if (position === 'right') {
    return isRTL ? 'left' : 'right';
  }
  return position;
};

/**
 * Utility function to get RTL-aware order
 * @param {boolean} isRTL - Whether current direction is RTL
 * @param {number} order - CSS order value
 * @returns {number} RTL-aware order
 */
export const getOrder = (isRTL, order) => {
  // This is a simplified version - you might need more complex logic
  // depending on your specific layout requirements
  return isRTL ? -order : order;
}; 