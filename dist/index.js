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
export {
  AppShell,
  Badge,
  Button,
  getEffectiveTheme,
  getThemeMode,
  setThemeMode,
  subscribeTheme
};
