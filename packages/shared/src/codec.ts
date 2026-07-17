import type { Kanban } from './types.ts';

/**
 * Codec pro payload que a extension manda pro web app via URL fragment.
 * Pipeline: Kanban → JSON → gzip → base64url.
 *
 * Usa CompressionStream/DecompressionStream (Web API, disponível em Chrome/Firefox/Node 18+).
 */

const utf8Encoder = new TextEncoder();
const utf8Decoder = new TextDecoder();

export async function encode(kanban: Kanban): Promise<string> {
  const json = JSON.stringify(kanban);
  const compressed = await gzip(utf8Encoder.encode(json));
  return base64urlEncode(compressed);
}

export async function decode(payload: string): Promise<Kanban> {
  const compressed = base64urlDecode(payload);
  const raw = await gunzip(compressed);
  const json = utf8Decoder.decode(raw);
  const parsed = JSON.parse(json) as unknown;
  assertIsKanban(parsed);
  return parsed;
}

function assertIsKanban(v: unknown): asserts v is Kanban {
  if (
    typeof v !== 'object' ||
    v === null ||
    !Array.isArray((v as { aulas?: unknown }).aulas) ||
    typeof (v as { parsedAt?: unknown }).parsedAt !== 'number'
  ) {
    throw new Error('payload não é um Kanban válido');
  }
}

async function gzip(bytes: Uint8Array): Promise<Uint8Array> {
  return pipeThrough(bytes, new CompressionStream('gzip'));
}

async function gunzip(bytes: Uint8Array): Promise<Uint8Array> {
  return pipeThrough(bytes, new DecompressionStream('gzip'));
}

async function pipeThrough(
  bytes: Uint8Array,
  transform: CompressionStream | DecompressionStream,
): Promise<Uint8Array> {
  const source = new ReadableStream<BufferSource>({
    start(controller) {
      controller.enqueue(bytes.slice());
      controller.close();
    },
  });
  const piped = source.pipeThrough(transform);
  return new Uint8Array(await new Response(piped).arrayBuffer());
}

function base64urlEncode(bytes: Uint8Array): string {
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64urlDecode(s: string): Uint8Array {
  const padded = s.replace(/-/g, '+').replace(/_/g, '/');
  const padLen = (4 - (padded.length % 4)) % 4;
  const bin = atob(padded + '='.repeat(padLen));
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
