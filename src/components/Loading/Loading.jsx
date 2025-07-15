import React from "react";
import { useTranslation } from "react-i18next";

const Loading = () => {
  const { t } = useTranslation();
  return (
    <div
      className="flex flex-col justify-center items-center fixed inset-0 z-50 backdrop-blur-sm"
      style={{
        background: "rgba(255,255,255,0.45)",
        backgroundColor: "var(--card-bg, #fff)",
      }}
    >
      <div className="relative flex items-center justify-center">
        {/* سبينر خارجي دائري بتدرج لوني */}
        <svg className="w-24 h-24 animate-spin" viewBox="0 0 100 100">
          <defs>
            <linearGradient
              id="spinner-gradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="var(--primary-blue)" />
              <stop offset="100%" stopColor="var(--secondary-blue)" />
            </linearGradient>
          </defs>
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke="url(#spinner-gradient)"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray="180 120"
          />
        </svg>
        {/* سبينر داخلي دائري أصغر */}
        <svg
          className="absolute animate-spin-reverse"
          style={{ width: "44px", height: "44px", left: "28px", top: "28px" }}
          viewBox="0 0 44 44"
        >
          <circle
            cx="22"
            cy="22"
            r="16"
            stroke="var(--accent, #2563eb)"
            strokeWidth="5"
            fill="none"
            strokeLinecap="round"
            strokeDasharray="40 30"
          />
        </svg>
      </div>
      <span
        className="mt-8 text-lg font-bold tracking-wide drop-shadow-md select-none"
        style={{
          color: "var(--primary-blue)",
          textShadow: "0 2px 8px rgba(37,99,235,0.10)",
        }}
      >
        {t("common.loading")}
      </span>
    </div>
  );
};

// حركة عكسية للسبينر الداخلي
const style = document.createElement("style");
style.innerHTML = `
  .animate-spin-reverse {
    animation: spin-reverse 1.2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
  }
  @keyframes spin-reverse {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(-360deg); }
  }
`;
document.head.appendChild(style);

export default Loading;
