export interface LoginTokens {
  access_token: string;
  /** Ausente no token de membro (o iam não emite refresh pra ele). */
  refresh_token?: string;
}

/** Chaves aceitas em `mensagens`: um status HTTP, `rede` (sem resposta) ou `outro`. */
export type ChaveMensagem = number | 'rede' | 'outro';

export const API_IAM_PADRAO = 'https://acessos-api.lagoinha.app';

const MENSAGENS_PADRAO: Record<string, string> = {
  '401': 'E-mail ou senha do InPeace incorretos.',
  '403': 'Login confirmado no InPeace, mas essa conta não tem acesso a este app.',
  '429': 'Muitas tentativas seguidas. Aguarde um minuto e tente de novo.',
  '503': 'Não foi possível falar com o InPeace agora. Tente de novo em instantes.',
  rede: 'Sem conexão com o servidor. Verifique sua internet e tente de novo.',
  outro: 'Não foi possível entrar. Tente de novo em instantes.',
};

/** Erro de login com mensagem pronta pra mostrar na tela; `status` é o HTTP, quando houve resposta. */
export class LoginError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = 'LoginError';
    this.status = status;
  }
}

/** Mensagem pra tela: a específica do app (se houver) vence a padrão. */
export function mensagemDeErro(
  chave: ChaveMensagem,
  personalizadas: Partial<Record<ChaveMensagem, string>> = {},
): string {
  return personalizadas[chave] ?? MENSAGENS_PADRAO[String(chave)] ?? personalizadas.outro ?? MENSAGENS_PADRAO.outro;
}

export interface AutenticarOpcoes {
  apiUrl?: string;
  mensagens?: Partial<Record<ChaveMensagem, string>>;
  /** Injetável só pra teste. */
  fetchImpl?: typeof fetch;
  /** Tempo máximo de espera, em ms. */
  timeoutMs?: number;
}

type RotaLogin = '/auth/login-inpeace' | '/auth/login-membro';

async function postarLogin(
  rota: RotaLogin,
  email: string,
  senha: string,
  { apiUrl = API_IAM_PADRAO, mensagens = {}, fetchImpl = fetch, timeoutMs = 20000 }: AutenticarOpcoes = {},
): Promise<LoginTokens> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  let resp: Response;
  try {
    resp = await fetchImpl(`${apiUrl}${rota}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), senha }),
      credentials: 'include',
      signal: controller.signal,
    });
  } catch {
    throw new LoginError(mensagemDeErro('rede', mensagens));
  } finally {
    clearTimeout(timer);
  }
  if (!resp.ok) throw new LoginError(mensagemDeErro(resp.status, mensagens), resp.status);
  try {
    return (await resp.json()) as LoginTokens;
  } catch {
    throw new LoginError(mensagemDeErro('outro', mensagens), resp.status);
  }
}

/**
 * Confere e-mail e senha no iam-api (`POST /auth/login-inpeace`, login de EQUIPE) e devolve os
 * tokens. `credentials: 'include'` é obrigatório: sem ele o navegador descarta o Set-Cookie do
 * SSO entre apps. A senha só passa por aqui — nunca é guardada. Levanta `LoginError` com a
 * mensagem certa pra cada situação (senha errada, sem vínculo, limite de tentativas, InPeace
 * fora do ar, sem rede). 403 = senha certa, mas sem vínculo de equipe em nenhum app.
 */
export function autenticarNoIam(email: string, senha: string, opcoes: AutenticarOpcoes = {}): Promise<LoginTokens> {
  return postarLogin('/auth/login-inpeace', email, senha, opcoes);
}

/** Login de MEMBRO comum (`POST /auth/login-membro`): só exige a senha do InPeace, sem vínculo de equipe. */
export function autenticarMembroNoIam(email: string, senha: string, opcoes: AutenticarOpcoes = {}): Promise<LoginTokens> {
  return postarLogin('/auth/login-membro', email, senha, opcoes);
}

export interface AutenticarComMembroOpcoes extends AutenticarOpcoes {
  /** Quando o iam responde 403 (sem vínculo de equipe), tenta o login de membro com a mesma senha. */
  permitirMembro?: boolean;
}

/**
 * Login da equipe e, se habilitado, cai no de membro quando a pessoa não tem vínculo de equipe
 * (403). Só o 403 dispara a queda: senha errada (401), limite de tentativas e falhas de rede
 * seguem como erro. `membro` diz qual dos dois valeu.
 */
export async function autenticarComFallbackDeMembro(
  email: string,
  senha: string,
  { permitirMembro = false, ...opcoes }: AutenticarComMembroOpcoes = {},
): Promise<{ tokens: LoginTokens; membro: boolean }> {
  try {
    return { tokens: await autenticarNoIam(email, senha, opcoes), membro: false };
  } catch (err) {
    if (permitirMembro && err instanceof LoginError && err.status === 403) {
      return { tokens: await autenticarMembroNoIam(email, senha, opcoes), membro: true };
    }
    throw err;
  }
}
