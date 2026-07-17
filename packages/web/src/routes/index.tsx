import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: LandingPage,
});

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
        <button
          type="button"
          className="rounded-md px-6 py-3 font-semibold cursor-not-allowed opacity-60"
          style={{
            backgroundColor: 'var(--primary)',
            color: 'var(--primary-fg)',
          }}
          disabled
        >
          instalar no Chrome — em breve
        </button>
        <button
          type="button"
          className="rounded-md px-6 py-3 font-semibold cursor-not-allowed opacity-60"
          style={{
            backgroundColor: 'var(--accent)',
            color: 'var(--accent-fg)',
          }}
          disabled
        >
          instalar no Firefox — em breve
        </button>
      </div>

      <p
        className="mt-16 font-mono text-sm"
        style={{ color: 'var(--foreground-muted)' }}
      >
        V1 em desenvolvimento — só landing por enquanto. As rotas /import e
        /aula/:id chegam com o restante do web app.
      </p>
    </div>
  );
}
