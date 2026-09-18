/**
 * Gerenciador de modo claro/escuro (prefers-color-scheme + persistência),
 * compartilhado entre todos os apps — trazido do certifica-web, que foi o
 * primeiro a construir isso, sem nada específico daquele app.
 *
 * Persistência via cookie no domínio .lagoinha.app (não localStorage, que
 * é isolado por subdomínio) - mudar o tema em um app reflete em todos os
 * outros na próxima vez que abrirem, mesmo mecanismo já usado pro cookie
 * de SSO. Em dev local (hostname não termina em .lagoinha.app), cai pra
 * localStorage - um cookie com Domain=.lagoinha.app nunca seria aceito
 * pelo navegador fora desse domínio.
 */
export type ThemeMode = 'light' | 'dark' | 'system';

const COOKIE_KEY = 'lagoinha_theme';
const STORAGE_KEY = 'theme';
const SHARED_DOMAIN = '.lagoinha.app';
const usesSharedCookie = window.location.hostname.endsWith('lagoinha.app');

const mq = window.matchMedia('(prefers-color-scheme: dark)');

function readCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function writeCookie(name: string, value: string) {
  const maxAge = 60 * 60 * 24 * 365; // 1 ano
  document.cookie = `${name}=${encodeURIComponent(value)}; Domain=${SHARED_DOMAIN}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
}

function readStored(): ThemeMode {
  try {
    const v = usesSharedCookie ? readCookie(COOKIE_KEY) : localStorage.getItem(STORAGE_KEY);
    if (v === 'light' || v === 'dark' || v === 'system') return v;
  } catch {
    // ignore
  }
  return 'system';
}

function writeStored(mode: ThemeMode) {
  try {
    if (usesSharedCookie) {
      writeCookie(COOKIE_KEY, mode);
    } else {
      localStorage.setItem(STORAGE_KEY, mode);
    }
  } catch {
    // ignore
  }
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
  writeStored(next);
  applyToDom(currentMode);
  listeners.forEach((l) => l());
}

export function subscribeTheme(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
