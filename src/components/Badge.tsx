import type { ReactNode } from 'react';

export interface BadgeProps {
  tone?: 'success' | 'warning' | 'danger' | 'neutral';
  children: ReactNode;
}

const toneClasses: Record<NonNullable<BadgeProps['tone']>, string> = {
  success: 'bg-success/15 text-success',
  warning: 'bg-warning/15 text-warning',
  danger: 'bg-danger/15 text-danger',
  neutral: 'bg-line text-ink-soft',
};

/** Selo de status (ex.: Confirmado/Pendente/Cancelado) — cor semântica, nunca o dourado de marca. */
export function Badge({ tone = 'neutral', children }: BadgeProps) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${toneClasses[tone]}`}>
      {children}
    </span>
  );
}
