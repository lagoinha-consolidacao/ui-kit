# @lagoinha/ui-kit

Design system compartilhado do ecossistema Lagoinha — tokens de marca, preset Tailwind e componentes de shell (`AppShell`, `Button`, `Badge`), extraídos da identidade real de lagoinhaalphaville.com.br.

## Instalar num front

```bash
npm install github:lagoinha-consolidacao/ui-kit#v0.1.0
```

## Usar

**1. Importar os tokens** (uma vez, no CSS de entrada do app — ex. `src/index.css`):

```css
@import "@lagoinha/ui-kit/tokens.css";
```

**2. Adicionar o preset no `tailwind.config.js` do app:**

```js
export default {
  presets: [require('@lagoinha/ui-kit/tailwind-preset')],
  content: ['./src/**/*.{ts,tsx}'],
  // ...o resto da config do app continua igual
};
```

**3. Usar os componentes:**

```tsx
import { AppShell, Button, Badge } from '@lagoinha/ui-kit';

<AppShell
  appName="Pastoral"
  apps={[
    { label: 'Pastoral', href: 'https://atendimento.lagoinha.app', active: true },
    { label: 'Lakespace', href: 'https://lakespace.lagoinha.app' },
    { label: 'Certifica', href: 'https://certifica.lagoinha.app' },
  ]}
/>
```

## Atualizar depois de uma mudança no pacote

1. Editar `tokens.css` / `tailwind-preset.js` / `src/components/*`.
2. `npm run build` (gera `dist/`, precisa estar commitado — é o que o `github:` instala, sem passo de build no consumidor).
3. Commit + tag nova (`git tag v0.2.0 && git push origin v0.2.0`).
4. Em cada front: `npm install github:lagoinha-consolidacao/ui-kit#v0.2.0`, testar, redeploy.

Não é automático em todos os apps ao mesmo tempo — cada front escolhe quando subir de versão, então dá pra migrar um de cada vez sem quebrar os outros.
