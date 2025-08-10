import { useState } from 'react';

const faqs = [
  {
    question: 'What payment methods are accepted at your store?',
    answer: 'We accept credit cards, PayPal, and other secure payment methods.'
  },
  {
    question: 'How long does it take to process and ship my order?',
    answer: 'Orders are processed within 1-2 business days and shipped promptly.'
  },
  {
    question: "Can I return or exchange an item I've purchased from your online store?",
    answer: 'Yes, we offer a 30-day return and exchange policy for all products.'
  },
];

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = idx => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="my-8 mx-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg p-8">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">FAQ</h2>
      <div className="max-w-4xl mx-auto">
        {faqs.map((faq, idx) => (
          <div key={idx} className="border-b border-slate-200 dark:border-slate-700 last:border-b-0">
            <button 
              className="w-full bg-transparent border-none outline-none text-left text-lg font-medium py-4 cursor-pointer flex justify-between items-center text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              onClick={() => toggle(idx)}
            >
              {faq.question}
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400 transition-transform duration-300">
                {openIndex === idx ? '−' : '+'}
              </span>
            </button>
            {openIndex === idx && (
              <div className="pb-4 text-slate-600 dark:text-slate-400 text-base leading-relaxed animate-in slide-in-from-top-2 duration-300">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default FAQSection; 