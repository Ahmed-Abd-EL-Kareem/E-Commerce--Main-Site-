import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import labtop from '../../assets/images/labtop.png';
import lab2 from '../../assets/images/lab2.png';
import lab3 from '../../assets/images/lab3.png';

const slides = [
  { image: labtop },
  { image: lab2 },
  { image: lab3 },
];

const TechSection = () => {
  const { t } = useTranslation();
  const [current, setCurrent] = useState(0);

  // Auto-play functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prevCurrent) => (prevCurrent + 1) % slides.length);
    }, 4000); // Change slide every 4 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  const goToSlide = (idx) => {
    setCurrent(idx);
  };

  const nextSlide = () => {
    setCurrent((current + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrent((current - 1 + slides.length) % slides.length);
  };

  return (
    <section className="my-12">
      <div
        className="relative w-full rounded-3xl overflow-hidden shadow-[0_8px_32px_rgba(37,99,235,0.15)] min-h-[450px] hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(37,99,235,0.2)] transition-all duration-300"
        style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--card-border)'
        }}
      >
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700 ease-in-out"
          style={{ backgroundImage: `url(${slides[current].image})` }}
        />
        
        {/* Overlay */}
        <div className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, var(--overlay-from, #1e40afcc), var(--overlay-via, #0f172a99), var(--overlay-to, #0f172acc))'
          }}
        />
        
        {/* Content */}
        <div className="relative z-10 p-12 flex items-end justify-start min-h-[450px]">
          <div className="max-w-lg" style={{ color: 'var(--primary-text)' }}>
            <span className="inline-block text-sm font-semibold tracking-widest uppercase opacity-90 mb-4 backdrop-blur-md px-4 py-2 rounded-full"
              style={{
                background: 'var(--accent-bg, rgba(255, 255, 255, 0.15))'
              }}
            >
              {t('recommendations.new')}
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight text-shadow-lg" style={{ color: 'var(--primary-text)' }}>
              {t('hero.title')}
            </h2>
            <p className="text-lg mb-8 leading-relaxed" style={{ color: 'var(--secondary-text)' }}>
              {t('hero.subtitle')}
            </p>
            <button
              className="border-none px-8 py-4 rounded-full cursor-pointer font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 uppercase tracking-wide"
              style={{
                background: 'var(--button-bg, rgba(255, 255, 255, 0.9))',
                color: 'var(--accent-text, #2563eb)'
              }}
            >
              {t('hero.shopNow')}
            </button>
          </div>
        </div>

        {/* Navigation Buttons */}
        <button 
          onClick={prevSlide}
          className="absolute top-1/2 left-8 -translate-y-1/2 z-20 w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-110 backdrop-blur-md"
          style={{
            background: 'var(--button-bg, rgba(255, 255, 255, 0.95))'
          }}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--accent-text, #2563eb)' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <button 
          onClick={nextSlide}
          className="absolute top-1/2 right-8 -translate-y-1/2 z-20 w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-110 backdrop-blur-md"
          style={{
            background: 'var(--button-bg, rgba(255, 255, 255, 0.95))'
          }}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--accent-text, #2563eb)' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Pagination Dots */}
        <div className="absolute bottom-8 right-12 z-20 flex gap-4">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              className={`w-8 h-8 rounded-full transition-all duration-300 cursor-pointer backdrop-blur-md shadow-lg ${
                current === idx 
                  ? 'scale-110 shadow-[0_4px_20px_rgba(37,99,235,0.3)]' 
                  : 'hover:scale-110 opacity-70 hover:opacity-100'
              }`}
              style={{
                background: current === idx 
                  ? 'var(--accent-text, #2563eb)'
                  : 'var(--button-bg, rgba(255, 255, 255, 0.8))'
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TechSection; 