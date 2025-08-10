import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode } from 'swiper/modules';
import { useTranslation } from 'react-i18next';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/free-mode';

import { swiperConfigs, createSwiperConfig } from '../../utils/swiperConfig';

const CategoryCarousel = ({ 
  categories, 
  activeCategory, 
  onCategoryClick,
  className = ''
}) => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const swiperConfig = createSwiperConfig(
    swiperConfigs.categories,
    {},
    isRTL
  );

  return (
    <div className={`w-full my-4 ${className}`}>
      <Swiper
        modules={[FreeMode]}
        {...swiperConfig}
        className="w-full py-2"
      >
        {categories.map(category => (
          <SwiperSlide key={category.id} className="!w-auto flex-shrink-0">
            <button
              className={`relative flex items-center gap-2 px-5 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer transition-all duration-300 whitespace-nowrap min-h-[44px] shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900 ${isRTL ? 'flex-row-reverse' : ''} ${activeCategory === category.id ? 'border-orange-500 text-orange-500 bg-orange-50 dark:bg-orange-900/20 font-semibold -translate-y-0.5 shadow-[0_4px_12px_rgba(255,125,26,0.2)]' : 'text-slate-700 dark:text-slate-200 hover:border-orange-500 hover:text-orange-500 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(255,125,26,0.15)] hover:bg-orange-50/50 dark:hover:bg-orange-900/10'}`}
              onClick={() => onCategoryClick?.(category.id)}
            >
              {category.icon && (
                <span className="text-lg flex items-center justify-center">{category.icon}</span>
              )}
              <span className="font-medium text-sm leading-none">{category.label}</span>
              {activeCategory === category.id && (
                <span className="absolute bottom-[-2px] left-1/2 -translate-x-1/2 w-6 h-1 bg-orange-500 rounded animate-[slideIn_0.3s_ease]"></span>
              )}
            </button>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default CategoryCarousel; 