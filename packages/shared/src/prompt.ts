import type { Aula } from './types.ts';

/**
 * Gera o mega-prompt pronto pra colar no NotebookLM (ou qualquer LLM que aceite contexto grande).
 * Template fixo — o user disse que não precisa ser dinâmico no V1.
 */
export function buildMegaPrompt(aula: Aula): string {
  const partes: string[] = [];

  const eixo = aula.eixo ? ` (${aula.eixo})` : '';
  const prof = aula.professor ? `, com o professor ${aula.professor}` : '';
  partes.push(`Vou ter aula amanhã de **${aula.titulo}**${eixo}${prof}.`);

  const meta: string[] = [];
  if (aula.data) meta.push(aula.data);
  if (aula.hora) meta.push(aula.hora);
  if (meta.length > 0) partes.push(`Data: ${meta.join(' - ')}.`);

  partes.push('');
  partes.push('Os materiais de autoestudo que a faculdade indicou pra essa aula são:');
  partes.push('');

  if (aula.autoestudos.length === 0) {
    partes.push('_(nenhum autoestudo listado)_');
  } else {
    aula.autoestudos.forEach((auto, i) => {
      const autoEixo = auto.eixo ? ` (${auto.eixo})` : '';
      partes.push(`${i + 1}. **${auto.titulo}**${autoEixo}`);
      if (auto.links.length === 0) {
        partes.push('   _(sem link externo)_');
      } else {
        for (const link of auto.links) {
          const rotulo = link.text.trim() || link.url;
          partes.push(`   - ${rotulo}: ${link.url}`);
        }
      }
    });
  }

  partes.push('');
  partes.push(
    'Preciso da sua ajuda pra me preparar. NÃO me dê apenas resumos de 2 linhas',
  );
  partes.push(
    'sobre cada conteúdo. Quero entender profundamente o que vai ser discutido na',
  );
  partes.push(
    'aula — os conceitos-chave, como eles se conectam, o que provavelmente vai',
  );
  partes.push('ser cobrado, e onde posso me confundir.');
  partes.push('');
  partes.push('Estrutura sua resposta assim:');
  partes.push('1. **Panorama** — do que trata essa aula, em 1 parágrafo denso');
  partes.push(
    '2. **Conceitos-chave** — cada um explicado com um exemplo concreto',
  );
  partes.push('3. **Conexões** — como os autoestudos se relacionam entre si');
  partes.push(
    '4. **Antecipe minhas dúvidas** — o que um aluno tipicamente entende errado nesse tópico',
  );
  partes.push(
    '5. **Como me testar** — 3 perguntas que eu deveria conseguir responder pós-aula',
  );

  return partes.join('\n');
}
