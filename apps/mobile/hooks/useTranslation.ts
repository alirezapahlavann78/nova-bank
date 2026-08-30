import { useMemo } from 'react';
import { fa, en } from '../localization';

type TranslationKeys = typeof fa;

const translations: Record<'fa' | 'en', TranslationKeys> = { fa, en };

export function useTranslation(locale: 'fa' | 'en' = 'fa') {
  const t = useMemo(() => {
    const dict = translations[locale] || fa;
    const get = (path: string) => path.split('.').reduce((obj: any, key) => (obj ? obj[key] : path), dict as any);
    return (key: string) => get(key);
  }, [locale]);

  return { t, locale };
}