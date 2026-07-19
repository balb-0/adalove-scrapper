import type {
  Aula,
  Autoestudo,
  ColunaKanban,
  Eixo,
  Kanban,
  Tag,
  TipoCard,
} from './types.ts';
import { PLACEHOLDER_AULA_TITULO } from './types.ts';

/**
 * Parseia o DOM do kanban do Adalove num Kanban estruturado.
 * Roda tanto no browser (extension content script) quanto em testes (linkedom).
 *
 * Não coleta links dos autoestudos — isso é responsabilidade do scraper
 * (abre modal → coleta <a href> → fecha), que preenche `autoestudo.links` depois.
 */
interface CardParseado {
  tipo: TipoCard;
  coluna: ColunaKanban;
  aula: Aula | null;      // populado se tipo=aula|grupo
  auto: Autoestudo | null; // populado se tipo=autoestudo
  ordemNoDom: number;      // pra tie-breakers
}

export function parseKanban(root: ParentNode): Kanban {
  const cardsParseados: CardParseado[] = [];
  const colunas = Array.from(
    root.querySelectorAll<HTMLElement>('[data-rbd-droppable-id]'),
  );

  let ordem = 0;
  for (const coluna of colunas) {
    const colunaId = normalizeColuna(coluna.dataset.rbdDroppableId ?? '');
    if (!colunaId) continue;

    const cardsNaColuna = Array.from(
      coluna.querySelectorAll<HTMLElement>(
        'div[data-rbd-draggable-id][role="button"]',
      ),
    );

    for (const card of cardsNaColuna) {
      const tipo = detectarTipo(card);
      if (!tipo) continue;

      if (tipo === 'aula' || tipo === 'grupo') {
        const aula = parseAula(card, tipo, colunaId);
        if (aula) {
          cardsParseados.push({
            tipo,
            coluna: colunaId,
            aula,
            auto: null,
            ordemNoDom: ordem++,
          });
        }
      } else {
        const auto = parseAutoestudo(card, colunaId);
        if (!auto) continue;
        cardsParseados.push({
          tipo,
          coluna: colunaId,
          aula: null,
          auto,
          ordemNoDom: ordem++,
        });
      }
    }
  }

  const aulas = cardsParseados
    .filter((c): c is CardParseado & { aula: Aula } => c.aula !== null)
    .map((c) => c.aula);

  const autoestudos = cardsParseados.filter(
    (c): c is CardParseado & { auto: Autoestudo } => c.auto !== null,
  );

  for (const cardAuto of autoestudos) {
    const alvo = escolherAulaPara(cardAuto, cardsParseados, aulas);
    if (alvo) {
      alvo.autoestudos.push(cardAuto.auto);
    } else {
      const placeholder = getOrCriarPlaceholder(aulas, cardAuto.coluna);
      placeholder.autoestudos.push(cardAuto.auto);
    }
  }

  ordenarPorData(aulas);

  return {
    semana: detectarSemana(root),
    aulas,
    parsedAt: Date.now(),
  };
}

/**
 * Escolhe a aula que "pertence" a este autoestudo. Prioridades:
 *  1. Mesma coluna kanban + aula imediatamente anterior no DOM (padrão antigo — quando o aluno não moveu os cards)
 *  2. Aula ÚNICA com o mesmo eixo do autoestudo (comum quando aluno move autoestudos pra "doing")
 *  3. Múltiplas aulas com mesmo eixo → escolhe a de data mais próxima
 *  4. null → cai no placeholder
 */
function escolherAulaPara(
  cardAuto: CardParseado,
  todos: CardParseado[],
  aulas: Aula[],
): Aula | null {
  // 1. Aula imediatamente anterior no DOM, mesma coluna
  const anteriores = todos
    .filter(
      (c) =>
        c.coluna === cardAuto.coluna &&
        c.aula !== null &&
        c.ordemNoDom < cardAuto.ordemNoDom,
    )
    .sort((a, b) => b.ordemNoDom - a.ordemNoDom);
  const proximaAcima = anteriores[0]?.aula;
  if (proximaAcima) return proximaAcima;

  // 2 e 3. Match por eixo
  const eixo = cardAuto.auto?.eixo;
  if (eixo) {
    const candidatas = aulas.filter((a) => a.eixo === eixo);
    if (candidatas.length === 1) return candidatas[0] ?? null;
    if (candidatas.length > 1) {
      // escolhe a de data mais próxima (compara YYYYMMDD)
      const key = dataToSort(cardAuto.auto?.eixo === null ? null : findFirstDataFromCard(cardAuto));
      return candidatas.reduce<Aula>((melhor, cur) => {
        const dM = Math.abs(parseInt(dataToSort(melhor.data), 10) - parseInt(key, 10));
        const dC = Math.abs(parseInt(dataToSort(cur.data), 10) - parseInt(key, 10));
        return dC < dM ? cur : melhor;
      }, candidatas[0]!);
    }
  }

  return null;
}

function findFirstDataFromCard(_c: CardParseado): string | null {
  // Autoestudos raramente têm data no card do kanban.
  // Se tiver, viria como Aula.data — aqui só temos Autoestudo, e ele não guarda data.
  // Retorna null pra fallback de sort neutro.
  return null;
}

function getOrCriarPlaceholder(aulas: Aula[], coluna: ColunaKanban): Aula {
  const existente = aulas.find(
    (a) => a.id === `placeholder-${coluna}`,
  );
  if (existente) return existente;
  const novo = criarAulaPlaceholder(coluna);
  aulas.push(novo);
  return novo;
}

/** Discriminador de tipo do card: id do wrapper `<div id="XXX-solido">` do header. */
function detectarTipo(card: HTMLElement): TipoCard | null {
  const wrapper = card.querySelector<HTMLElement>(
    '.header-card-activity .header-card-activity-children div[id$="-solido"]',
  );
  if (!wrapper) return null;
  switch (wrapper.id) {
    case 'chalkboard-user-solido':
      return 'aula';
    case 'user-group-solido':
      return 'grupo';
    case 'book-open-reader-solido':
      return 'autoestudo';
    default:
      return null;
  }
}

function parseAula(
  card: HTMLElement,
  tipo: 'aula' | 'grupo',
  coluna: ColunaKanban,
): Aula | null {
  const id = card.dataset.rbdDraggableId;
  const titulo = getTitulo(card);
  if (!id || !titulo) return null;

  const info = extrairInfo(card);

  return {
    id,
    tipo,
    titulo,
    data: info.data,
    hora: info.hora,
    professor: info.professor,
    eixo: info.eixo,
    tag: getTag(card),
    coluna,
    autoestudos: [],
  };
}

function parseAutoestudo(
  card: HTMLElement,
  coluna: ColunaKanban,
): Autoestudo | null {
  const id = card.dataset.rbdDraggableId;
  const titulo = getTitulo(card);
  if (!id || !titulo) return null;

  const info = extrairInfo(card);

  return {
    id,
    titulo,
    eixo: info.eixo,
    professor: info.professor,
    atividadePonderada: card.querySelector('#brake-warning-solido') !== null,
    tag: getTag(card),
    coluna,
    links: [],
  };
}

function getTitulo(card: HTMLElement): string | null {
  const raw = card.querySelector('.title-card-activity')?.textContent;
  if (!raw) return null;
  return raw.replace(/\s+/g, ' ').trim() || null;
}

function getTag(card: HTMLElement): Tag {
  // Preferência: classe semântica hasheada `sc-tagGq`.
  // Fallback: qualquer elemento com class contendo "tagGq".
  const tagEl =
    card.querySelector('[class*="tagGq"] p') ??
    card.querySelector('.sc-tagGq p');
  const text = tagEl?.textContent?.trim();
  return text ? (text as Tag) : null;
}

interface InfoCard {
  data: string | null;
  hora: string | null;
  professor: string | null;
  eixo: Eixo | null;
}

const DATA_HORA_RE = /(\d{2}\/\d{2}\/\d{4})\s*-?\s*(\d{2}:\d{2}h)?/;

function extrairInfo(card: HTMLElement): InfoCard {
  const info: InfoCard = { data: null, hora: null, professor: null, eixo: null };
  const linhas = card.querySelectorAll<HTMLElement>('.info-card-activity-children');
  for (const linha of linhas) {
    const iconWrap = linha.querySelector<HTMLElement>('div[id$="-solido"]');
    const p = linha.querySelector<HTMLElement>('p');
    if (!iconWrap || !p) continue;
    switch (iconWrap.id) {
      case 'clock-solido': {
        const texto = p.textContent?.replace(/\s+/g, ' ').trim() ?? '';
        const m = texto.match(DATA_HORA_RE);
        if (m) {
          info.data = m[1] ?? null;
          info.hora = m[2] ?? null;
        }
        break;
      }
      case 'person-chalkboard-solido': {
        const texto = p.textContent?.replace(/\s+/g, ' ').trim();
        if (texto) info.professor = texto;
        break;
      }
      case 'circle-nodes-solido': {
        // Estrutura: <span>Eixo: </span><span>MTF</span>
        const spans = p.querySelectorAll('span');
        const eixoText = spans[1]?.textContent?.trim();
        if (eixoText) info.eixo = eixoText;
        break;
      }
    }
  }
  return info;
}

function normalizeColuna(raw: string): ColunaKanban | null {
  const lower = raw.toLowerCase();
  if (lower === 'todo' || lower === 'to-do' || lower === 'to_do') return 'toDo';
  if (lower === 'doing') return 'doing';
  if (lower === 'done') return 'done';
  return null;
}

function detectarSemana(root: ParentNode): string | null {
  // Padrão observado nos dumps: título dentro de `.column-title h6` ou similar
  // com texto "Semana XX". Fallback: qualquer elemento cujo texto seja "Semana NN".
  const candidatos = root.querySelectorAll<HTMLElement>('.column-title h6, h6');
  for (const el of candidatos) {
    const texto = el.textContent?.trim() ?? '';
    const m = texto.match(/^Semana\s+(\d{1,2})$/i);
    if (m) return `Semana ${m[1]?.padStart(2, '0')}`;
  }
  // Última tentativa: procurar em toda a árvore por "Semana NN" isolado.
  const walker =
    'ownerDocument' in root && root.ownerDocument
      ? root.ownerDocument.createTreeWalker(root as Node, 4 /* NodeFilter.SHOW_TEXT */)
      : null;
  if (walker) {
    let node: Node | null;
    while ((node = walker.nextNode())) {
      const t = node.nodeValue?.trim() ?? '';
      const m = t.match(/^Semana\s+(\d{1,2})$/i);
      if (m) return `Semana ${m[1]?.padStart(2, '0')}`;
    }
  }
  return null;
}

function criarAulaPlaceholder(coluna: ColunaKanban): Aula {
  return {
    id: `placeholder-${coluna}`,
    tipo: 'aula',
    titulo: PLACEHOLDER_AULA_TITULO,
    data: null,
    hora: null,
    professor: null,
    eixo: null,
    tag: null,
    coluna,
    autoestudos: [],
  };
}

function ordenarPorData(aulas: Aula[]): void {
  aulas.sort((a, b) => {
    const av = dataToSort(a.data);
    const bv = dataToSort(b.data);
    if (av === bv) return 0;
    return av < bv ? -1 : 1;
  });
}

function dataToSort(d: string | null): string {
  // "DD/MM/AAAA" → "AAAAMMDD" pra ordenação lexicográfica correta.
  // Aulas sem data vão pro fim.
  if (!d) return '99999999';
  const [dd, mm, yyyy] = d.split('/');
  if (!dd || !mm || !yyyy) return '99999999';
  return `${yyyy}${mm}${dd}`;
}
