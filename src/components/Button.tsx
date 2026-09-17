import type { ButtonHTMLAttributes } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
}

/** Botão padrão do ecossistema — dourado como única ação primária, nunca mais de um por tela. */
export function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
  const base = 'rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors';
  const styles =
    variant === 'primary'
      ? 'bg-accent text-accent-foreground hover:bg-accent-hover'
      : 'border border-border bg-transparent text-foreground hover:bg-surface-hover';
  return <button className={`${base} ${styles} ${className}`} {...props} />;
}
