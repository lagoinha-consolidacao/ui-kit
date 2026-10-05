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
/** Botão padrão do ecossistema — amarelo como única ação primária, nunca mais de um por tela. */
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
    /** Ausente no token de membro (o iam não emite refresh pra ele). */
    refresh_token?: string;
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
 * Confere e-mail e senha no iam-api (`POST /auth/login-inpeace`, login de EQUIPE) e devolve os
 * tokens. `credentials: 'include'` é obrigatório: sem ele o navegador descarta o Set-Cookie do
 * SSO entre apps. A senha só passa por aqui — nunca é guardada. Levanta `LoginError` com a
 * mensagem certa pra cada situação (senha errada, sem vínculo, limite de tentativas, InPeace
 * fora do ar, sem rede). 403 = senha certa, mas sem vínculo de equipe em nenhum app.
 */
declare function autenticarNoIam(email: string, senha: string, opcoes?: AutenticarOpcoes): Promise<LoginTokens>;
/** Login de MEMBRO comum (`POST /auth/login-membro`): só exige a senha do InPeace, sem vínculo de equipe. */
declare function autenticarMembroNoIam(email: string, senha: string, opcoes?: AutenticarOpcoes): Promise<LoginTokens>;
interface AutenticarComMembroOpcoes extends AutenticarOpcoes {
    /** Quando o iam responde 403 (sem vínculo de equipe), tenta o login de membro com a mesma senha. */
    permitirMembro?: boolean;
}
/**
 * Login da equipe e, se habilitado, cai no de membro quando a pessoa não tem vínculo de equipe
 * (403). Só o 403 dispara a queda: senha errada (401), limite de tentativas e falhas de rede
 * seguem como erro. `membro` diz qual dos dois valeu.
 */
declare function autenticarComFallbackDeMembro(email: string, senha: string, { permitirMembro, ...opcoes }?: AutenticarComMembroOpcoes): Promise<{
    tokens: LoginTokens;
    membro: boolean;
}>;

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
interface LoginContexto {
    /** true quando a pessoa entrou pelo login de membro (só com `permitirMembro`): sem vínculo de equipe em nenhum app. */
    membro: boolean;
    /**
     * Refaz o login pela rota de MEMBRO com as credenciais que ficaram no formulário e devolve o
     * token. Serve a apps que, depois do login de equipe, descobrem que a pessoa não tem vínculo
     * ali (ex.: tem acesso só ao lakespace e quer agendar no pastoral) e precisam de um token de
     * membro. A senha nunca sai do formulário: o app só recebe o token.
     */
    obterTokenDeMembro: () => Promise<LoginTokens>;
}
interface LoginFormInPeaceProps {
    /** URL do iam-api. Padrão: https://acessos-api.lagoinha.app */
    apiUrl?: string;
    /**
     * Chamado depois que o InPeace confirma a senha. Faça aqui o que é do app (buscar o
     * `/me`, guardar a sessão, navegar). Se lançar um `Error`, a mensagem aparece na tela.
     * A senha nunca sai do formulário: troque o token do iam-api por uma sessão do app
     * (revalidar a senha em outra rota espalharia a credencial e, se fosse na URL, ela
     * iria parar nos logs de acesso).
     */
    onAuthenticated: (tokens: LoginTokens, contexto: LoginContexto) => void | Promise<void>;
    /**
     * Quando o iam diz que a pessoa não tem vínculo de equipe (403), tenta o login de membro com
     * a mesma senha em vez de mostrar erro. Ligue em apps que também atendem membros comuns.
     */
    permitirMembro?: boolean;
    /** Mensagens próprias por status HTTP (401, 403, 503…), `rede` ou `outro`; vencem as padrão. */
    mensagens?: Partial<Record<ChaveMensagem, string>>;
    /** Link "Esqueci a senha" (opcional; sem ele e sem `onEsqueciSenha` o link não aparece). */
    esqueciSenhaUrl?: string;
    /** Alternativa ao link: função chamada ao tocar em "Esqueci a senha" (ex.: abrir um modal). */
    onEsqueciSenha?: () => void;
    /** Avisa o app a cada mudança do e-mail digitado (ex.: pré-preencher um cadastro). */
    onEmailChange?: (email: string) => void;
    /** Mostra a linha "Entre com o mesmo e-mail e senha que você usa no app da Lagoinha Global." Padrão: true. */
    dica?: boolean;
    /** Foco automático no e-mail. Padrão: true. */
    autoFocar?: boolean;
}
/**
 * Só o formulário (e-mail, senha, erro, botão), sem fundo nem cartão — pra encaixar dentro da
 * página de um app que já tem o próprio quadro (ex.: primeiro passo de um assistente). Quem
 * quer a tela inteira usa o `LoginInPeace`.
 */
declare function LoginFormInPeace({ apiUrl, onAuthenticated, permitirMembro, mensagens, esqueciSenhaUrl, onEsqueciSenha, onEmailChange, dica, autoFocar, }: LoginFormInPeaceProps): react.JSX.Element;
interface LoginInPeaceProps extends LoginFormInPeaceProps {
    /** Nome do app (ex.: "LakeSpace"). */
    nome: string;
    /** Uma linha sobre o app, abaixo do nome (ex.: "Reserva de espaços e times"). */
    descricao?: string;
    /** Ícone do app, ao lado do nome. */
    icone?: ReactNode;
    /** URL do logo (ex.: `import logoUrl from '@lagoinha/ui-kit/logo.svg'`). */
    logoUrl?: string;
    /** Conteúdo extra abaixo do formulário (ex.: fluxo de aluno, agendamento de membro). */
    rodape?: ReactNode;
}
/**
 * Tela de login única do ecossistema: e-mail e senha do InPeace validados no iam-api
 * (SSO). Mesma aparência, mesmas mensagens e mesmo tratamento de erro em todos os apps —
 * o que muda de um app pra outro entra por props e por `onAuthenticated`.
 */
declare function LoginInPeace({ nome, descricao, icone, logoUrl, rodape, ...formulario }: LoginInPeaceProps): react.JSX.Element;

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

export { API_IAM_PADRAO, AppShell, type AppShellApp, type AppShellProps, type AutenticarComMembroOpcoes, type AutenticarOpcoes, Badge, type BadgeProps, Button, type ButtonProps, type ChaveMensagem, type LoginContexto, LoginError, LoginFormInPeace, type LoginFormInPeaceProps, LoginFrame, type LoginFrameProps, LoginInPeace, type LoginInPeaceProps, type LoginTokens, type ThemeMode, ThemeToggleIcon, ThemeToggleSegmented, autenticarComFallbackDeMembro, autenticarMembroNoIam, autenticarNoIam, getEffectiveTheme, getThemeMode, mensagemDeErro, setThemeMode, subscribeTheme };
