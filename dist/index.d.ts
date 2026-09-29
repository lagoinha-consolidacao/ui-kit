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

interface ThemeToggleIconProps {
    /**
     * Substitui as classes de cor padrão (pensadas pra uma superfície que já
     * muda com o tema, ex. bg-surface) — necessário numa barra sempre escura
     * (ex. bg-brand-black), onde os tokens adaptáveis ficariam sem contraste.
     */
    className?: string;
}
/** Botão único que cicla claro → escuro → sistema — pro rodapé de uma sidebar. */
declare function ThemeToggleIcon({ className }?: ThemeToggleIconProps): react.JSX.Element;
/** Controle de 3 opções lado a lado, com label — pra um menu/tela com mais espaço. */
declare function ThemeToggleSegmented(): react.JSX.Element;

interface LoginTokens {
    access_token: string;
    refresh_token: string;
}
/** Chaves aceitas em `mensagens`: um status HTTP, `rede` (sem resposta) ou `outro`. */
type ChaveMensagem = number | 'rede' | 'outro';
declare const API_IAM_PADRAO = "https://acessos-api.lagoinha.app";
/** Erro de login com mensagem pronta pra mostrar na tela; `status` é o HTTP, quando houve resposta. */
declare class LoginError extends Error {
    status?: number;
    constructor(message: string, status?: number);
}
/** Mensagem pra tela: a específica do app (se houver) vence a padrão. */
declare function mensagemDeErro(chave: ChaveMensagem, personalizadas?: Partial<Record<ChaveMensagem, string>>): string;
interface AutenticarOpcoes {
    apiUrl?: string;
    mensagens?: Partial<Record<ChaveMensagem, string>>;
    /** Injetável só pra teste. */
    fetchImpl?: typeof fetch;
    /** Tempo máximo de espera, em ms. */
    timeoutMs?: number;
}
/**
 * Confere e-mail e senha no iam-api (`POST /auth/login-inpeace`) e devolve os tokens.
 * `credentials: 'include'` é obrigatório: sem ele o navegador descarta o Set-Cookie do
 * SSO entre apps. A senha só passa por aqui — nunca é guardada. Levanta `LoginError`
 * com a mensagem certa pra cada situação (senha errada, sem vínculo, limite de
 * tentativas, InPeace fora do ar, sem rede).
 */
declare function autenticarNoIam(email: string, senha: string, { apiUrl, mensagens, fetchImpl, timeoutMs }?: AutenticarOpcoes): Promise<LoginTokens>;

interface LoginFrameProps {
    nome: string;
    descricao?: string;
    icone?: ReactNode;
    logoUrl?: string;
    children: ReactNode;
}
/**
 * Quadro da tela de login (fundo, cartão, logo, nome e descrição). O `LoginInPeace` já usa;
 * exporte-o pra outras telas do mesmo fluxo (ex.: cadastro, login de totem) ficarem
 * visualmente idênticas às demais.
 */
declare function LoginFrame({ nome, descricao, icone, logoUrl, children }: LoginFrameProps): react.JSX.Element;
interface LoginInPeaceProps {
    /** Nome do app (ex.: "LakeSpace"). */
    nome: string;
    /** Uma linha sobre o app, abaixo do nome (ex.: "Reserva de espaços e times"). */
    descricao?: string;
    /** Ícone do app, ao lado do nome. */
    icone?: ReactNode;
    /** URL do logo (ex.: `import logoUrl from '@lagoinha/ui-kit/logo.svg'`). */
    logoUrl?: string;
    /** URL do iam-api. Padrão: https://acessos-api.lagoinha.app */
    apiUrl?: string;
    /**
     * Chamado depois que o InPeace confirma a senha. Faça aqui o que é do app (buscar o
     * `/me`, guardar a sessão, navegar). Se lançar um `Error`, a mensagem aparece na tela.
     * O 2º argumento traz e-mail e senha só pra apps que precisam revalidá-los em outra
     * rota (ex.: o login de aluno do certifica); a maioria pode ignorar.
     */
    onAuthenticated: (tokens: LoginTokens, credenciais: {
        email: string;
        senha: string;
    }) => void | Promise<void>;
    /** Mensagens próprias por status HTTP (401, 403, 503…), `rede` ou `outro`; vencem as padrão. */
    mensagens?: Partial<Record<ChaveMensagem, string>>;
    /** Link "Esqueci a senha" (opcional; sem ele o link não aparece). */
    esqueciSenhaUrl?: string;
    /** Conteúdo extra abaixo do formulário (ex.: fluxo de aluno, agendamento de membro). */
    rodape?: ReactNode;
}
/**
 * Tela de login única do ecossistema: e-mail e senha do InPeace validados no iam-api
 * (SSO). Mesma aparência, mesmas mensagens e mesmo tratamento de erro em todos os apps —
 * o que muda de um app pra outro entra por props e por `onAuthenticated`.
 */
declare function LoginInPeace({ nome, descricao, icone, logoUrl, apiUrl, onAuthenticated, mensagens, esqueciSenhaUrl, rodape, }: LoginInPeaceProps): react.JSX.Element;

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
type ThemeMode = 'light' | 'dark' | 'system';
declare function getThemeMode(): ThemeMode;
declare function getEffectiveTheme(): 'light' | 'dark';
declare function setThemeMode(next: ThemeMode): void;
declare function subscribeTheme(cb: () => void): () => boolean;

export { API_IAM_PADRAO, AppShell, type AppShellApp, type AppShellProps, type AutenticarOpcoes, Badge, type BadgeProps, Button, type ButtonProps, type ChaveMensagem, LoginError, LoginFrame, type LoginFrameProps, LoginInPeace, type LoginInPeaceProps, type LoginTokens, type ThemeMode, ThemeToggleIcon, ThemeToggleSegmented, autenticarNoIam, getEffectiveTheme, getThemeMode, mensagemDeErro, setThemeMode, subscribeTheme };
