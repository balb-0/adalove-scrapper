import { useEffect, useState } from 'react';
import { encode, type Kanban } from '@adalove-scrapper/shared';

type State =
  | { kind: 'idle' }
  | { kind: 'checking' }
  | { kind: 'ready' }
  | { kind: 'wrong-domain' }
  | { kind: 'scraping'; current: number; total: number; autoestudo?: string }
  | { kind: 'done' }
  | { kind: 'error'; message: string };

const ADALOVE_HOST = 'adalove.inteli.edu.br';

export function Popup() {
  const [state, setState] = useState<State>({ kind: 'checking' });
  const [tabId, setTabId] = useState<number | null>(null);

  useEffect(() => {
    void checarAba();
    const listener = (msg: unknown) => {
      const m = msg as { type?: string; current?: number; total?: number; autoestudo?: string };
      if (m.type === 'scrape-progress' && typeof m.current === 'number' && typeof m.total === 'number') {
        setState({ kind: 'scraping', current: m.current, total: m.total, autoestudo: m.autoestudo });
      }
    };
    browser.runtime.onMessage.addListener(listener);
    return () => browser.runtime.onMessage.removeListener(listener);
  }, []);

  const checarAba = async () => {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id || !tab.url) {
      setState({ kind: 'wrong-domain' });
      return;
    }
    setTabId(tab.id);
    try {
      const url = new URL(tab.url);
      if (url.host !== ADALOVE_HOST) {
        setState({ kind: 'wrong-domain' });
      } else {
        setState({ kind: 'ready' });
      }
    } catch {
      setState({ kind: 'wrong-domain' });
    }
  };

  const iniciar = async () => {
    if (!tabId) return;
    setState({ kind: 'scraping', current: 0, total: 0 });
    try {
      const resp = (await browser.tabs.sendMessage(tabId, { type: 'scrape-kanban' })) as
        | { ok: true; kanban: Kanban }
        | { ok: false; error: string };
      if (!resp.ok) {
        setState({ kind: 'error', message: resp.error });
        return;
      }
      if (resp.kanban.aulas.length === 0) {
        setState({
          kind: 'error',
          message: 'nenhuma aula no kanban — você tá logado no Adalove?',
        });
        return;
      }
      const payload = await encode(resp.kanban);
      const respBg = (await browser.runtime.sendMessage({
        type: 'open-web',
        payload,
      })) as { ok: boolean; error?: string };
      if (!respBg.ok) {
        setState({ kind: 'error', message: respBg.error ?? 'falha ao abrir web app' });
        return;
      }
      setState({ kind: 'done' });
    } catch (e) {
      setState({
        kind: 'error',
        message: e instanceof Error ? e.message : String(e),
      });
    }
  };

  return (
    <div className="popup">
      <div className="header">
        <h1 className="title">adalove-scrapper</h1>
        <span className="version">v0.1</span>
      </div>

      {state.kind === 'checking' && (
        <p className="status">verificando aba…</p>
      )}

      {state.kind === 'wrong-domain' && (
        <>
          <p className="status error">abra o Adalove primeiro</p>
          <button
            type="button"
            className="btn"
            onClick={() =>
              browser.tabs.create({ url: 'https://adalove.inteli.edu.br/' })
            }
          >
            abrir Adalove
          </button>
        </>
      )}

      {state.kind === 'ready' && (
        <>
          <p className="status">pronto — abra o kanban da semana</p>
          <button type="button" className="btn" onClick={iniciar}>
            scrapear essa semana
          </button>
        </>
      )}

      {state.kind === 'scraping' && (
        <div className="progress">
          <p>
            {state.current}/{state.total || '?'} autoestudos
          </p>
          {state.autoestudo && (
            <p style={{ color: 'var(--foreground)', marginTop: 4 }}>
              {state.autoestudo}
            </p>
          )}
          {state.total > 0 && (
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${Math.round((state.current / state.total) * 100)}%` }}
              />
            </div>
          )}
        </div>
      )}

      {state.kind === 'done' && (
        <p className="status ok">
          ✓ pronto! web app abriu numa nova aba.
        </p>
      )}

      {state.kind === 'error' && (
        <>
          <p className="status error">✗ {state.message}</p>
          <button type="button" className="btn" onClick={() => void checarAba()}>
            tentar de novo
          </button>
        </>
      )}

      <div className="footer">
        <a
          href="https://github.com/balb-0/adalove-scrapper"
          target="_blank"
          rel="noopener noreferrer"
        >
          github.com/balb-0/adalove-scrapper
        </a>
      </div>
    </div>
  );
}
