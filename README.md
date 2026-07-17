# adalove-scrapper

Detesto fazer autoestudos tanto quanto você. Tomara que ajude. <br>
Zero backend, zero conta, zero coleta de dados. Tudo roda no  browser.

## por que existe

Porque eu tinha um scrapper meu pra ajudar a fazer o autoestudo mais rápido e tava com tempo livre pra ajudar a galera a perder menos tempo. 

## como usar

1. **instale a extension** — Chrome ou Firefox (em breve; enquanto isso, [modo desenvolvedor](#usando-antes-da-publicação-nas-stores))
2. na Adalove, escolhe a semana (Vida Acadêmica → Minhas Atividades → Semana XX)
3. clique no ícone da extension → **"scrapear essa semana"**
4. quando terminar, uma aba do [adalove-scrapper.vercel.app](https://adalove-scrapper.vercel.app) abre com todas as suas aulas
5. clique na aula alvo na sidebar
6. clique **"copiar tudo"** e cola no [NotebookLM](https://notebooklm.google.com/)

## stack

- **web app** (`packages/web`) — TanStack Start + React 19 + Vite 7 + Tailwind v4. Deploy Vercel. Zero backend, tudo em `localStorage`.
- **extension** (`packages/extension`) — WXT (single codebase pra Chrome MV3 + Firefox). React no popup. Content script faz o scrape via clique nos modais (mesma técnica do MVP original).
- **shared** (`packages/shared`) — tipos, parser DOM → Kanban, `buildMegaPrompt`, codec (gzip + base64url) pro payload extension→web via URL fragment.
- monorepo pnpm workspaces.

## dev

Precisa Node 20+ e pnpm 9+.

```bash
pnpm install

# web app em http://localhost:3000
pnpm dev:web

# extension em modo dev (Chrome)
pnpm dev:ext

# extension em modo dev (Firefox)
pnpm dev:ext:firefox

# testes (parser, codec, prompt)
pnpm test

# typecheck
pnpm typecheck
```

### usando antes da publicação nas stores

**Chrome:**

```bash
pnpm --filter extension build
```

Depois: `chrome://extensions` → habilita "Modo do desenvolvedor" → "Carregar sem compactação" → escolhe `packages/extension/.output/chrome-mv3/`.

**Firefox / Zen:**

```bash
pnpm --filter extension build:firefox
```

Depois: `about:debugging` → "Este Firefox" → "Carregar extensão temporária" → escolhe `packages/extension/.output/firefox-mv2/manifest.json`.

## contribuir

PRs bem-vindas. Antes de mandar:

1. `pnpm test` — os 20 testes do parser/codec/prompt precisam passar
2. `pnpm typecheck` — TypeScript strict, sem warning
3. se tocou parser, adicione um fixture representativo em `fixtures/` e um teste

## Contribuindo

O projeto ta aberto. Se quiser melhorar alguma coisa:

1. Forka o repo
2. Cria sua branch
3. Faz o que vc quiser aí
4. Abre um PR

Fica à vontade pra contribuir. Ou não também.

## Licença

MIT - pode usar a vontade. Sem fazer besteira.

---

Feito com vontade de nunca mais fazer autoestudo, por [Vitor Balbo](https://github.com/balb-0)
