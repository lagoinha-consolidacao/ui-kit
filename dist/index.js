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
var STORAGE_KEY = "theme";
var mq = window.matchMedia("(prefers-color-scheme: dark)");
function readStored() {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "light" || v === "dark" || v === "system") return v;
  } catch {
  }
  return "system";
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
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
  }
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
export {
  AppShell,
  Badge,
  Button,
  ThemeToggleIcon,
  ThemeToggleSegmented,
  getEffectiveTheme,
  getThemeMode,
  setThemeMode,
  subscribeTheme
};
