import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { parseHTML } from 'linkedom';
import { parseKanban } from './parser.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURE = resolve(__dirname, '../../../fixtures/adalove-kanban-sample.html');

function loadKanban() {
  const html = readFileSync(FIXTURE, 'utf-8');
  const { document } = parseHTML(html);
  return parseKanban(document);
}

describe('parseKanban — fixture Adalove.html', () => {
  const kanban = loadKanban();

  it('detecta pelo menos 4 aulas (Onboarding, Spec-Driven, Workshop, Probabilidade, Design Lab)', () => {
    expect(kanban.aulas.length).toBeGreaterThanOrEqual(4);
    const titulos = kanban.aulas.map((a) => a.titulo);
    expect(titulos).toContain('Onboarding e Sprint Planning 1');
    expect(titulos).toContain('Spec-Driven Development');
    expect(titulos).toContain('Probabilidade e Estatística Descritiva');
    expect(titulos).toContain('Design Lab: Definição de Escopo');
  });

  it('Design Lab (sem data) é uma aula separada com eixo UEX', () => {
    const designLab = kanban.aulas.find((a) => a.titulo.startsWith('Design Lab'));
    expect(designLab).toBeDefined();
    expect(designLab?.data).toBeNull();
    expect(designLab?.eixo).toBe('UEX');
    expect(designLab?.tipo).toBe('aula');
  });

  it('Autoestudos de Probabilidade ficam sob Probabilidade (não Design Lab)', () => {
    const prob = kanban.aulas.find((a) =>
      a.titulo.startsWith('Probabilidade'),
    );
    expect(prob).toBeDefined();
    const titulosAutos = prob!.autoestudos.map((a) => a.titulo);
    expect(titulosAutos).toContain('Autoestudo Guiado - Probabilidade 1');
    // Blueprint NÃO deve estar em Probabilidade — pertence a Design Lab
    expect(
      titulosAutos.some((t) => t.toLowerCase().includes('blueprint')),
    ).toBe(false);
  });

  it('Autoestudos de UEX (Blueprint, Miro) ficam sob Design Lab', () => {
    const designLab = kanban.aulas.find((a) =>
      a.titulo.startsWith('Design Lab'),
    );
    expect(designLab).toBeDefined();
    const titulosAutos = designLab!.autoestudos.map((a) => a.titulo);
    expect(
      titulosAutos.some((t) => t.toLowerCase().includes('blueprint')),
    ).toBe(true);
  });

  it('detecta Atividade Ponderada', () => {
    let achou = false;
    for (const aula of kanban.aulas) {
      for (const auto of aula.autoestudos) {
        if (auto.atividadePonderada) achou = true;
      }
    }
    expect(achou).toBe(true);
  });

  it('detecta tag Prova no Onboarding', () => {
    const onboarding = kanban.aulas.find((a) =>
      a.titulo.startsWith('Onboarding'),
    );
    expect(onboarding).toBeDefined();
    expect(onboarding?.tag).toBe('Prova');
  });

  it('todos os cards têm id estável (data-rbd-draggable-id)', () => {
    for (const aula of kanban.aulas) {
      if (aula.id.startsWith('placeholder-')) continue;
      expect(aula.id).toMatch(/^[a-f0-9]{20,}$/);
      for (const auto of aula.autoestudos) {
        expect(auto.id).toMatch(/^[a-f0-9]{20,}$/);
      }
    }
  });

  it('parsedAt é timestamp recente', () => {
    expect(kanban.parsedAt).toBeGreaterThan(Date.now() - 60_000);
    expect(kanban.parsedAt).toBeLessThanOrEqual(Date.now());
  });

  it('aulas com data vêm antes das sem data (ordenação)', () => {
    let vistoSemData = false;
    for (const aula of kanban.aulas) {
      if (aula.data === null) vistoSemData = true;
      else if (vistoSemData) {
        throw new Error(
          `Aula com data '${aula.data}' apareceu depois de aula sem data (ordem incorreta)`,
        );
      }
    }
  });

  it('coleta info do card Probabilidade (data + hora + professor + eixo)', () => {
    const prob = kanban.aulas.find((a) =>
      a.titulo.startsWith('Probabilidade'),
    );
    expect(prob?.data).toBe('06/08/2026');
    expect(prob?.hora).toBe('10:00h');
    expect(prob?.professor).toContain('Geraldo');
    expect(prob?.eixo).toBe('MTF');
  });
});
