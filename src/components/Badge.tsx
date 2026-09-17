import type { ReactNode } from 'react';

export interface BadgeProps {
  tone?: 'success' | 'warning' | 'danger' | 'neutral';
  children: ReactNode;
}

const toneClasses: Record<NonNullable<BadgeProps['tone']>, string> = {
  success: 'bg-success text-success-foreground',
  warning: 'bg-warning text-warning-foreground',
  danger: 'bg-danger text-danger-foreground',
  neutral: 'bg-surface-alt text-muted-foreground',
};

/** Selo de status (ex.: Confirmado/Pendente/Cancelado) — cor semântica, nunca o dourado de marca. */
export function Badge({ tone = 'neutral', children }: BadgeProps) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${toneClasses[tone]}`}>
      {children}
    </span>
  );
}
