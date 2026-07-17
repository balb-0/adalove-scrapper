export type TipoCard = 'aula' | 'grupo' | 'autoestudo';

/** Eixos observados no Inteli. `string` mantém tolerância a novos códigos. */
export type Eixo = 'MTF' | 'UEX' | 'COM' | 'NEG' | (string & {});

export type ColunaKanban = 'toDo' | 'doing' | 'done';

export type Tag = 'Prova' | 'Em sala' | 'Semana' | (string & {}) | null;

export interface Link {
  text: string;
  url: string;
}

export interface Autoestudo {
  id: string; // data-rbd-draggable-id
  titulo: string;
  eixo: Eixo | null;
  professor: string | null;
  atividadePonderada: boolean;
  tag: Tag;
  coluna: ColunaKanban;
  links: Link[]; // preenchido pelo scraper após abrir o modal
}

export interface Aula {
  id: string;
  tipo: 'aula' | 'grupo';
  titulo: string;
  data: string | null; // "DD/MM/AAAA"
  hora: string | null; // "HH:MMh"
  professor: string | null;
  eixo: Eixo | null;
  tag: Tag;
  coluna: ColunaKanban;
  autoestudos: Autoestudo[];
}

export interface Kanban {
  semana: string | null; // "Semana 01" quando detectável
  aulas: Aula[];
  parsedAt: number; // epoch ms
}

export const PLACEHOLDER_AULA_TITULO = 'Sem aula associada';
