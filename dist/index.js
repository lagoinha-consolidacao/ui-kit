// src/components/AppShell.tsx
import { jsx, jsxs } from "react/jsx-runtime";
var defaultLogo = /* @__PURE__ */ jsx("svg", { viewBox: "0 0 24 24", fill: "none", className: "h-3 w-3", "aria-hidden": "true", children: /* @__PURE__ */ jsx("path", { d: "M12 3 L15 11 L12 21 L9 11 Z", fill: "currentColor" }) });
function AppShell({ appName, apps, logo, actions }) {
  return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 bg-brandBlack px-5 py-3", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2.5 font-display text-[15px] font-black uppercase tracking-wide text-paper", children: [
      /* @__PURE__ */ jsx("span", { className: "flex h-6.5 w-6.5 items-center justify-center rounded-full border-2 border-gold text-gold", children: logo ?? defaultLogo }),
      "LAGOINHA"
    ] }),
    /* @__PURE__ */ jsxs("span", { className: "text-[13px] text-ink-soft", children: [
      "/ ",
      /* @__PURE__ */ jsx("b", { className: "font-semibold text-paper/90", children: appName })
    ] }),
    actions && /* @__PURE__ */ jsx("div", { className: "ml-auto flex items-center gap-3", children: actions }),
    /* @__PURE__ */ jsx("nav", { className: `flex gap-1.5 ${actions ? "" : "ml-auto"}`, children: apps.map((app) => /* @__PURE__ */ jsx(
      "a",
      {
        href: app.href,
        className: app.active ? "rounded-full bg-gold px-3 py-1.5 text-[11.5px] font-semibold text-brandBlack" : "rounded-full bg-white/[0.06] px-3 py-1.5 text-[11.5px] text-white/70 hover:bg-white/[0.1]",
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
  const styles = variant === "primary" ? "bg-gold text-brandBlack hover:bg-gold-600" : "border border-line bg-transparent text-ink hover:bg-line/40";
  return /* @__PURE__ */ jsx2("button", { className: `${base} ${styles} ${className}`, ...props });
}

// src/components/Badge.tsx
import { jsx as jsx3 } from "react/jsx-runtime";
var toneClasses = {
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
  danger: "bg-danger/15 text-danger",
  neutral: "bg-line text-ink-soft"
};
function Badge({ tone = "neutral", children }) {
  return /* @__PURE__ */ jsx3("span", { className: `rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${toneClasses[tone]}`, children });
}
export {
  AppShell,
  Badge,
  Button
};
