// src/components/AppShell.tsx
import { jsx, jsxs } from "react/jsx-runtime";
var defaultLogo = /* @__PURE__ */ jsx("svg", { viewBox: "0 0 24 24", fill: "none", className: "h-3 w-3", "aria-hidden": "true", children: /* @__PURE__ */ jsx("path", { d: "M12 3 L15 11 L12 21 L9 11 Z", fill: "currentColor" }) });
function AppShell({ appName, apps, logo, actions }) {
  return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 bg-brand-black px-5 py-3", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2.5 font-display text-[15px] font-black uppercase tracking-wide text-white", children: [
      /* @__PURE__ */ jsx("span", { className: "flex h-6.5 w-6.5 items-center justify-center rounded-full border-2 border-accent text-accent", children: logo ?? defaultLogo }),
      "LAGOINHA"
    ] }),
    /* @__PURE__ */ jsxs("span", { className: "text-[13px] text-white/50", children: [
      "/ ",
      /* @__PURE__ */ jsx("b", { className: "font-semibold text-white/90", children: appName })
    ] }),
    actions && /* @__PURE__ */ jsx("div", { className: "ml-auto flex items-center gap-3", children: actions }),
    /* @__PURE__ */ jsx("nav", { className: `flex gap-1.5 ${actions ? "" : "ml-auto"}`, children: apps.map((app) => /* @__PURE__ */ jsx(
      "a",
      {
        href: app.href,
        className: app.active ? "rounded-full bg-accent px-3 py-1.5 text-[11.5px] font-semibold text-accent-foreground" : "rounded-full bg-white/[0.06] px-3 py-1.5 text-[11.5px] text-white/70 hover:bg-white/[0.1]",
        children: app.label
      },
      app.href
    )) })
  ] });
}

// src/components/Button.tsx
import { jsx as jsx2 } from "react/jsx-runtime";
function Button({ variant = "primary", className = "", ...props }) {
  const base = "rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors";
  const styles = variant === "primary" ? "bg-accent text-accent-foreground hover:bg-accent-hover" : "border border-border bg-transparent text-foreground hover:bg-surface-hover";
  return /* @__PURE__ */ jsx2("button", { className: `${base} ${styles} ${className}`, ...props });
}

// src/components/Badge.tsx
import { jsx as jsx3 } from "react/jsx-runtime";
var toneClasses = {
  success: "bg-success text-success-foreground",
  warning: "bg-warning text-warning-foreground",
  danger: "bg-danger text-danger-foreground",
  neutral: "bg-surface-alt text-muted-foreground"
};
function Badge({ tone = "neutral", children }) {
  return /* @__PURE__ */ jsx3("span", { className: `rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${toneClasses[tone]}`, children });
}

// src/components/ThemeToggle.tsx
import { Sun, Moon, Monitor } from "lucide-react";
import { useSyncExternalStore } from "react";

// src/theme.ts
var COOKIE_KEY = "lagoinha_theme";
var STORAGE_KEY = "theme";
var SHARED_DOMAIN = ".lagoinha.app";
var usesSharedCookie = window.location.hostname.endsWith("lagoinha.app");
var mq = window.matchMedia("(prefers-color-scheme: dark)");
function readCookie(name) {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}
function writeCookie(name, value) {
  const maxAge = 60 * 60 * 24 * 365;
  document.cookie = `${name}=${encodeURIComponent(value)}; Domain=${SHARED_DOMAIN}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
}
function readStored() {
  try {
    const v = usesSharedCookie ? readCookie(COOKIE_KEY) : localStorage.getItem(STORAGE_KEY);
    if (v === "light" || v === "dark" || v === "system") return v;
  } catch {
  }
  return "system";
}
function writeStored(mode) {
  try {
    if (usesSharedCookie) {
      writeCookie(COOKIE_KEY, mode);
    } else {
      localStorage.setItem(STORAGE_KEY, mode);
    }
  } catch {
  }
}
function computeEffective(mode) {
  return mode === "system" ? mq.matches ? "dark" : "light" : mode;
}
function applyToDom(mode) {
  document.documentElement.classList.toggle("dark", computeEffective(mode) === "dark");
}
var currentMode = readStored();
applyToDom(currentMode);
var listeners = /* @__PURE__ */ new Set();
mq.addEventListener("change", () => {
  if (currentMode === "system") {
    applyToDom(currentMode);
    listeners.forEach((l) => l());
  }
});
function getThemeMode() {
  return currentMode;
}
function getEffectiveTheme() {
  return computeEffective(currentMode);
}
function setThemeMode(next) {
  currentMode = next;
  writeStored(next);
  applyToDom(currentMode);
  listeners.forEach((l) => l());
}
function subscribeTheme(cb) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

// src/components/ThemeToggle.tsx
import { jsx as jsx4, jsxs as jsxs2 } from "react/jsx-runtime";
var ORDER = ["light", "dark", "system"];
var ICONS = { light: Sun, dark: Moon, system: Monitor };
var LABELS = { light: "Claro", dark: "Escuro", system: "Sistema" };
function useTheme() {
  const mode = useSyncExternalStore(subscribeTheme, getThemeMode);
  const effective = useSyncExternalStore(subscribeTheme, getEffectiveTheme);
  return { mode, effective, setThemeMode };
}
function ThemeToggleIcon({ className } = {}) {
  const { mode, setThemeMode: setThemeMode2 } = useTheme();
  const Icon = ICONS[mode];
  function cycle() {
    const next = ORDER[(ORDER.indexOf(mode) + 1) % ORDER.length];
    setThemeMode2(next);
  }
  return /* @__PURE__ */ jsx4(
    "button",
    {
      onClick: cycle,
      title: `Tema: ${LABELS[mode]} (clique para alternar)`,
      className: className ?? "rounded-lg p-1.5 text-subtle-foreground transition-colors hover:bg-surface-hover hover:text-foreground-secondary",
      children: /* @__PURE__ */ jsx4(Icon, { size: 15 })
    }
  );
}
function ThemeToggleSegmented() {
  const { mode, setThemeMode: setThemeMode2 } = useTheme();
  return /* @__PURE__ */ jsx4("div", { className: "flex gap-0.5 rounded-lg bg-surface-alt p-0.5", children: ORDER.map((m) => {
    const Icon = ICONS[m];
    return /* @__PURE__ */ jsxs2(
      "button",
      {
        onClick: () => setThemeMode2(m),
        title: LABELS[m],
        className: `flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium transition-colors ${mode === m ? "bg-surface text-accent shadow-sm" : "text-muted-foreground hover:text-foreground-secondary"}`,
        children: [
          /* @__PURE__ */ jsx4(Icon, { size: 13 }),
          LABELS[m]
        ]
      },
      m
    );
  }) });
}

// src/components/LoginInPeace.tsx
import { Eye, EyeOff } from "lucide-react";
import { useId, useState } from "react";

// src/login.ts
var API_IAM_PADRAO = "https://acessos-api.lagoinha.app";
var MENSAGENS_PADRAO = {
  "401": "E-mail ou senha do InPeace incorretos.",
  "403": "Login confirmado no InPeace, mas essa conta n\xE3o tem acesso a este app.",
  "429": "Muitas tentativas seguidas. Aguarde um minuto e tente de novo.",
  "503": "N\xE3o foi poss\xEDvel falar com o InPeace agora. Tente de novo em instantes.",
  rede: "Sem conex\xE3o com o servidor. Verifique sua internet e tente de novo.",
  outro: "N\xE3o foi poss\xEDvel entrar. Tente de novo em instantes."
};
var LoginError = class extends Error {
  constructor(message, status) {
    super(message);
    this.name = "LoginError";
    this.status = status;
  }
};
function mensagemDeErro(chave, personalizadas = {}) {
  return personalizadas[chave] ?? MENSAGENS_PADRAO[String(chave)] ?? personalizadas.outro ?? MENSAGENS_PADRAO.outro;
}
async function postarLogin(rota, email, senha, { apiUrl = API_IAM_PADRAO, mensagens = {}, fetchImpl = fetch, timeoutMs = 2e4 } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  let resp;
  try {
    resp = await fetchImpl(`${apiUrl}${rota}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim(), senha }),
      credentials: "include",
      signal: controller.signal
    });
  } catch {
    throw new LoginError(mensagemDeErro("rede", mensagens));
  } finally {
    clearTimeout(timer);
  }
  if (!resp.ok) throw new LoginError(mensagemDeErro(resp.status, mensagens), resp.status);
  try {
    return await resp.json();
  } catch {
    throw new LoginError(mensagemDeErro("outro", mensagens), resp.status);
  }
}
function autenticarNoIam(email, senha, opcoes = {}) {
  return postarLogin("/auth/login-inpeace", email, senha, opcoes);
}
function autenticarMembroNoIam(email, senha, opcoes = {}) {
  return postarLogin("/auth/login-membro", email, senha, opcoes);
}
async function autenticarComFallbackDeMembro(email, senha, { permitirMembro = false, ...opcoes } = {}) {
  try {
    return { tokens: await autenticarNoIam(email, senha, opcoes), membro: false };
  } catch (err) {
    if (permitirMembro && err instanceof LoginError && err.status === 403) {
      return { tokens: await autenticarMembroNoIam(email, senha, opcoes), membro: true };
    }
    throw err;
  }
}

// src/components/LoginInPeace.tsx
import { jsx as jsx5, jsxs as jsxs3 } from "react/jsx-runtime";
function LoginFrame({ nome, descricao, icone, logoUrl, children }) {
  return /* @__PURE__ */ jsx5("div", { className: "flex min-h-screen items-center justify-center bg-brand-black p-4", children: /* @__PURE__ */ jsxs3("div", { className: "w-full max-w-sm rounded-xl border border-border bg-surface p-4 shadow-sm", children: [
    /* @__PURE__ */ jsxs3("div", { className: "mb-6 text-center", children: [
      logoUrl && /* @__PURE__ */ jsx5("img", { src: logoUrl, alt: "Lagoinha", className: "mx-auto mb-3 h-14 w-14 dark:invert" }),
      /* @__PURE__ */ jsxs3("h1", { className: "flex items-center justify-center gap-2 text-2xl font-bold text-accent", children: [
        icone,
        nome
      ] }),
      descricao && /* @__PURE__ */ jsx5("p", { className: "mt-1 text-sm text-muted-foreground", children: descricao })
    ] }),
    children
  ] }) });
}
function LoginInPeace({
  nome,
  descricao,
  icone,
  logoUrl,
  apiUrl,
  onAuthenticated,
  permitirMembro,
  mensagens,
  esqueciSenhaUrl,
  rodape
}) {
  const id = useId();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  async function enviar(e) {
    e.preventDefault();
    if (carregando) return;
    setCarregando(true);
    setErro("");
    try {
      const { tokens, membro } = await autenticarComFallbackDeMembro(email, senha, { apiUrl, mensagens, permitirMembro });
      await onAuthenticated(tokens, { membro });
    } catch (err) {
      setErro(err instanceof Error && err.message ? err.message : mensagemDeErro("outro", mensagens));
    } finally {
      setCarregando(false);
    }
  }
  const campo = "w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent";
  const rotulo = "mb-1 block text-sm font-medium text-foreground-secondary";
  return /* @__PURE__ */ jsxs3(LoginFrame, { nome, descricao, icone, logoUrl, children: [
    /* @__PURE__ */ jsx5("p", { className: "mb-4 text-xs text-subtle-foreground", children: "Use o mesmo e-mail e senha do InPeace." }),
    /* @__PURE__ */ jsxs3("form", { onSubmit: enviar, className: "space-y-4", "aria-busy": carregando, children: [
      /* @__PURE__ */ jsxs3("div", { children: [
        /* @__PURE__ */ jsx5("label", { htmlFor: `${id}-email`, className: rotulo, children: "E-mail do InPeace" }),
        /* @__PURE__ */ jsx5(
          "input",
          {
            id: `${id}-email`,
            type: "email",
            inputMode: "email",
            autoComplete: "username",
            autoFocus: true,
            required: true,
            value: email,
            onChange: (e) => setEmail(e.target.value),
            className: campo
          }
        )
      ] }),
      /* @__PURE__ */ jsxs3("div", { children: [
        /* @__PURE__ */ jsx5("label", { htmlFor: `${id}-senha`, className: rotulo, children: "Senha do InPeace" }),
        /* @__PURE__ */ jsxs3("div", { className: "relative", children: [
          /* @__PURE__ */ jsx5(
            "input",
            {
              id: `${id}-senha`,
              type: mostrarSenha ? "text" : "password",
              autoComplete: "current-password",
              required: true,
              value: senha,
              onChange: (e) => setSenha(e.target.value),
              className: `${campo} pr-10`
            }
          ),
          /* @__PURE__ */ jsx5(
            "button",
            {
              type: "button",
              onClick: () => setMostrarSenha((v) => !v),
              "aria-label": mostrarSenha ? "Ocultar senha" : "Mostrar senha",
              "aria-pressed": mostrarSenha,
              className: "absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground",
              children: mostrarSenha ? /* @__PURE__ */ jsx5(EyeOff, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx5(Eye, { className: "h-4 w-4" })
            }
          )
        ] })
      ] }),
      erro && /* @__PURE__ */ jsx5("p", { role: "alert", className: "text-sm text-danger-foreground", children: erro }),
      /* @__PURE__ */ jsx5(Button, { type: "submit", className: "w-full disabled:cursor-not-allowed disabled:opacity-60", disabled: carregando, children: carregando ? "Entrando\u2026" : "Entrar" }),
      esqueciSenhaUrl && /* @__PURE__ */ jsx5("p", { className: "text-center text-xs", children: /* @__PURE__ */ jsx5("a", { href: esqueciSenhaUrl, className: "text-muted-foreground underline hover:text-foreground", children: "Esqueci a senha" }) })
    ] }),
    rodape && /* @__PURE__ */ jsx5("div", { className: "mt-4", children: rodape })
  ] });
}
export {
  API_IAM_PADRAO,
  AppShell,
  Badge,
  Button,
  LoginError,
  LoginFrame,
  LoginInPeace,
  ThemeToggleIcon,
  ThemeToggleSegmented,
  autenticarComFallbackDeMembro,
  autenticarMembroNoIam,
  autenticarNoIam,
  getEffectiveTheme,
  getThemeMode,
  mensagemDeErro,
  setThemeMode,
  subscribeTheme
};
