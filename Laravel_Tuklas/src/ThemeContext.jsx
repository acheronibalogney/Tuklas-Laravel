import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'light';
    let savedTheme = 'light';
    try {
      const storedTheme = window.localStorage.getItem('tuklas-theme');
      if (storedTheme === 'light' || storedTheme === 'dark') savedTheme = storedTheme;
    } catch {}
    document.documentElement.dataset.theme = savedTheme;
    return savedTheme;
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      window.localStorage.setItem('tuklas-theme', theme);
    } catch {}
  }, [theme]);

  const toggle = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}