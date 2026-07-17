import { useEffect, useState } from 'react';
import {
  applyTheme,
  getStoredTheme,
  nextTheme,
  setStoredTheme,
  type Theme,
} from '../lib/theme.ts';

const LABEL: Record<Theme, string> = {
  light: '☀ claro',
  dark: '☾ escuro',
  system: '⚙ sistema',
};

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('system');

  useEffect(() => {
    const stored = getStoredTheme();
    setTheme(stored);
    applyTheme(stored);
  }, []);

  const onClick = () => {
    const next = nextTheme(theme);
    setTheme(next);
    setStoredTheme(next);
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-md border px-3 py-1.5 text-sm hover:bg-[var(--surface-muted)] transition-colors"
      style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
      title="alternar tema"
    >
      {LABEL[theme]}
    </button>
  );
}
