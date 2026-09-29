export interface LoginTokens {
  access_token: string;
  refresh_token: string;
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

/**
 * Confere e-mail e senha no iam-api (`POST /auth/login-inpeace`) e devolve os tokens.
 * `credentials: 'include'` é obrigatório: sem ele o navegador descarta o Set-Cookie do
 * SSO entre apps. A senha só passa por aqui — nunca é guardada. Levanta `LoginError`
 * com a mensagem certa pra cada situação (senha errada, sem vínculo, limite de
 * tentativas, InPeace fora do ar, sem rede).
 */
export async function autenticarNoIam(
  email: string,
  senha: string,
  { apiUrl = API_IAM_PADRAO, mensagens = {}, fetchImpl = fetch, timeoutMs = 20000 }: AutenticarOpcoes = {},
): Promise<LoginTokens> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  let resp: Response;
  try {
    resp = await fetchImpl(`${apiUrl}/auth/login-inpeace`, {
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
