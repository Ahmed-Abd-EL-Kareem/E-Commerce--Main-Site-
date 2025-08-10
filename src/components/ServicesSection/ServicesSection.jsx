import React from 'react';
import { useTranslation } from 'react-i18next';

const ServicesSection = () => {
  const { t } = useTranslation();

  const services = [
    { icon: '🚚', title: t('services.freeShipping.title'), desc: t('services.freeShipping.description') },
    { icon: '💸', title: t('services.returns.title'), desc: t('services.returns.description') },
    { icon: '💬', title: t('services.support.title'), desc: t('services.support.description') },
    { icon: '💳', title: t('services.warranty.title'), desc: t('services.warranty.description') },
  ];

  return (
    <section className="my-12 px-4 w-full overflow-x-hidden">
      <div className="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto w-full">
        {services.map((service, idx) => (
          <React.Fragment key={service.title}>
            <div
              className="relative rounded-2xl shadow-lg flex items-center gap-6 p-6 flex-1 min-w-[250px] lg:min-w-[220px] hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(37,99,235,0.15)] transition-all duration-300 group"
              style={{
                background: 'var(--card-bg)',
                color: 'var(--primary-text)',
                border: '1px solid var(--card-border)'
              }}
            >
              {/* Accent Bar */}
              <div className="absolute top-0 left-0 w-1 h-full rounded-l-2xl"
                style={{
                  background: 'linear-gradient(to bottom, var(--accent-gradient-from, #2563eb), var(--accent-gradient-to, #60a5fa))'
                }}
              />
              {/* Icon */}
              <div
                className="flex-shrink-0 w-20 h-20 lg:w-[90px] lg:h-[90px] rounded-2xl flex items-center justify-center text-4xl lg:text-5xl"
                style={{
                  background: 'linear-gradient(135deg, var(--icon-bg-from, #eff6ff), var(--icon-bg-to, #dbeafe))'
                }}
              >
                {service.icon}
              </div>
              {/* Content */}
              <div className="flex-1">
                <h4 className="font-bold text-lg lg:text-xl mb-2" style={{ color: 'var(--primary-text)' }}>
                  {service.title}
                </h4>
                <p className="text-sm lg:text-base leading-relaxed" style={{ color: 'var(--secondary-text)' }}>
                  {service.desc}
                </p>
              </div>
            </div>
            {/* Divider - Only show on large screens */}
            {idx !== services.length - 1 && (
              <div className="hidden lg:block w-0.5 rounded-full self-stretch min-h-[80px] flex-shrink-0"
                style={{
                  background: 'linear-gradient(to bottom, var(--accent-gradient-from, #2563eb), var(--accent-gradient-to, #60a5fa))'
                }}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </section>
  );
};

export default ServicesSection; 