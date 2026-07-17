import type { Autoestudo } from '@adalove-scrapper/shared';

interface Props {
  autoestudo: Autoestudo;
}

export function AutoestudoItem({ autoestudo }: Props) {
  return (
    <li
      className="rounded-md border p-4"
      style={{
        borderColor: 'var(--border)',
        backgroundColor: 'var(--surface-elevated)',
      }}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3
          className="font-display text-lg leading-tight"
          style={{ color: 'var(--foreground)' }}
        >
          {autoestudo.titulo}
        </h3>
        {autoestudo.eixo && (
          <span
            className="text-xs font-mono px-2 py-0.5 rounded shrink-0"
            style={{
              backgroundColor: 'var(--accent)',
              color: 'var(--accent-fg)',
            }}
          >
            {autoestudo.eixo}
          </span>
        )}
      </div>
      {autoestudo.atividadePonderada && (
        <p
          className="text-xs font-mono mb-2"
          style={{ color: 'var(--danger)' }}
        >
          ⚠ atividade ponderada
        </p>
      )}
      {autoestudo.links.length === 0 ? (
        <p
          className="text-sm font-mono italic"
          style={{ color: 'var(--foreground-muted)' }}
        >
          nenhum link coletado
        </p>
      ) : (
        <ul className="space-y-1">
          {autoestudo.links.map((link, i) => (
            <li key={`${link.url}-${i}`} className="text-sm">
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono hover:underline break-all"
                style={{ color: 'var(--primary)' }}
              >
                {link.text || link.url}
              </a>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}
