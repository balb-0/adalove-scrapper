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

describe('parseKanban — autoestudos migrados entre colunas', () => {
  // Bug real do dia 06/08: aluno moveu autoestudos de Probabilidade
  // pra "doing". Parser antigo tratava cada coluna como bucket isolado
  // e o autoestudo caía num placeholder "Sem aula associada".
  const html = `
    <div>
      <h6>Semana 01</h6>
      <div data-rbd-droppable-id="toDo">
        ${cardAula('aula-prob', 'chalkboard-user-solido', 'Probabilidade e Estatística Descritiva', {
          data: '06/08/2026', hora: '10:00h', prof: 'Geraldo', eixo: 'MTF',
        })}
        ${cardAula('aula-design', 'chalkboard-user-solido', 'Design Lab: Definição de Escopo', {
          eixo: 'UEX',
        })}
      </div>
      <div data-rbd-droppable-id="doing">
        ${cardAutoestudo('auto-video-prob', 'Videoaula: Probabilidade condicional', 'MTF')}
        ${cardAutoestudo('auto-blueprint', 'Exemplo de Service Blueprint', 'UEX')}
      </div>
    </div>
  `;
  const { document } = parseHTML(html);
  const kanban = parseKanban(document);

  it('videoaula MTF vai pra Probabilidade (não pra Design Lab nem placeholder)', () => {
    const prob = kanban.aulas.find((a) => a.titulo.startsWith('Probabilidade'));
    const design = kanban.aulas.find((a) => a.titulo.startsWith('Design Lab'));
    expect(prob?.autoestudos.map((a) => a.titulo)).toContain(
      'Videoaula: Probabilidade condicional',
    );
    expect(design?.autoestudos.map((a) => a.titulo)).not.toContain(
      'Videoaula: Probabilidade condicional',
    );
  });

  it('blueprint UEX vai pra Design Lab', () => {
    const design = kanban.aulas.find((a) => a.titulo.startsWith('Design Lab'));
    expect(design?.autoestudos.map((a) => a.titulo)).toContain(
      'Exemplo de Service Blueprint',
    );
  });

  it('não cria placeholder "Sem aula associada" quando eixo bate', () => {
    const placeholder = kanban.aulas.find((a) => a.titulo.startsWith('Sem aula'));
    expect(placeholder).toBeUndefined();
  });
});

// helpers pros fixtures sintéticos
function cardAula(
  id: string,
  icone: string,
  titulo: string,
  info: { data?: string; hora?: string; prof?: string; eixo?: string } = {},
): string {
  const clock =
    info.data || info.hora
      ? `<div class="info-card-activity-children">
           <div id="clock-solido"></div>
           <p>${info.data ?? ''} ${info.hora ? `- ${info.hora}` : ''}</p>
         </div>`
      : '';
  const prof = info.prof
    ? `<div class="info-card-activity-children">
         <div id="person-chalkboard-solido"></div>
         <p>${info.prof}</p>
       </div>`
    : '';
  const eixo = info.eixo
    ? `<div class="info-card-activity-children">
         <div id="circle-nodes-solido"></div>
         <p><span>Eixo: </span><span>${info.eixo}</span></p>
       </div>`
    : '';
  return `<div data-rbd-draggable-id="${id}" role="button">
    <div class="header-card-activity">
      <div class="header-card-activity-children">
        <div id="${icone}"></div>
        <span class="title-card-activity">${titulo}</span>
      </div>
    </div>
    <div class="infos-card-activity">${clock}${prof}${eixo}</div>
  </div>`;
}

function cardAutoestudo(id: string, titulo: string, eixo: string): string {
  return cardAula(id, 'book-open-reader-solido', titulo, { eixo });
}
