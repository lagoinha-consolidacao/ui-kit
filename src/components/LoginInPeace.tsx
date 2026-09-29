import { Eye, EyeOff } from 'lucide-react';
import { useId, useState, type FormEvent, type ReactNode } from 'react';
import {
  autenticarComFallbackDeMembro,
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
    <div className="flex min-h-screen items-center justify-center bg-brand-black p-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-4 shadow-sm">
        <div className="mb-6 text-center">
          {logoUrl && <img src={logoUrl} alt="Lagoinha" className="mx-auto mb-3 h-14 w-14 dark:invert" />}
          <h1 className="flex items-center justify-center gap-2 text-2xl font-bold text-accent">
            {icone}
            {nome}
          </h1>
          {descricao && <p className="mt-1 text-sm text-muted-foreground">{descricao}</p>}
        </div>
        {children}
      </div>
    </div>
  );
}

export interface LoginInPeaceProps {
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
   * A senha nunca sai do formulário: troque o token do iam-api por uma sessão do app
   * (revalidar a senha em outra rota espalharia a credencial e, se fosse na URL, ela
   * iria parar nos logs de acesso). `contexto.membro` é true quando a pessoa entrou pelo
   * login de membro (só com `permitirMembro`): não tem vínculo de equipe em nenhum app.
   */
  onAuthenticated: (tokens: LoginTokens, contexto: { membro: boolean }) => void | Promise<void>;
  /**
   * Quando o iam diz que a pessoa não tem vínculo de equipe (403), tenta o login de membro com
   * a mesma senha em vez de mostrar erro. Ligue em apps que também atendem membros comuns.
   */
  permitirMembro?: boolean;
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
export function LoginInPeace({
  nome,
  descricao,
  icone,
  logoUrl,
  apiUrl,
  onAuthenticated,
  permitirMembro,
  mensagens,
  esqueciSenhaUrl,
  rodape,
}: LoginInPeaceProps) {
  const id = useId();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    if (carregando) return;
    setCarregando(true);
    setErro('');
    try {
      const { tokens, membro } = await autenticarComFallbackDeMembro(email, senha, { apiUrl, mensagens, permitirMembro });
      await onAuthenticated(tokens, { membro });
    } catch (err) {
      setErro(err instanceof Error && err.message ? err.message : mensagemDeErro('outro', mensagens));
    } finally {
      setCarregando(false);
    }
  }

  const campo =
    'w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent';
  const rotulo = 'mb-1 block text-sm font-medium text-foreground-secondary';

  return (
    <LoginFrame nome={nome} descricao={descricao} icone={icone} logoUrl={logoUrl}>
      <p className="mb-4 text-xs text-subtle-foreground">Use o mesmo e-mail e senha do InPeace.</p>

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
            autoFocus
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={campo}
          />
        </div>

        <div>
          <label htmlFor={`${id}-senha`} className={rotulo}>
            Senha do InPeace
          </label>
          <div className="relative">
            <input
              id={`${id}-senha`}
              type={mostrarSenha ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className={`${campo} pr-10`}
            />
            <button
              type="button"
              onClick={() => setMostrarSenha((v) => !v)}
              aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
              aria-pressed={mostrarSenha}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
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

        <Button type="submit" className="w-full disabled:cursor-not-allowed disabled:opacity-60" disabled={carregando}>
          {carregando ? 'Entrando…' : 'Entrar'}
        </Button>

        {esqueciSenhaUrl && (
          <p className="text-center text-xs">
            <a href={esqueciSenhaUrl} className="text-muted-foreground underline hover:text-foreground">
              Esqueci a senha
            </a>
          </p>
        )}
      </form>

      {rodape && <div className="mt-4">{rodape}</div>}
    </LoginFrame>
  );
}
