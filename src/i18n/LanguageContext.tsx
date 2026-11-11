import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { strings, type Language, type Strings } from './strings';

const STORAGE_KEY = 'bikeritas/language/v1';

type LanguageContextValue = {
  /** false until the saved choice has been read from storage. */
  loaded: boolean;
  /** null until the user has picked a language (first launch). */
  language: Language | null;
  /** Texts in the chosen language (Finnish until one is picked). */
  s: Strings;
  setLanguage: (language: Language) => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

const isLanguage = (value: unknown): value is Language => value === 'fi' || value === 'en';

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [loaded, setLoaded] = useState(false);
  const [language, setLanguageState] = useState<Language | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .catch(() => null)
      .then((saved) => {
        if (isLanguage(saved)) setLanguageState(saved);
        setLoaded(true);
      });
  }, []);

  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
  }, []);

  const value = useMemo(
    () => ({ loaded, language, s: strings[language ?? 'fi'], setLanguage }),
    [loaded, language, setLanguage],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useI18n(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useI18n must be used inside <LanguageProvider>');
  return ctx;
}
