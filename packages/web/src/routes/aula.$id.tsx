import { useEffect, useState } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import type { Kanban } from '@adalove-scrapper/shared';
import { loadKanban } from '../lib/storage.ts';
import { AulaList } from '../components/AulaList.tsx';
import { AulaPanel } from '../components/AulaPanel.tsx';

export const Route = createFileRoute('/aula/$id')({
  component: AulaPage,
});

function AulaPage() {
  const { id } = Route.useParams();
  const [kanban, setKanban] = useState<Kanban | null | 'loading'>('loading');

  useEffect(() => {
    setKanban(loadKanban());
  }, []);

  if (kanban === 'loading') {
    return (
      <div className="p-16 text-center font-display text-2xl">carregando…</div>
    );
  }

  if (!kanban) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16 text-center">
        <h1
          className="text-3xl font-display mb-4"
          style={{ color: 'var(--foreground)' }}
        >
          nenhum scrape encontrado
        </h1>
        <p
          className="mb-6 font-mono text-sm"
          style={{ color: 'var(--foreground-muted)' }}
        >
          instale a extension e escaneie o kanban do Adalove primeiro.
        </p>
        <Link
          to="/"
          className="inline-block rounded-md px-6 py-3 font-semibold"
          style={{
            backgroundColor: 'var(--primary)',
            color: 'var(--primary-fg)',
          }}
        >
          voltar
        </Link>
      </div>
    );
  }

  const aula = kanban.aulas.find((a) => a.id === id);
  if (!aula) {
    return (
      <div className="p-16 text-center">
        <p className="font-display text-xl mb-4">aula não encontrada</p>
        <Link
          to="/aula/$id"
          params={{ id: kanban.aulas[0]?.id ?? '' }}
          className="font-mono"
          style={{ color: 'var(--primary)' }}
        >
          voltar pra primeira aula
        </Link>
      </div>
    );
  }

  return (
    <div
      className="grid"
      style={{
        gridTemplateColumns: 'minmax(240px, 320px) 1fr',
        minHeight: 'calc(100vh - 132px)',
      }}
    >
      <AulaList aulas={kanban.aulas} aulaAtivaId={aula.id} />
      <AulaPanel aula={aula} />
    </div>
  );
}
