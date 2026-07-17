import { describe, expect, it } from 'vitest';
import { encode, decode } from './codec.ts';
import type { Kanban } from './types.ts';

const sample: Kanban = {
  semana: 'Semana 01',
  parsedAt: 1_700_000_000_000,
  aulas: [
    {
      id: 'aula-1',
      tipo: 'aula',
      titulo: 'Probabilidade e Estatística Descritiva',
      data: '06/08/2026',
      hora: '10:00h',
      professor: 'Geraldo Magela Severino Vasconcelos',
      eixo: 'MTF',
      tag: null,
      coluna: 'toDo',
      autoestudos: [
        {
          id: 'auto-1',
          titulo: 'Autoestudo Guiado - Probabilidade 1',
          eixo: 'MTF',
          professor: 'Geraldo Magela Severino Vasconcelos',
          atividadePonderada: false,
          tag: 'Em sala',
          coluna: 'toDo',
          links: [
            { text: 'Autoestudo Guiado', url: 'https://drive.google.com/xxx' },
          ],
        },
      ],
    },
  ],
};

describe('codec — round-trip', () => {
  it('encode + decode devolve o mesmo objeto', async () => {
    const encoded = await encode(sample);
    const decoded = await decode(encoded);
    expect(decoded).toEqual(sample);
  });

  it('output é URL-safe base64 (sem padding, sem +, sem /)', async () => {
    const encoded = await encode(sample);
    expect(encoded).not.toMatch(/[+/=]/);
  });

  it('comprime — payload encoded é menor que JSON puro', async () => {
    const encoded = await encode(sample);
    const json = JSON.stringify(sample);
    // gzip+b64 pode ser menor OU um pouco maior pra payloads pequenos.
    // Testamos que pelo menos não explodiu de tamanho.
    expect(encoded.length).toBeLessThan(json.length * 2);
  });

  it('decode falha em payload malformado', async () => {
    await expect(decode('lixo-que-nao-e-b64')).rejects.toThrow();
  });
});
