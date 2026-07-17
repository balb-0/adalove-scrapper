import { describe, expect, it } from 'vitest';
import { buildMegaPrompt } from './prompt.ts';
import type { Aula } from './types.ts';

const base: Aula = {
  id: 'aula-1',
  tipo: 'aula',
  titulo: 'Probabilidade e Estatística Descritiva',
  data: '06/08/2026',
  hora: '10:00h',
  professor: 'Geraldo',
  eixo: 'MTF',
  tag: null,
  coluna: 'toDo',
  autoestudos: [
    {
      id: 'auto-1',
      titulo: 'Autoestudo Guiado - Probabilidade 1',
      eixo: 'MTF',
      professor: 'Geraldo',
      atividadePonderada: false,
      tag: 'Em sala',
      coluna: 'toDo',
      links: [
        {
          text: 'Autoestudo Guiado',
          url: 'https://drive.google.com/file/xxx',
        },
      ],
    },
  ],
};

describe('buildMegaPrompt', () => {
  it('inclui título, eixo, professor, data, hora', () => {
    const out = buildMegaPrompt(base);
    expect(out).toContain('Probabilidade e Estatística Descritiva');
    expect(out).toContain('(MTF)');
    expect(out).toContain('Geraldo');
    expect(out).toContain('06/08/2026');
    expect(out).toContain('10:00h');
  });

  it('inclui título dos autoestudos e links', () => {
    const out = buildMegaPrompt(base);
    expect(out).toContain('Autoestudo Guiado - Probabilidade 1');
    expect(out).toContain('https://drive.google.com/file/xxx');
  });

  it('omite menção a professor quando ausente', () => {
    const out = buildMegaPrompt({ ...base, professor: null });
    expect(out).not.toContain('com o professor');
    expect(out).toContain('Probabilidade');
  });

  it('mostra fallback pra autoestudo sem link', () => {
    const out = buildMegaPrompt({
      ...base,
      autoestudos: [
        {
          ...base.autoestudos[0]!,
          links: [],
        },
      ],
    });
    expect(out).toContain('(sem link externo)');
  });

  it('mostra fallback pra aula sem autoestudos', () => {
    const out = buildMegaPrompt({ ...base, autoestudos: [] });
    expect(out).toContain('(nenhum autoestudo listado)');
  });

  it('termina com as 5 seções pedidas', () => {
    const out = buildMegaPrompt(base);
    expect(out).toContain('1. **Panorama**');
    expect(out).toContain('2. **Conceitos-chave**');
    expect(out).toContain('3. **Conexões**');
    expect(out).toContain('4. **Antecipe minhas dúvidas**');
    expect(out).toContain('5. **Como me testar**');
  });
});
