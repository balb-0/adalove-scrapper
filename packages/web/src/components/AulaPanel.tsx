import { useMemo } from 'react';
import type { Aula } from '@adalove-scrapper/shared';
import { buildMegaPrompt } from '@adalove-scrapper/shared';
import { AutoestudoItem } from './AutoestudoItem.tsx';
import { PromptTextarea } from './PromptTextarea.tsx';

interface Props {
  aula: Aula;
}

export function AulaPanel({ aula }: Props) {
  const prompt = useMemo(() => buildMegaPrompt(aula), [aula]);

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8">
      <header>
        <div className="flex items-center gap-3 mb-2">
          {aula.tag && (
            <span
              className="text-xs font-mono px-2 py-1 rounded"
              style={{
                backgroundColor:
                  aula.tag === 'Prova'
                    ? 'var(--danger-soft)'
                    : 'var(--primary-soft)',
                color: 'var(--danger-fg)',
              }}
            >
              {aula.tag}
            </span>
          )}
          {aula.eixo && (
            <span
              className="text-xs font-mono"
              style={{ color: 'var(--foreground-muted)' }}
            >
              Eixo {aula.eixo}
            </span>
          )}
        </div>
        <h1
          className="text-4xl font-display leading-tight mb-3"
          style={{ color: 'var(--foreground)' }}
        >
          {aula.titulo}
        </h1>
        <div
          className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-sm"
          style={{ color: 'var(--foreground-muted)' }}
        >
          {aula.data && <span>{aula.data}</span>}
          {aula.hora && <span>{aula.hora}</span>}
          {aula.professor && <span>{aula.professor}</span>}
        </div>
      </header>

      <section>
        <h2
          className="font-display text-2xl mb-4"
          style={{ color: 'var(--foreground)' }}
        >
          autoestudos ({aula.autoestudos.length})
        </h2>
        {aula.autoestudos.length === 0 ? (
          <p
            className="font-mono text-sm"
            style={{ color: 'var(--foreground-muted)' }}
          >
            nenhum autoestudo pra essa aula
          </p>
        ) : (
          <ul className="space-y-3">
            {aula.autoestudos.map((a) => (
              <AutoestudoItem key={a.id} autoestudo={a} />
            ))}
          </ul>
        )}
      </section>

      <section>
        <PromptTextarea prompt={prompt} />
      </section>
    </div>
  );
}
