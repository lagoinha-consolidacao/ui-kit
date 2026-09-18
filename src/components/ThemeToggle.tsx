import { Sun, Moon, Monitor } from 'lucide-react';
import { useSyncExternalStore } from 'react';
import { getThemeMode, getEffectiveTheme, setThemeMode, subscribeTheme, type ThemeMode } from '../theme';

const ORDER: ThemeMode[] = ['light', 'dark', 'system'];
const ICONS = { light: Sun, dark: Moon, system: Monitor } as const;
const LABELS = { light: 'Claro', dark: 'Escuro', system: 'Sistema' } as const;

function useTheme() {
  const mode = useSyncExternalStore(subscribeTheme, getThemeMode);
  const effective = useSyncExternalStore(subscribeTheme, getEffectiveTheme);
  return { mode, effective, setThemeMode };
}

export interface ThemeToggleIconProps {
  /**
   * Substitui as classes de cor padrão (pensadas pra uma superfície que já
   * muda com o tema, ex. bg-surface) — necessário numa barra sempre escura
   * (ex. bg-brand-black), onde os tokens adaptáveis ficariam sem contraste.
   */
  className?: string;
}

/** Botão único que cicla claro → escuro → sistema — pro rodapé de uma sidebar. */
export function ThemeToggleIcon({ className }: ThemeToggleIconProps = {}) {
  const { mode, setThemeMode } = useTheme();
  const Icon = ICONS[mode];

  function cycle() {
    const next = ORDER[(ORDER.indexOf(mode) + 1) % ORDER.length];
    setThemeMode(next);
  }

  return (
    <button
      onClick={cycle}
      title={`Tema: ${LABELS[mode]} (clique para alternar)`}
      className={className ?? 'rounded-lg p-1.5 text-subtle-foreground transition-colors hover:bg-surface-hover hover:text-foreground-secondary'}
    >
      <Icon size={15} />
    </button>
  );
}

/** Controle de 3 opções lado a lado, com label — pra um menu/tela com mais espaço. */
export function ThemeToggleSegmented() {
  const { mode, setThemeMode } = useTheme();

  return (
    <div className="flex gap-0.5 rounded-lg bg-surface-alt p-0.5">
      {ORDER.map((m) => {
        const Icon = ICONS[m];
        return (
          <button
            key={m}
            onClick={() => setThemeMode(m)}
            title={LABELS[m]}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium transition-colors ${
              mode === m ? 'bg-surface text-accent shadow-sm' : 'text-muted-foreground hover:text-foreground-secondary'
            }`}
          >
            <Icon size={13} />
            {LABELS[m]}
          </button>
        );
      })}
    </div>
  );
}
