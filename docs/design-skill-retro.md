---
name: retro
description: Hand-lettered, analog-inspired design system (typeui.sh Retro skill — resumo)
source: https://www.typeui.sh/design-skills/retro
status: SUMMARY (não é o SKILL.md oficial — o typeui.sh estava rate-limitado; substituir pela cópia oficial via Copy button do site)
---

# Retro — resumo dos tokens e princípios

Skill oficial: <https://www.typeui.sh/design-skills/retro>

Retro é um design system hand-lettered, análogo, com clima de vintage poster / carnival sign / letterpress. Todo o interface carrega personalidade calligráfica. **A tipografia é o espetáculo visual**; a cor serve papel funcional.

## Typography — Macondo

- Fonte primária e display: **Macondo** (Google Fonts, `Macondo:wght@400`)
- Aplicada a **body, headings, labels, navigation** — uma fonte pra tudo, purismo Retro.
- Características: swashed letterforms, strokes calligráficos, ritmo orgânico (não uniforme), letras se conectam com fluidez.
- Fallback: `cursive`.

Neste projeto, adaptamos: Macondo em títulos + textarea do mega-prompt; **JetBrains Mono** em metadados (datas, eixo, URLs) pra preservar leitura em telas pequenas.

## Palette — blue-violet high-contrast (SUBSTITUÍDO)

O Retro default usa `#3B82F6` (primary blue) + `#8B5CF6` (secondary violet) aplicados em alta saturação.

**Neste projeto substituímos pela paleta real do Adalove** (creme + roxo Adalove + laranja Adalove + vermelho Adalove). Ver `packages/web/src/styles.css` pros hex exatos e `docs/../wild-napping-crown.md` (plan file) pra racional.

O princípio Retro que preservamos: **cores aplicadas na força máxima**, sem tons pastel, sem "fading into background". Letterpress vibe.

## Spacing — grid 4px

- Tudo múltiplo de 4px.
- Densidade média — não é minimalista, não é apertado.
- Verticalidade generosa em títulos (a fonte é ornamentada, precisa respirar).

## Ornament / mood

- Analog personality — referência explícita a craft tradicional: letterpress, hand-painted signs, calligraphy.
- Divisores/bordas podem ter feel de "tinta na página" — 1-2px sólidos, cantos com radius sutis (4-8px, não pill).
- Zero neomorphism, zero glassmorphism, zero shadows profundos. Máximo shadow: sutil pra dar profundidade em cards.
- Fundo pode ter textura de papel muito sutil (opacidade < 5%) — opcional, só como nice-to-have.

## Components — princípios

- **Buttons**: preenchidos na cor primary (não outline default). Fonte Macondo, peso normal (400). Padding generoso (`px-6 py-3`).
- **Cards**: fundo `--surface-elevated`, borda `1px --border`, radius `--radius-md` (8px). Sem shadow ou shadow mínimo.
- **Inputs**: fundo `--surface-elevated`, borda `1px --border`, focus ring `2px --primary`. Fonte Mono (é dado, não voz).
- **Badges/tags**: preenchimento sólido na cor semântica, texto em `--*-fg` (branco sobre cor).
- **Textarea do mega-prompt**: Macondo, tamanho generoso (18-20px), altura de linha 1.5, padding interno grande. É o principal artefato de leitura.

## Regras de composição

1. Uma tela = uma voz tipográfica (Macondo). Se precisar Mono, é pra metadado, não pra headline.
2. Cor sempre em intensidade máxima. Se algo precisa de "sutil", usa `--surface-muted` ou `--foreground-muted` — nunca "diminuir" um acento.
3. Contraste WCAG AA como piso. Testar todos os pares primary/accent/danger contra surface nos 2 temas.
4. Componentes se repetem verbatim entre light/dark — só os hex mudam. Nenhum componente aparece só em um tema.

## TODO

- [ ] Substituir esse resumo pela cópia oficial do SKILL.md do typeui.sh/design-skills/retro assim que o rate limit passar (usar o botão "Copy" no site).
