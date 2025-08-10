import React from 'react';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  
  return (
    <footer className="text-white"
      style={{
        background: 'linear-gradient(135deg, var(--footer-bg-from, #0f172a), var(--footer-bg-to, #1e3a8a))'
      }}
    >
      {/* Main Footer Content */}
      <div className="py-16 px-4">
        <div className={`max-w-[1400px] mx-auto ${isRTL ? 'text-right' : 'text-left'}`}>
          {/* Company Info */}
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12 ${isRTL ? 'text-right' : 'text-left'}`}>
            <div className="lg:col-span-1">
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--footer-text)' }}>Alamia</h2>
                <p className="leading-relaxed text-sm" style={{ color: 'var(--footer-text-secondary)' }}>{t('footer.company.about')}</p>
              </div>
              
              <div className={`flex gap-3 ${isRTL ? 'justify-end' : 'justify-start'}`}>
                <a 
                  href="#" 
                  aria-label="Facebook"
                  className="w-10 h-10 text-white rounded-lg flex items-center justify-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg border"
                  style={{
                    background: 'var(--footer-button-bg, rgba(255, 255, 255, 0.1))',
                    borderColor: 'var(--footer-border, rgba(255, 255, 255, 0.2))'
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a 
                  href="#" 
                  aria-label="Twitter"
                  className="w-10 h-10 text-white rounded-lg flex items-center justify-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg border"
                  style={{
                    background: 'var(--footer-button-bg, rgba(255, 255, 255, 0.1))',
                    borderColor: 'var(--footer-border, rgba(255, 255, 255, 0.2))'
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
                <a 
                  href="#" 
                  aria-label="Instagram"
                  className="w-10 h-10 text-white rounded-lg flex items-center justify-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg border"
                  style={{
                    background: 'var(--footer-button-bg, rgba(255, 255, 255, 0.1))',
                    borderColor: 'var(--footer-border, rgba(255, 255, 255, 0.2))'
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a 
                  href="#" 
                  aria-label="LinkedIn"
                  className="w-10 h-10 text-white rounded-lg flex items-center justify-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg border"
                  style={{
                    background: 'var(--footer-button-bg, rgba(255, 255, 255, 0.1))',
                    borderColor: 'var(--footer-border, rgba(255, 255, 255, 0.2))'
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--footer-text)' }}>{t('footer.quickLinks.title')}</h3>
              <ul className="space-y-2">
                <li>
                  <a 
                    href="/" 
                    className="transition-colors duration-200 text-sm hover:translate-x-1 inline-block"
                    style={{ color: 'var(--footer-text-secondary)' }}
                  >
                    {t('footer.quickLinks.home')}
                  </a>
                </li>
                <li>
                  <a 
                    href="/products" 
                    className="transition-colors duration-200 text-sm hover:translate-x-1 inline-block"
                    style={{ color: 'var(--footer-text-secondary)' }}
                  >
                    {t('footer.quickLinks.products')}
                  </a>
                </li>
                <li>
                  <a 
                    href="/categories" 
                    className="transition-colors duration-200 text-sm hover:translate-x-1 inline-block"
                    style={{ color: 'var(--footer-text-secondary)' }}
                  >
                    {t('footer.quickLinks.categories')}
                  </a>
                </li>
                <li>
                  <a 
                    href="/about" 
                    className="transition-colors duration-200 text-sm hover:translate-x-1 inline-block"
                    style={{ color: 'var(--footer-text-secondary)' }}
                  >
                    {t('footer.quickLinks.about')}
                  </a>
                </li>
                <li>
                  <a 
                    href="/contact" 
                    className="transition-colors duration-200 text-sm hover:translate-x-1 inline-block"
                    style={{ color: 'var(--footer-text-secondary)' }}
                  >
                    {t('footer.quickLinks.contact')}
                  </a>
                </li>
              </ul>
            </div>

            {/* Customer Service */}
            <div>
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--footer-text)' }}>{t('footer.customerService.title')}</h3>
              <ul className="space-y-2">
                <li>
                  <a 
                    href="/support" 
                    className="transition-colors duration-200 text-sm hover:translate-x-1 inline-block"
                    style={{ color: 'var(--footer-text-secondary)' }}
                  >
                    {t('footer.customerService.support')}
                  </a>
                </li>
                <li>
                  <a 
                    href="/returns" 
                    className="transition-colors duration-200 text-sm hover:translate-x-1 inline-block"
                    style={{ color: 'var(--footer-text-secondary)' }}
                  >
                    {t('footer.customerService.returns')}
                  </a>
                </li>
                <li>
                  <a 
                    href="/shipping" 
                    className="transition-colors duration-200 text-sm hover:translate-x-1 inline-block"
                    style={{ color: 'var(--footer-text-secondary)' }}
                  >
                    {t('footer.customerService.shipping')}
                  </a>
                </li>
                <li>
                  <a 
                    href="/faq" 
                    className="transition-colors duration-200 text-sm hover:translate-x-1 inline-block"
                    style={{ color: 'var(--footer-text-secondary)' }}
                  >
                    {t('footer.customerService.faq')}
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--footer-text)' }}>{t('footer.contact.title')}</h3>
              <div className="space-y-3">
                <div className={`flex items-start gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" style={{ color: 'var(--accent-text, #60a5fa)' }}>
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                  </svg>
                  <div>
                    <p className="text-sm" style={{ color: 'var(--footer-text-secondary)' }}>{t('footer.contact.email')}</p>
                    <a href="mailto:info@alamia.com" className="transition-colors duration-200 text-sm" style={{ color: 'var(--footer-text)' }}>
                      info@alamia.com
                    </a>
                  </div>
                </div>
                
                <div className={`flex items-start gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" style={{ color: 'var(--accent-text, #60a5fa)' }}>
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                  </svg>
                  <div>
                    <p className="text-sm" style={{ color: 'var(--footer-text-secondary)' }}>{t('footer.contact.phone')}</p>
                    <a href="tel:+1234567890" className="transition-colors duration-200 text-sm" style={{ color: 'var(--footer-text)' }}>
                      +1 (234) 567-890
                    </a>
                  </div>
                </div>
                
                <div className={`flex items-start gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" style={{ color: 'var(--accent-text, #60a5fa)' }}>
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                  </svg>
                  <div>
                    <p className="text-sm" style={{ color: 'var(--footer-text-secondary)' }}>{t('footer.contact.address')}</p>
                    <p className="text-sm" style={{ color: 'var(--footer-text)' }}>123 Tech Street, Digital City, DC 12345</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t py-6 px-4"
        style={{ borderColor: 'var(--footer-border, rgba(255, 255, 255, 0.2))' }}
      >
        <div className={`max-w-[1400px] mx-auto flex flex-col md:flex-row ${isRTL ? 'md:flex-row-reverse' : ''} justify-between items-center gap-4`}>
          
          {/* Copyright */}
          <div className={`text-sm ${isRTL ? 'text-center md:text-right' : 'text-center md:text-left'}`}
            style={{ color: 'var(--footer-text-secondary)' }}
          >
            <p>© 2024 Alamia. {t('footer.copyright')}</p>
          </div>

          {/* Payment Methods */}
          <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <span className="text-sm mr-2" style={{ color: 'var(--footer-text-secondary)' }}>{t('footer.paymentMethods')}:</span>
            <div className="flex gap-2">
              <div className="w-8 h-6 rounded flex items-center justify-center" style={{ background: 'var(--footer-text)' }}>
                <span className="text-xs font-bold" style={{ color: 'var(--accent-text, #2563eb)' }}>VISA</span>
              </div>
              <div className="w-8 h-6 rounded flex items-center justify-center" style={{ background: 'var(--footer-text)' }}>
                <span className="text-xs font-bold" style={{ color: 'var(--error-text, #dc2626)' }}>MC</span>
              </div>
              <div className="w-8 h-6 rounded flex items-center justify-center" style={{ background: 'var(--footer-text)' }}>
                <span className="text-xs font-bold" style={{ color: 'var(--accent-text, #2563eb)' }}>AMEX</span>
              </div>
              <div className="w-8 h-6 rounded flex items-center justify-center" style={{ background: 'var(--footer-text)' }}>
                <span className="text-xs font-bold" style={{ color: 'var(--warning-text, #ca8a04)' }}>PP</span>
              </div>
            </div>
          </div>

          {/* Legal Links */}
          <div className={`flex gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <a href="/privacy" className="transition-colors duration-200 text-sm" style={{ color: 'var(--footer-text-secondary)' }}>
              {t('footer.legal.privacy')}
            </a>
            <a href="/terms" className="transition-colors duration-200 text-sm" style={{ color: 'var(--footer-text-secondary)' }}>
              {t('footer.legal.terms')}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 