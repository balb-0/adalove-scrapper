import { defineBackground } from 'wxt/utils/define-background';

declare const __WEB_URL__: string;

export default defineBackground(() => {
  // Recebe do popup: {type:'open-web', payload:string}. Abre o web app em nova aba.
  browser.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg?.type === 'open-web' && typeof msg.payload === 'string') {
      const url = `${__WEB_URL__}/import#data=${msg.payload}`;
      void browser.tabs
        .create({ url })
        .then(() => sendResponse({ ok: true }))
        .catch((e) => sendResponse({ ok: false, error: String(e) }));
      return true; // sinaliza async
    }
    return false;
  });
});
