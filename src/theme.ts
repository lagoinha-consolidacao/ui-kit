/**
 * Gerenciador de modo claro/escuro (localStorage + prefers-color-scheme),
 * compartilhado entre todos os apps — trazido do certifica-web, que foi o
 * primeiro a construir isso, sem nada específico daquele app.
 */
export type ThemeMode = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'theme';
const mq = window.matchMedia('(prefers-color-scheme: dark)');

function readStored(): ThemeMode {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === 'light' || v === 'dark' || v === 'system') return v;
  } catch {
    // ignore
  }
  return 'system';
}

function computeEffective(mode: ThemeMode): 'light' | 'dark' {
  return mode === 'system' ? (mq.matches ? 'dark' : 'light') : mode;
}

function applyToDom(mode: ThemeMode) {
  document.documentElement.classList.toggle('dark', computeEffective(mode) === 'dark');
}

let currentMode = readStored();
applyToDom(currentMode);

const listeners = new Set<() => void>();

mq.addEventListener('change', () => {
  if (currentMode === 'system') {
    applyToDom(currentMode);
    listeners.forEach((l) => l());
  }
});

export function getThemeMode(): ThemeMode {
  return currentMode;
}

export function getEffectiveTheme(): 'light' | 'dark' {
  return computeEffective(currentMode);
}

export function setThemeMode(next: ThemeMode) {
  currentMode = next;
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // ignore
  }
  applyToDom(currentMode);
  listeners.forEach((l) => l());
}

export function subscribeTheme(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
