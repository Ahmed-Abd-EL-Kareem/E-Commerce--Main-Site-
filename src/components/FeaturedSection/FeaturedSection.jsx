import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import headphone2 from '../../assets/images/headphone2.png';

const FeaturedSection = ({ product, loading }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleProductClick = () => {
    if (product) {
      navigate(`/product/${product.id}`);
    }
  };

  if (loading) {
    return (
      <section
        className="my-12 rounded-2xl p-6 md:p-8 w-full box-border overflow-x-hidden"
        style={{
          background: 'var(--primary-bg)',
          border: '1px solid var(--card-border)'
        }}
      >
        <div className="text-center text-lg py-12" style={{ color: 'var(--secondary-text)' }}>{t('common.loading')}</div>
      </section>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <section
      className="my-12 rounded-2xl p-6 md:p-8 w-full box-border overflow-x-hidden"
      style={{
        background: 'var(--primary-bg)',
        border: '1px solid var(--card-border)'
      }}
    >
      <div
        className="flex flex-col lg:flex-row gap-0 items-stretch rounded-2xl shadow-[0_8px_32px_rgba(37,99,235,0.15)] overflow-hidden transition-all duration-300 group hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(37,99,235,0.2)]"
        style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--card-border)'
        }}
      >
        {/* Product Image */}
        <div
          className="flex-1.2 min-w-0 h-full flex items-center justify-center relative overflow-hidden cursor-pointer"
          style={{
            background: 'linear-gradient(135deg, var(--image-bg-from, #f0f6ff66), var(--image-bg-to, #e0e7ef1a))'
          }}
          onClick={handleProductClick}
        >
          <img
            src={product.thumbnail || headphone2}
            alt={product.title || 'Featured Product'}
            className="w-full h-full max-w-[700px] max-h-[700px] object-cover rounded-t-2xl lg:rounded-l-2xl lg:rounded-t-none transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              e.target.src = headphone2;
            }}
          />
          {/* Subtle overlay gradient */}
          <div className="absolute inset-0 pointer-events-none z-10"
            style={{
              background: 'linear-gradient(135deg, var(--image-overlay-from, #2563eb0d), var(--image-overlay-to, #60a5fa00))'
            }}
          />
        </div>
        {/* Product Info */}
        <div className="flex-1 flex flex-col justify-center items-center p-8 md:p-12 bg-transparent text-center relative">
          {/* Decorative circle */}
          <div className="absolute top-6 right-6 w-24 h-24 rounded-full z-0"
            style={{
              background: 'radial-gradient(circle, var(--accent-circle-from, #34d3991a) 0%, transparent 100%)'
            }}
          />
          <div className="flex flex-col items-center gap-8 w-full max-w-xl relative z-10">
            <span
              className="font-semibold text-base mb-0 px-4 py-2 rounded-full uppercase tracking-wider"
              style={{
                color: 'var(--accent-text, #059669)',
                background: 'var(--accent-bg, #d1fae5)'
              }}
            >{t('featured.inStockNow')}</span>
            <h2 className="text-2xl md:text-3xl font-bold mb-2 leading-tight" style={{ color: 'var(--primary-text)' }}>
              {product.title || 'Featured Product'}
            </h2>
            <p className="text-base md:text-lg leading-relaxed mb-4" style={{ color: 'var(--secondary-text)' }}>
              {product.description || t('featured.description')}
            </p>
            <div
              className="flex items-center gap-4 rounded-lg p-4 mt-4 max-w-xs mx-auto cursor-pointer transition-colors duration-200"
              style={{
                background: 'var(--card-bg)',
                border: '1px solid var(--card-border)'
              }}
              onClick={handleProductClick}
            >
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-md mr-4"
                style={{ background: 'var(--icon-bg, #e5e7eb)' }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="7" width="18" height="14" rx="3" fill="#888"/>
                  <circle cx="12" cy="14" r="4" fill="#fff"/>
                  <rect x="8" y="3" width="8" height="4" rx="2" fill="#888"/>
                  <circle cx="12" cy="14" r="2" fill="#888"/>
                </svg>
              </span>
              <div className="flex flex-col items-start flex-1">
              <span className="text-xs font-semibold" style={{ color: 'var(--secondary-text)' }}>
                {product.brand || 'STOCKMART'}
              </span>
                <span className="font-semibold" style={{ color: 'var(--primary-text)' }}>{product.title || 'Featured Product'}</span>
              </div>
              <span className="font-bold text-lg" style={{ color: 'var(--accent-text, #2563eb)' }}>{t('common.currency')}{product.price || '215.00'}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedSection; 