import type { ButtonHTMLAttributes } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
}

/** Botão padrão do ecossistema — dourado como única ação primária, nunca mais de um por tela. */
export function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
  const base = 'rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors';
  const styles =
    variant === 'primary'
      ? 'bg-gold text-brandBlack hover:bg-gold-600'
      : 'border border-line bg-transparent text-ink hover:bg-line/40';
  return <button className={`${base} ${styles} ${className}`} {...props} />;
}
