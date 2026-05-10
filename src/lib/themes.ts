export const THEMES = [
  { id: 'green', label: 'Green', dot: '#00ff41' },
  { id: 'amber', label: 'Amber', dot: '#ffb000' },
  { id: 'blue', label: 'Blue', dot: '#0000aa' },
  { id: 'matrix', label: 'Matrix', dot: '#00ff41' },
  { id: 'dracula', label: 'Dracula', dot: '#bd93f9' },
] as const;

export type ThemeId = typeof THEMES[number]['id'];

const STORAGE_KEY = 'portfolio-theme';

export function getStoredTheme(): ThemeId {
  if (typeof window === 'undefined') return 'green';
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && THEMES.some(t => t.id === stored)) return stored as ThemeId;
  return 'green';
}

export function applyTheme(themeId: ThemeId): void {
  document.documentElement.dataset.theme = themeId;
  localStorage.setItem(STORAGE_KEY, themeId);
}

export function getNextTheme(current: ThemeId): ThemeId {
  const idx = THEMES.findIndex(t => t.id === current);
  return THEMES[(idx + 1) % THEMES.length].id;
}

export function getCurrentTheme(): ThemeId {
  const current = document.documentElement.dataset.theme;
  if (current && THEMES.some(t => t.id === current)) return current as ThemeId;
  return 'green';
}
