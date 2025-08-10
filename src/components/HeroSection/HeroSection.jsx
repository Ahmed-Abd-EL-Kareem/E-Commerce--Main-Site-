import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import { useTranslation } from 'react-i18next';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

const HeroSection = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [heroProducts, setHeroProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHeroProducts = async () => {
      try {
        setLoading(true);
        // Fetch featured products for hero slider
        const response = await fetch('https://dummyjson.com/products?limit=4&skip=0');
        const data = await response.json();
        setHeroProducts(data.products);
      } catch (error) {
        console.error('Error fetching hero products:', error);
        // Fallback to empty array if fetch fails
        setHeroProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHeroProducts();
  }, []);

  const handleProductClick = (product) => {
    navigate(`/product/${product.id}`);
  };

  const getDiscountedPrice = (product) => {
    if (product.discountPercentage > 0) {
      return (product.price * (1 - product.discountPercentage / 100)).toFixed(2);
    }
    return product.price;
  };

  if (loading) {
    return (
      <section className="grid grid-cols-1 gap-6 my-8 mx-0 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl w-full box-border overflow-hidden">
        <div className="relative rounded-xl overflow-hidden">
          <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 bg-gradient-to-br from-blue-800 to-slate-900 rounded-xl shadow-lg">
            <div className="w-10 h-10 border-3 border-white/30 border-t-blue-400 rounded-full animate-spin"></div>
            <p className="text-white/80 text-base">{t('common.loading')}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 min-h-[180px] flex flex-col justify-center items-start relative overflow-hidden shadow-lg">
            <span className="text-orange-200 text-sm font-bold tracking-wider inline-block bg-white/15 px-4 py-2 rounded-full backdrop-blur-sm border border-white/20">{t('navigation.gaming')}</span>
            <h3 className="text-white text-lg font-semibold mt-2 text-shadow-sm">{t('hero.subtitle')}</h3>
          </div>
          <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl p-6 min-h-[180px] flex flex-col justify-center items-start relative overflow-hidden shadow-lg">
            <span className="text-purple-200 text-sm font-bold tracking-wider inline-block bg-white/15 px-4 py-2 rounded-full backdrop-blur-sm border border-white/20">{t('navigation.headphones')}</span>
            <h3 className="text-white text-lg font-semibold mt-2 text-shadow-sm">{t('featured.description')}</h3>
          </div>
          <div className="bg-gradient-to-br from-green-600 to-teal-700 rounded-2xl p-6 min-h-[180px] flex flex-col justify-center items-start relative overflow-hidden shadow-lg">
            <span className="text-green-200 text-sm font-bold tracking-wider inline-block bg-white/15 px-4 py-2 rounded-full backdrop-blur-sm border border-white/20">{t('navigation.smartwatches')}</span>
            <h3 className="text-white text-lg font-semibold mt-2 text-shadow-sm">{t('hero.subtitle')}</h3>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="grid grid-cols-1 gap-6 my-8 mx-0 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl w-full box-border overflow-hidden">
      <div className="relative rounded-xl overflow-hidden">
        <Swiper
          modules={[Pagination, Autoplay, EffectFade]}
          spaceBetween={0}
          slidesPerView={1}
          pagination={{
            el: '.hero-swiper-pagination',
            clickable: true,
            renderBullet: (index, className) => {
              return `<span class="${className} hero-pagination-bullet"></span>`;
            },
          }}
          autoplay={{
            delay: 4000,
            disableOnInteraction: false,
          }}
          effect="fade"
          fadeEffect={{
            crossFade: true
          }}
          loop={true}
          dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}
          className="w-full h-full rounded-xl"
        >
          {heroProducts.map((product) => (
            <SwiperSlide key={product.id}>
              <div 
                className="relative bg-gradient-to-br from-blue-800 to-slate-900 rounded-xl shadow-lg min-h-[400px] flex items-center justify-start p-8 md:p-12 bg-cover bg-center bg-no-repeat overflow-hidden cursor-pointer transition-transform duration-300 hover:scale-[1.01]"
                style={{ backgroundImage: `url(${product.thumbnail})` }}
                onClick={() => handleProductClick(product)}
              >
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-800/95 via-slate-900/85 to-blue-800/90 z-10"></div>
                
                <div className="max-w-[60%] z-20 flex flex-col items-start gap-4 relative">
                  <span className="text-blue-400 text-sm font-bold tracking-wider inline-block bg-white/15 px-4 py-2 rounded-full backdrop-blur-sm border border-white/20">
                    {product.brand || t('featured.inStockNow')}
                  </span>
                  
                  <h2 className="text-4xl font-bold text-white leading-tight drop-shadow-lg">
                    {product.title}
                  </h2>
                  
                  <p className="text-white/90 text-lg leading-relaxed max-w-[90%]">
                    {product.description}
                  </p>
                  
                  <div className="flex flex-col gap-3 my-4">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-2xl font-bold text-white drop-shadow-lg">
                        {t('common.currency')}{getDiscountedPrice(product)}
                      </span>
                      {product.discountPercentage > 0 && (
                        <>
                          <span className="text-lg text-white/60 line-through font-medium">
                            {t('common.currency')}{product.price}
                          </span>
                          <span className="bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-semibold px-3 py-1 rounded-full">
                            -{Math.round(product.discountPercentage)}%
                          </span>
                        </>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 text-white/80">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 1L10.472 5.236L15.528 6.472L11.764 10.236L12.944 15.292L8 13.236L3.056 15.292L4.236 10.236L0.472 6.472L5.528 5.236L8 1Z" fill="#FFC107"/>
                      </svg>
                      <span className="font-medium">{product.rating}</span>
                      <span className="text-sm">({Math.floor(Math.random() * 500) + 50} {t('productDetails.reviews.basedOn_plural', { count: Math.floor(Math.random() * 500) + 50 }).split(' ')[2]})</span>
                    </div>
                  </div>
                  
                  <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold text-lg px-10 py-4 rounded-full shadow-[0_4px_20px_rgba(59,130,246,0.3)] hover:shadow-[0_6px_25px_rgba(37,99,235,0.4)] transition-all duration-300 hover:-translate-y-1 inline-flex items-center justify-center min-h-[48px] mt-2 uppercase tracking-wide">
                    {t('hero.shopNow')}
                  </button>
                </div>
                
                {/* Product Image Overlay */}
                <div className="absolute right-8 top-1/2 -translate-y-1/2 w-64 h-64 z-20 hidden lg:block">
                  <img 
                    src={product.thumbnail} 
                    alt={product.title}
                    className="w-full h-full object-contain drop-shadow-2xl"
                  />
                </div>
              </div>
            </SwiperSlide>
          ))}
          
          {/* Custom Pagination */}
          <div className="hero-swiper-pagination absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2"></div>
        </Swiper>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 min-h-[180px] flex flex-col justify-center items-start relative overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
          <span className="text-orange-200 text-sm font-bold tracking-wider inline-block bg-white/15 px-4 py-2 rounded-full backdrop-blur-sm border border-white/20">
            {t('navigation.gaming')}
          </span>
          <h3 className="text-white text-lg font-semibold mt-2 drop-shadow-sm">
            {t('hero.subtitle')}
          </h3>
        </div>
        
        <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl p-6 min-h-[180px] flex flex-col justify-center items-start relative overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
          <span className="text-purple-200 text-sm font-bold tracking-wider inline-block bg-white/15 px-4 py-2 rounded-full backdrop-blur-sm border border-white/20">
            {t('navigation.headphones')}
          </span>
          <h3 className="text-white text-lg font-semibold mt-2 drop-shadow-sm">
            {t('featured.description')}
          </h3>
        </div>
        
        <div className="bg-gradient-to-br from-green-600 to-teal-700 rounded-2xl p-6 min-h-[180px] flex flex-col justify-center items-start relative overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
          <span className="text-green-200 text-sm font-bold tracking-wider inline-block bg-white/15 px-4 py-2 rounded-full backdrop-blur-sm border border-white/20">
            {t('navigation.smartwatches')}
          </span>
          <h3 className="text-white text-lg font-semibold mt-2 drop-shadow-sm">
            {t('hero.subtitle')}
          </h3>
        </div>
      </div>
      
      <style jsx>{`
        .hero-pagination-bullet {
          width: 12px;
          height: 12px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .hero-pagination-bullet:hover {
          background: rgba(255, 255, 255, 0.6);
          transform: scale(1.2);
        }
        
        .hero-pagination-bullet.swiper-pagination-bullet-active {
          background: rgba(59, 130, 246, 0.9);
          transform: scale(1.3);
        }
        
        @media (max-width: 768px) {
          .hero-pagination-bullet {
            width: 10px;
            height: 10px;
          }
        }
      `}</style>
    </section>
  );
};

export default HeroSection; 