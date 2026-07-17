import { Link } from '@tanstack/react-router';
import type { Aula } from '@adalove-scrapper/shared';

interface Props {
  aulas: Aula[];
  aulaAtivaId: string;
}

export function AulaList({ aulas, aulaAtivaId }: Props) {
  return (
    <aside
      className="border-r overflow-y-auto py-4"
      style={{
        borderColor: 'var(--border)',
        backgroundColor: 'var(--surface-elevated)',
      }}
    >
      <div className="px-4 mb-3">
        <p
          className="text-xs font-mono uppercase tracking-wide"
          style={{ color: 'var(--foreground-muted)' }}
        >
          aulas ({aulas.length})
        </p>
      </div>
      <ul>
        {aulas.map((aula) => {
          const ativa = aula.id === aulaAtivaId;
          return (
            <li key={aula.id}>
              <Link
                to="/aula/$id"
                params={{ id: aula.id }}
                className="block px-4 py-3 border-l-4 hover:bg-[var(--surface-muted)] transition-colors"
                style={{
                  borderLeftColor: ativa ? 'var(--primary)' : 'transparent',
                  backgroundColor: ativa ? 'var(--surface-muted)' : 'transparent',
                }}
              >
                <div
                  className="text-xs font-mono mb-1"
                  style={{ color: 'var(--foreground-muted)' }}
                >
                  {aula.data ?? 'sem data'}
                  {aula.eixo ? ` · ${aula.eixo}` : ''}
                </div>
                <div
                  className="font-display leading-tight"
                  style={{
                    color: ativa ? 'var(--primary)' : 'var(--foreground)',
                  }}
                >
                  {aula.titulo}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
