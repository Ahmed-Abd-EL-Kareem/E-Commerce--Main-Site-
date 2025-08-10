import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";

const ThemeContext = createContext();
const THEME_KEY = "theme-preference";

function getInitialTheme() {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === "dark" || stored === "light") return stored;
  } catch {
    // تجاهل أي خطأ في localStorage
  }
  if (window.matchMedia("(prefers-color-scheme: dark)").matches) return "dark";
  return "light";
}

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    console.log("Theme changed:", theme);
    document.documentElement.setAttribute("data-theme", theme);
    // إزالة كلاس dark دومًا أولاً
    document.documentElement.classList.remove("dark");
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    }
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      // تجاهل أي خطأ في localStorage
    }
  }, [theme]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => {
      if (!localStorage.getItem(THEME_KEY)) {
        setTheme(e.matches ? "dark" : "light");
      }
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // مراقبة أي تغيير على localStorage (من نفس النافذة أو من نافذة أخرى)
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === THEME_KEY) {
        setTheme(e.newValue === "dark" ? "dark" : "light");
      }
    };
    window.addEventListener("storage", onStorage);
    // دعم التغيير من نفس النافذة (polling)
    let lastTheme = localStorage.getItem(THEME_KEY);
    const interval = setInterval(() => {
      const stored = localStorage.getItem(THEME_KEY);
      if (stored && stored !== lastTheme) {
        setTheme(stored === "dark" ? "dark" : "light");
        lastTheme = stored;
      }
    }, 500);
    return () => {
      window.removeEventListener("storage", onStorage);
      clearInterval(interval);
    };
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
