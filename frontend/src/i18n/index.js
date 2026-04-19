import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import sq from './sq';
import en from './en';
import de from './de';

const BUNDLES = { sq, en, de };

export const LANGUAGES = [
  { code: 'sq', label: 'Shqip',    flag: '🇦🇱' },
  { code: 'en', label: 'English',  flag: '🇬🇧' },
  { code: 'de', label: 'Deutsch',  flag: '🇩🇪' },
];

const I18nContext = createContext({ lang: 'sq', t: (k) => k, setLang: () => {} });

export const I18nProvider = ({ children }) => {
  const [lang, setLangState] = useState(() => {
    try {
      const saved = localStorage.getItem('lang');
      if (saved && BUNDLES[saved]) return saved;
      // Fallback to browser preference
      const browser = (navigator.language || 'sq').slice(0, 2).toLowerCase();
      if (BUNDLES[browser]) return browser;
    } catch {}
    return 'sq'; // Albanian first!
  });

  const setLang = useCallback((l) => {
    if (BUNDLES[l]) {
      localStorage.setItem('lang', l);
      setLangState(l);
      document.documentElement.lang = l;
    }
  }, []);

  const t = useCallback((key, vars) => {
    let text = BUNDLES[lang]?.[key] ?? BUNDLES.en?.[key] ?? key;
    if (vars) Object.entries(vars).forEach(([k, v]) => { text = text.replace(`{${k}}`, v); });
    return text;
  }, [lang]);

  const value = useMemo(() => ({ lang, t, setLang }), [lang, t, setLang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useT = () => useContext(I18nContext);
