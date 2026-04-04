import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { it } from './it';
import { en } from './en';

export type Language = 'it' | 'en';

type Dictionary = typeof it;
const DICTIONARIES: Record<Language, Dictionary> = { it, en };
const STORAGE_KEY = 'split-app-language';

function interpolate(str: string, params?: Record<string, string>): string {
  if (!params) return str;
  return Object.entries(params).reduce(
    (acc, [key, val]) => acc.replace(new RegExp(`\\{${key}\\}`, 'g'), val),
    str
  );
}

// Traverse nested object by dot-separated key
function getNestedValue(obj: Record<string, unknown>, key: string): string {
  const result = key.split('.').reduce<unknown>((cur, k) => {
    if (cur && typeof cur === 'object') return (cur as Record<string, unknown>)[k];
    return undefined;
  }, obj);
  return typeof result === 'string' ? result : key;
}

interface I18nContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string>) => string;
  dateLocale: string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(
    () => (localStorage.getItem(STORAGE_KEY) as Language) ?? 'it'
  );

  const setLanguage = useCallback((lang: Language) => {
    localStorage.setItem(STORAGE_KEY, lang);
    setLanguageState(lang);
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string>): string => {
      const str = getNestedValue(DICTIONARIES[language] as Record<string, unknown>, key);
      return interpolate(str, params);
    },
    [language]
  );

  const dateLocale = language === 'it' ? 'it-IT' : 'en-US';

  const value = useMemo(
    () => ({ language, setLanguage, t, dateLocale }),
    [language, setLanguage, t, dateLocale]
  );

  return React.createElement(I18nContext.Provider, { value }, children);
}

export function useTranslation() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useTranslation must be used within I18nProvider');
  return ctx;
}
