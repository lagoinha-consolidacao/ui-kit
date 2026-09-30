import { Eye, EyeOff } from 'lucide-react';
import { useId, useRef, useState, type FormEvent, type ReactNode } from 'react';
import {
  autenticarComFallbackDeMembro,
  autenticarMembroNoIam,
  mensagemDeErro,
  type ChaveMensagem,
  type LoginTokens,
} from '../login';
import { Button } from './Button';

export interface LoginFrameProps {
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
export function LoginFrame({ nome, descricao, icone, logoUrl, children }: LoginFrameProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4 py-10">
      {/* maxWidth inline de propósito: o cartão nunca estica, mesmo que uma classe utilitária falte */}
      <div
        className="w-full rounded-2xl border border-border bg-surface p-6 shadow-xl shadow-black/10 sm:p-8"
        style={{ maxWidth: '24rem' }}
      >
        <div className="mb-7 text-center">
          {logoUrl && <img src={logoUrl} alt="Lagoinha" className="mx-auto mb-4 h-16 w-16 dark:invert" />}
          <h1 className="flex items-center justify-center gap-2 text-2xl font-bold tracking-tight text-accent">
            {icone}
            {nome}
          </h1>
          {descricao && <p className="mt-1.5 text-sm text-muted-foreground">{descricao}</p>}
        </div>
        {children}
      </div>
    </div>
  );
}

export interface LoginContexto {
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

export interface LoginFormInPeaceProps {
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
export function LoginFormInPeace({
  apiUrl,
  onAuthenticated,
  permitirMembro,
  mensagens,
  esqueciSenhaUrl,
  onEsqueciSenha,
  onEmailChange,
  dica = true,
  autoFocar = true,
}: LoginFormInPeaceProps) {
  const id = useId();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  // Guardadas só pra `obterTokenDeMembro`; nunca entregues ao app.
  const credenciais = useRef({ email: '', senha: '' });

  async function enviar(e: FormEvent) {
    e.preventDefault();
    if (carregando) return;
    setCarregando(true);
    setErro('');
    credenciais.current = { email, senha };
    try {
      const { tokens, membro } = await autenticarComFallbackDeMembro(email, senha, { apiUrl, mensagens, permitirMembro });
      await onAuthenticated(tokens, {
        membro,
        obterTokenDeMembro: () =>
          autenticarMembroNoIam(credenciais.current.email, credenciais.current.senha, { apiUrl, mensagens }),
      });
    } catch (err) {
      setErro(err instanceof Error && err.message ? err.message : mensagemDeErro('outro', mensagens));
    } finally {
      setCarregando(false);
    }
  }

  const campo =
    'w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground placeholder:text-subtle-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40';
  const rotulo = 'mb-1.5 block text-sm font-medium text-foreground-secondary';
  const linkEsqueci = 'text-muted-foreground underline underline-offset-2 hover:text-foreground';

  return (
    <>
      {dica && <p className="mb-5 text-center text-xs text-subtle-foreground">Entre com o mesmo e-mail e senha que você usa no app da Lagoinha Global.</p>}

      <form onSubmit={enviar} className="space-y-4" aria-busy={carregando}>
        <div>
          <label htmlFor={`${id}-email`} className={rotulo}>
            E-mail do InPeace
          </label>
          <input
            id={`${id}-email`}
            type="email"
            inputMode="email"
            autoComplete="username"
            autoFocus={autoFocar}
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              onEmailChange?.(e.target.value);
            }}
            className={campo}
          />
        </div>

        <div>
          <label htmlFor={`${id}-senha`} className={rotulo}>
            Senha do InPeace
          </label>
          {/* posição inline de propósito: o olhinho nunca sai do campo, mesmo que uma classe utilitária falte */}
          <div style={{ position: 'relative' }}>
            <input
              id={`${id}-senha`}
              type={mostrarSenha ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className={campo}
              style={{ paddingRight: '2.75rem' }}
            />
            <button
              type="button"
              onClick={() => setMostrarSenha((v) => !v)}
              aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
              aria-pressed={mostrarSenha}
              className="flex items-center rounded-r-xl px-3 text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              style={{ position: 'absolute', top: 0, bottom: 0, right: 0 }}
            >
              {mostrarSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {erro && (
          <p role="alert" className="text-sm text-danger-foreground">
            {erro}
          </p>
        )}

        <Button type="submit" className="w-full py-3 disabled:cursor-not-allowed disabled:opacity-60" disabled={carregando}>
          {carregando ? 'Entrando…' : 'Entrar'}
        </Button>

        {(onEsqueciSenha || esqueciSenhaUrl) && (
          <p className="text-center text-xs">
            {onEsqueciSenha ? (
              <button type="button" onClick={onEsqueciSenha} className={linkEsqueci}>
                Esqueci a senha
              </button>
            ) : (
              <a href={esqueciSenhaUrl} className={linkEsqueci}>
                Esqueci a senha
              </a>
            )}
          </p>
        )}
      </form>
    </>
  );
}

export interface LoginInPeaceProps extends LoginFormInPeaceProps {
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
export function LoginInPeace({ nome, descricao, icone, logoUrl, rodape, ...formulario }: LoginInPeaceProps) {
  return (
    <LoginFrame nome={nome} descricao={descricao} icone={icone} logoUrl={logoUrl}>
      <LoginFormInPeace {...formulario} />
      {rodape && <div className="mt-5 border-t border-border pt-4">{rodape}</div>}
    </LoginFrame>
  );
}
