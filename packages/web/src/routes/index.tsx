import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: LandingPage,
});

const CHROME_ZIP =
  'https://github.com/balb-0/adalove-scrapper/releases/download/v0.1/extension-0.1.0-chrome.zip';
const FIREFOX_ZIP =
  'https://github.com/balb-0/adalove-scrapper/releases/download/v0.1/extension-0.1.0-firefox.zip';
const README_DEV_URL =
  'https://github.com/balb-0/adalove-scrapper#usando-antes-da-publicação-nas-stores';

function LandingPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <h1
        className="text-5xl font-display mb-4"
        style={{ color: 'var(--primary)' }}
      >
        adalove-scrapper
      </h1>
      <p className="text-xl mb-8" style={{ color: 'var(--foreground-muted)' }}>
        Preparador de aula do Inteli. Pega os autoestudos da sua próxima aula,
        monta o mega-prompt pronto pro NotebookLM, você cola e estuda.
      </p>

      <div
        className="rounded-lg border p-6 mb-8"
        style={{
          borderColor: 'var(--border)',
          backgroundColor: 'var(--surface-elevated)',
        }}
      >
        <p className="mb-4 font-semibold">como usar</p>
        <ol
          className="list-decimal list-inside space-y-2"
          style={{ color: 'var(--foreground-muted)' }}
        >
          <li>instale a extension (Chrome ou Firefox — links abaixo)</li>
          <li>abra o kanban da semana no Adalove</li>
          <li>clique no ícone da extension → "scrapear essa semana"</li>
          <li>cola o mega-prompt no NotebookLM. fim.</li>
        </ol>
      </div>

      <div className="flex gap-4 flex-wrap">
        <a
          href={CHROME_ZIP}
          className="rounded-md px-6 py-3 font-semibold transition-colors"
          style={{
            backgroundColor: 'var(--primary)',
            color: 'var(--primary-fg)',
          }}
        >
          baixar pro Chrome
        </a>
        <a
          href={FIREFOX_ZIP}
          className="rounded-md px-6 py-3 font-semibold transition-colors"
          style={{
            backgroundColor: 'var(--accent)',
            color: 'var(--accent-fg)',
          }}
        >
          baixar pro Firefox
        </a>
      </div>

      <p
        className="mt-6 font-mono text-sm"
        style={{ color: 'var(--foreground-muted)' }}
      >
        as stores ainda estão revisando. enquanto isso,{' '}
        <a
          href={README_DEV_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
          style={{ color: 'var(--primary)' }}
        >
          instala em modo dev
        </a>{' '}
        — leva 30 segundos.
      </p>
    </div>
  );
}
