import * as react from 'react';
import { ReactNode, ButtonHTMLAttributes } from 'react';

interface AppShellApp {
    label: string;
    href: string;
    active?: boolean;
}
interface AppShellProps {
    /** Nome do app atual, mostrado ao lado da marca (ex.: "Pastoral"). */
    appName: string;
    /** Apps que o usuário logado tem acesso, pro app-switcher da direita. */
    apps: AppShellApp[];
    /** Selo/logo — por padrão um placeholder losangular; trocar quando o selo definitivo existir. */
    logo?: ReactNode;
    /** Conteúdo extra à direita, antes do switcher (ex.: nome do usuário, botão de sair). */
    actions?: ReactNode;
}
/** Barra superior compartilhada entre todos os apps do ecossistema Lagoinha — sempre preta, independente do tema claro/escuro do conteúdo abaixo. */
declare function AppShell({ appName, apps, logo, actions }: AppShellProps): react.JSX.Element;

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary';
}
/** Botão padrão do ecossistema — dourado como única ação primária, nunca mais de um por tela. */
declare function Button({ variant, className, ...props }: ButtonProps): react.JSX.Element;

interface BadgeProps {
    tone?: 'success' | 'warning' | 'danger' | 'neutral';
    children: ReactNode;
}
/** Selo de status (ex.: Confirmado/Pendente/Cancelado) — cor semântica, nunca o dourado de marca. */
declare function Badge({ tone, children }: BadgeProps): react.JSX.Element;

/** Botão único que cicla claro → escuro → sistema — pro rodapé de uma sidebar. */
declare function ThemeToggleIcon(): react.JSX.Element;
/** Controle de 3 opções lado a lado, com label — pra um menu/tela com mais espaço. */
declare function ThemeToggleSegmented(): react.JSX.Element;

/**
 * Gerenciador de modo claro/escuro (localStorage + prefers-color-scheme),
 * compartilhado entre todos os apps — trazido do certifica-web, que foi o
 * primeiro a construir isso, sem nada específico daquele app.
 */
type ThemeMode = 'light' | 'dark' | 'system';
declare function getThemeMode(): ThemeMode;
declare function getEffectiveTheme(): 'light' | 'dark';
declare function setThemeMode(next: ThemeMode): void;
declare function subscribeTheme(cb: () => void): () => boolean;

export { AppShell, type AppShellApp, type AppShellProps, Badge, type BadgeProps, Button, type ButtonProps, type ThemeMode, ThemeToggleIcon, ThemeToggleSegmented, getEffectiveTheme, getThemeMode, setThemeMode, subscribeTheme };
