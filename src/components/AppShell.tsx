import type { ReactNode } from 'react';

export interface AppShellApp {
  label: string;
  href: string;
  active?: boolean;
}

export interface AppShellProps {
  /** Nome do app atual, mostrado ao lado da marca (ex.: "Pastoral"). */
  appName: string;
  /** Apps que o usuário logado tem acesso, pro app-switcher da direita. */
  apps: AppShellApp[];
  /** Selo/logo — por padrão um placeholder losangular; trocar quando o selo definitivo existir. */
  logo?: ReactNode;
  /** Conteúdo extra à direita, antes do switcher (ex.: nome do usuário, botão de sair). */
  actions?: ReactNode;
}

const defaultLogo = (
  <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3" aria-hidden="true">
    <path d="M12 3 L15 11 L12 21 L9 11 Z" fill="currentColor" />
  </svg>
);

/** Barra superior compartilhada entre todos os apps do ecossistema Lagoinha — sempre preta, independente do tema claro/escuro do conteúdo abaixo. */
export function AppShell({ appName, apps, logo, actions }: AppShellProps) {
  return (
    <div className="flex items-center gap-4 bg-brand-black px-5 py-3">
      <div className="flex items-center gap-2.5 font-display text-[15px] font-black uppercase tracking-wide text-white">
        <span className="flex h-6.5 w-6.5 items-center justify-center rounded-full border-2 border-accent text-accent">
          {logo ?? defaultLogo}
        </span>
        LAGOINHA
      </div>
      <span className="text-[13px] text-white/50">
        / <b className="font-semibold text-white/90">{appName}</b>
      </span>
      {actions && <div className="ml-auto flex items-center gap-3">{actions}</div>}
      <nav className={`flex gap-1.5 ${actions ? '' : 'ml-auto'}`}>
        {apps.map((app) => (
          <a
            key={app.href}
            href={app.href}
            className={
              app.active
                ? 'rounded-full bg-accent px-3 py-1.5 text-[11.5px] font-semibold text-accent-foreground'
                : 'rounded-full bg-white/[0.06] px-3 py-1.5 text-[11.5px] text-white/70 hover:bg-white/[0.1]'
            }
          >
            {app.label}
          </a>
        ))}
      </nav>
    </div>
  );
}
