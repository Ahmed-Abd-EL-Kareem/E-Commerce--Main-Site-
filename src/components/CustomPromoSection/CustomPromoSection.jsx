import { useNavigate } from 'react-router-dom';
import playstation2 from '../../assets/images/playstation2.png';
import girdSec from '../../assets/images/girdSec.png';

const CustomPromoSection = () => {
  const navigate = useNavigate();

const customBanners = [
  {
    bg: playstation2,
    title: 'Crash high scores',
    desc: 'Designed for comfort and precision, our controller allows you to play your favorite games on your phone with ease.',
    btn: 'Shop Now',
    price: 'From $245',
  },
  {
    bg: girdSec,
    title: 'Swap styles in a snap',
    desc: 'Swap your style on the go with our smartwatches – change your look in seconds with customizable watch faces and bands, perfect for any occasion.',
    btn: 'Shop Now',
  },
];

  return (
    <section className="my-12 w-full box-border overflow-x-hidden">
    <div className="flex flex-col lg:flex-row gap-6 items-stretch">
      {customBanners.map((banner, idx) => (
        <div
          key={idx}
          className={`relative flex flex-col justify-end rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(37,99,235,0.15)] min-h-[350px] h-full transition-all duration-300 group hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(37,99,235,0.2)] ${idx === 0 ? 'flex-[2]' : 'flex-1'}`}
          style={{
            backgroundImage: `url(${banner.bg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'right',
            backgroundRepeat: 'no-repeat',
            border: '1px solid var(--card-border)',
            backgroundColor: 'var(--card-bg)'
          }}
        >
          {/* Overlay */}
          <div className="absolute inset-0 z-0"
            style={{
              background: 'linear-gradient(135deg, var(--promo-overlay-from, #1e293bcc), var(--promo-overlay-to, #0f172acc))'
            }}
          />
          {/* Content */}
          <div className="relative z-10 p-10 pb-8 rounded-b-2xl w-full"
            style={{ color: 'var(--primary-text)' }}
          >
            <h2 className="text-3xl font-bold mb-4 drop-shadow-lg leading-tight" style={{ color: 'var(--primary-text)' }}>{banner.title}</h2>
            <p className="mb-6 text-lg leading-relaxed drop-shadow-md" style={{ color: 'var(--secondary-text)' }}>{banner.desc}</p>
                          <div className="flex items-center flex-wrap gap-4">
                <button
                  onClick={() => navigate('/search')}
                  className="font-semibold px-8 py-3 rounded-full text-base uppercase tracking-wide shadow-lg hover:-translate-y-0.5 hover:shadow-xl transition-all duration-300"
                  style={{
                    background: 'var(--button-bg, #fff)',
                    color: 'var(--accent-text, #2563eb)'
                  }}
                >
                  {banner.btn}
                </button>
                {banner.price && <span className="font-bold text-xl drop-shadow-md" style={{ color: 'var(--primary-text)' }}>{banner.price}</span>}
              </div>
          </div>
        </div>
      ))}
    </div>
  </section>
  );
};

export default CustomPromoSection; 