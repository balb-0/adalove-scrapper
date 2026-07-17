export type Theme = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'adalove-scrapper:theme';

export function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'system';
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw === 'light' || raw === 'dark' || raw === 'system') return raw;
  return 'system';
}

export function setStoredTheme(theme: Theme): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, theme);
  applyTheme(theme);
}

export function applyTheme(theme: Theme): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.classList.remove('light', 'dark');
  if (theme !== 'system') root.classList.add(theme);
}

export function nextTheme(current: Theme): Theme {
  return current === 'light' ? 'dark' : current === 'dark' ? 'system' : 'light';
}
