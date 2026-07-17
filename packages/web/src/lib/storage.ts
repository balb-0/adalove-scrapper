import type { Kanban } from '@adalove-scrapper/shared';

const KANBAN_KEY = 'adalove-scrapper:last-kanban';

export function saveKanban(kanban: Kanban): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(KANBAN_KEY, JSON.stringify(kanban));
}

export function loadKanban(): Kanban | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(KANBAN_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Kanban;
  } catch {
    return null;
  }
}

export function clearKanban(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(KANBAN_KEY);
}
