import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { getCategoryConfig } from '../utils/helpers';

const ThemeContext = createContext({ activeCategory: null, setActiveCategory: () => {} });

export const ThemeProvider = ({ children }) => {
  const [activeCategory, setActiveCategory] = useState(null);

  const set = useCallback((cat) => {
    setActiveCategory(cat);
    const root = document.documentElement;
    if (cat) {
      const config = getCategoryConfig(cat);
      root.style.setProperty('--theme-accent', config.color);
    } else {
      root.style.setProperty('--theme-accent', '#336f70');
    }
  }, []);

  useEffect(() => () => document.documentElement.style.removeProperty('--theme-accent'), []);

  return (
    <ThemeContext.Provider value={{ activeCategory, setActiveCategory: set }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
