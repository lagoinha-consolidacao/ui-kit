# @lagoinha/ui-kit

Design system compartilhado do ecossistema Lagoinha — tokens de marca (Tailwind v4, CSS-first), gerenciador de tema claro/escuro e componentes de shell (`AppShell`, `Button`, `Badge`), extraídos da identidade real de lagoinhaalphaville.com.br.

## Instalar num front

```bash
npm install github:lagoinha-consolidacao/ui-kit#v0.2.0
```

Assume Tailwind v4 (`@import "tailwindcss"`, sem `tailwind.config.js`) — é o que todo front do ecossistema já usa.

## Usar

**1. Importar o tema**, no CSS de entrada do app (ex. `src/index.css`), **depois** de `@import "tailwindcss";`:

```css
@import "tailwindcss";
@import "@lagoinha/ui-kit/theme.css";
```

Isso já registra as cores (`bg-canvas`, `text-foreground`, `bg-accent`, `bg-success`, etc.) como utilities do Tailwind — não precisa de preset nem de config extra. Se o app já tiver seu próprio bloco `:root { --color-... }` / `.dark { ... }` / `@theme inline { ... }`, remova-o — é exatamente o que este import substitui.

**2. Alternância claro/escuro** (opcional — sem isso, o app fica sempre no claro):

```ts
import { getThemeMode, setThemeMode, getEffectiveTheme } from '@lagoinha/ui-kit';

setThemeMode('dark'); // 'light' | 'dark' | 'system'
```

Aplica a classe `.dark` em `<html>` sozinho, com persistência em `localStorage` e resposta a mudança de preferência do sistema quando o modo é `'system'`.

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

1. Editar `theme.css` / `src/theme.ts` / `src/components/*`.
2. `npm run build` (gera `dist/`, precisa estar commitado — é o que o `github:` instala, sem passo de build no consumidor).
3. Commit + tag nova (`git tag v0.3.0 && git push origin v0.3.0`).
4. Em cada front: `npm install github:lagoinha-consolidacao/ui-kit#v0.3.0`, testar, redeploy.

Não é automático em todos os apps ao mesmo tempo — cada front escolhe quando subir de versão, então dá pra migrar um de cada vez sem quebrar os outros.
