import React from 'react';

const customServices = [
  {
    icon: '🚚',
    title: 'Free Shipping & Returns',
    desc: 'Shop with confidence and have your favorite electronics delivered right to your doorstep without any additional cost.',
  },
  {
    icon: '💸',
    title: 'Money Back Guarantee',
    desc: "If you're not completely satisfied with your purchase, we'll make it right. No questions asked.",
  },
  {
    icon: '💬',
    title: 'Online Support 24/7',
    desc: "Need help with your electronics? Get in touch with us anytime, anywhere, and let's get your tech sorted.",
  },
  {
    icon: '%',
    title: 'Regular Sales',
    desc: "Don't miss out on our amazing deals with regular sales on our top-of-the-line electronics.",
  },
];

const CustomServicesSection = () => (
  <section className="my-12 px-4 w-full overflow-x-hidden">
    <div className="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto w-full">
      {customServices.map((service, idx) => (
        <React.Fragment key={service.title}>
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 flex items-center gap-6 p-6 flex-1 min-w-[250px] lg:min-w-[220px] hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(37,99,235,0.15)] transition-all duration-300 group">
            {/* Accent Bar */}
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-600 to-blue-400 rounded-l-2xl" />
            
            {/* Icon */}
            <div className="flex-shrink-0 w-20 h-20 lg:w-[90px] lg:h-[90px] bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl flex items-center justify-center text-4xl lg:text-5xl">
              {service.icon}
            </div>
            
            {/* Content */}
            <div className="flex-1">
              <h4 className="font-bold text-slate-900 dark:text-white text-lg lg:text-xl mb-2">
                {service.title}
              </h4>
              <p className="text-slate-600 dark:text-slate-400 text-sm lg:text-base leading-relaxed">
                {service.desc}
              </p>
            </div>
          </div>
          
          {/* Divider - Only show on large screens */}
          {idx !== customServices.length - 1 && (
            <div className="hidden lg:block w-0.5 bg-gradient-to-b from-blue-600 to-blue-400 rounded-full self-stretch min-h-[80px] flex-shrink-0" />
          )}
        </React.Fragment>
      ))}
    </div>
  </section>
);

export default CustomServicesSection; 