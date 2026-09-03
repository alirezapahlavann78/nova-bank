import { fa } from '../localization';

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  if (currency === 'IRT') {
    const formatted = new Intl.NumberFormat('fa-IR').format(Math.round(amount));
    return `${formatted} ${fa.currency.toman}`;
  }
  if (currency === 'EUR') {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 }).format(amount);
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(amount);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('fa-IR').format(value);
}

export function formatPercent(value: number): string {
  const formatted = Math.round(value * 100) / 100;
  return `${formatted >= 0 ? '+' : ''}${formatted}%`;
}

export function formatDate(dateString: string, locale: 'fa' | 'en' = 'fa'): string {
  const date = new Date(dateString);
  if (locale === 'fa') {
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);
  }
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

export function formatJalaliDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fa-IR-u-nu-latn', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}
