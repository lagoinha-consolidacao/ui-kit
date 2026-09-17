/**
 * Preset Tailwind do ecossistema Lagoinha.
 * Uso: presets: [require('@lagoinha/ui-kit/tailwind-preset')] no tailwind.config.js do app.
 * Requer que tokens.css (@lagoinha/ui-kit/tokens.css) esteja importado no app.
 */
module.exports = {
  theme: {
    extend: {
      colors: {
        brandBlack: 'var(--brand-black)',
        ink: {
          DEFAULT: 'var(--ink)',
          soft: 'var(--ink-soft)',
        },
        paper: 'var(--paper)',
        surface: 'var(--surface)',
        line: 'var(--line)',
        gold: {
          100: 'var(--gold-100)',
          300: 'var(--gold-300)',
          500: 'var(--gold-500)',
          600: 'var(--gold-600)',
          700: 'var(--gold-700)',
          DEFAULT: 'var(--gold-500)',
        },
        bronze: {
          DEFAULT: 'var(--bronze)',
          soft: 'var(--bronze-soft)',
        },
        success: 'var(--success)',
        warning: 'var(--warning)',
        danger: 'var(--danger)',
      },
      fontFamily: {
        display: ['Big Shoulders Display', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
    },
  },
};
