import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const GuidesSection = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const guides = [
    { icon: '🎮', title: t('guides.items.gamingSetup.title'), desc: t('guides.items.gamingSetup.description') },
    { icon: '📱', title: t('guides.items.smartHome.title'), desc: t('guides.items.smartHome.description') },
    { icon: '🎧', title: t('guides.items.choosingHeadphones.title'), desc: t('guides.items.choosingHeadphones.description') },
    { icon: '🛠️', title: t('guides.items.gamingSetup.title'), desc: t('guides.items.gamingSetup.description') },
    { icon: '⚡', title: t('guides.items.smartHome.title'), desc: t('guides.items.smartHome.description') },
    { icon: '📱', title: t('guides.items.choosingHeadphones.title'), desc: t('guides.items.choosingHeadphones.description') },
  ];

  return (
    <section className="my-12 px-4 max-w-7xl mx-auto w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-6 mb-8">
        <div className="flex flex-col gap-2">
          <span className="inline-block text-sm font-semibold tracking-widest uppercase px-4 py-1 rounded-full w-fit"
            style={{
              color: 'var(--accent-text, #2563eb)',
              background: 'var(--accent-bg, #eff6ff)'
            }}
          >
            {t('guides.subtitle')}
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight" style={{ color: 'var(--primary-text)' }}>
            {t('guides.title')}
          </h2>
        </div>
        <button
          onClick={() => navigate('/search')}
          className="px-8 py-3 border-2 rounded-full font-semibold text-sm uppercase tracking-wide hover:-translate-y-1 hover:shadow-lg w-full sm:w-auto transition-all duration-300"
          style={{
            borderColor: 'var(--accent-text, #2563eb)',
            color: 'var(--accent-text, #2563eb)'
          }}
        >
          {t('common.viewAll')}
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {guides.map((guide, idx) => (
          <div 
            key={idx} 
            className="relative rounded-2xl border shadow-lg p-6 flex flex-col gap-6 min-h-[220px] hover:-translate-y-2 hover:shadow-[0_8px_32px_rgba(37,99,235,0.15)] transition-all duration-300 group"
            style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--card-border)'
            }}
          >
            {/* Accent Bar */}
            <div className="absolute top-0 left-0 w-1 h-full rounded-l-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background: 'linear-gradient(to bottom, var(--accent-gradient-from, #2563eb), var(--accent-gradient-to, #60a5fa))'
              }}
            />
            
            {/* Icon */}
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl"
              style={{
                background: 'linear-gradient(135deg, var(--icon-bg-from, #eff6ff), var(--icon-bg-to, #dbeafe))'
              }}
            >
              {guide.icon}
            </div>
            
            {/* Title */}
            <h3 className="font-semibold text-lg sm:text-xl leading-relaxed line-clamp-3 flex-grow" style={{ color: 'var(--primary-text)' }}>
              {guide.title}
            </h3>
            
            {/* Read More Link */}
            <a 
              href="#" 
              className="font-semibold text-sm uppercase tracking-wide inline-flex items-center gap-3 py-3 transition-colors group-hover:translate-x-1"
              style={{ color: 'var(--accent-text, #2563eb)' }}
            >
              {t('guides.readMore')}
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        ))}
      </div>
    </section>
  );
};

export default GuidesSection; 