import { defineContentScript } from 'wxt/utils/define-content-script';
import { parseKanban, type Kanban, type Link } from '@adalove-scrapper/shared';

export default defineContentScript({
  matches: ['https://adalove.inteli.edu.br/*'],
  runAt: 'document_idle',
  main() {
    // Content script escuta mensagens do popup e executa o scrape.
    browser.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
      if (msg?.type === 'scrape-kanban') {
        void scrapear((event) => {
          void browser.runtime.sendMessage({ type: 'scrape-progress', ...event });
        })
          .then((kanban) => sendResponse({ ok: true, kanban }))
          .catch((e) =>
            sendResponse({ ok: false, error: e instanceof Error ? e.message : String(e) }),
          );
        return true;
      }
      return false;
    });
  },
});

interface ProgressEvent {
  current: number;
  total: number;
  autoestudo?: string;
}

async function scrapear(
  reportarProgresso: (e: ProgressEvent) => void,
): Promise<Kanban> {
  // 1. Parse do DOM atual (sem links).
  const kanban = parseKanban(document);

  // 2. Coleta todos os autoestudos que precisam de link.
  const alvos: Array<{
    aulaIndex: number;
    autoIndex: number;
    cardId: string;
  }> = [];
  kanban.aulas.forEach((aula, aulaIndex) => {
    aula.autoestudos.forEach((auto, autoIndex) => {
      alvos.push({ aulaIndex, autoIndex, cardId: auto.id });
    });
  });

  const total = alvos.length;

  // 3. Sequencial: abre modal, coleta, fecha, próximo.
  for (let i = 0; i < alvos.length; i++) {
    const alvo = alvos[i]!;
    const card = document.querySelector<HTMLElement>(
      `[data-rbd-draggable-id="${alvo.cardId}"][role="button"]`,
    );
    reportarProgresso({
      current: i + 1,
      total,
      autoestudo: kanban.aulas[alvo.aulaIndex]?.autoestudos[alvo.autoIndex]?.titulo,
    });

    if (!card) continue;
    const links = await extrairLinksDoCard(card);
    const auto = kanban.aulas[alvo.aulaIndex]?.autoestudos[alvo.autoIndex];
    if (auto) auto.links = links;
  }

  return kanban;
}

async function extrairLinksDoCard(card: HTMLElement): Promise<Link[]> {
  for (let tentativa = 0; tentativa < 3; tentativa++) {
    await forceClick(card);
    const modal = await esperarModal(4000);
    if (!modal) continue;

    const links = await coletarLinksDoModal(modal);
    await fecharModal(modal);
    return links;
  }
  return [];
}

async function forceClick(el: HTMLElement): Promise<void> {
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  await sleep(300);
  el.focus();

  const rect = el.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;

  for (const evt of ['mousedown', 'mouseup', 'click'] as const) {
    el.dispatchEvent(
      new MouseEvent(evt, {
        view: window,
        bubbles: true,
        cancelable: true,
        clientX: x,
        clientY: y,
        buttons: 1,
      }),
    );
  }

  for (const evt of ['keydown', 'keyup'] as const) {
    el.dispatchEvent(
      new KeyboardEvent(evt, {
        key: 'Enter',
        code: 'Enter',
        keyCode: 13,
        bubbles: true,
      }),
    );
  }
}

async function esperarModal(timeoutMs: number): Promise<HTMLElement | null> {
  const iniciou = Date.now();
  while (Date.now() - iniciou < timeoutMs) {
    const modal = document.querySelector<HTMLElement>(
      '[role="dialog"], .MuiDialog-root',
    );
    if (modal) return modal;
    await sleep(200);
  }
  return null;
}

async function coletarLinksDoModal(modal: HTMLElement): Promise<Link[]> {
  const links: Link[] = [];
  const seen = new Set<string>();

  const coletarAgora = () => {
    for (const a of Array.from(modal.querySelectorAll<HTMLAnchorElement>('a[href^="http"]'))) {
      if (a.href.includes('inteli.edu.br')) continue;
      if (seen.has(a.href)) continue;
      seen.add(a.href);
      links.push({ text: a.innerText.trim(), url: a.href });
    }
  };

  const abas = Array.from(modal.querySelectorAll<HTMLButtonElement>('button')).filter(
    (b) => {
      const txt = b.innerText.trim().toLowerCase();
      return (
        txt.length > 2 &&
        txt.length < 24 &&
        !['fechar', 'ver mais', 'cancelar', 'entendi', 'mudar', 'x'].includes(txt)
      );
    },
  );

  // Coleta o que já tá visível (aba padrão do modal).
  coletarAgora();

  if (abas.length > 1) {
    for (const aba of abas) {
      aba.click();
      // React precisa pintar o conteúdo da nova aba antes da gente ler.
      // 300ms é folgado; abaixo disso vi coletas vazias em cards com abas.
      await sleep(300);
      coletarAgora();
    }
  }

  return links;
}

async function fecharModal(modal: HTMLElement): Promise<void> {
  const btn =
    modal.querySelector<HTMLButtonElement>('button[aria-label="close"]') ??
    modal.querySelector<HTMLButtonElement>('button[class*="close"]');
  if (btn) btn.click();
  else window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

  const iniciou = Date.now();
  while (Date.now() - iniciou < 3000) {
    if (!document.querySelector('[role="dialog"], .MuiDialog-root')) return;
    await sleep(150);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
