import { useState } from 'react';

interface Props {
  prompt: string;
}

export function PromptTextarea({ prompt }: Props) {
  const [texto, setTexto] = useState(prompt);
  const [copiado, setCopiado] = useState(false);

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      window.setTimeout(() => setCopiado(false), 1500);
    } catch {
      // silêncio — se clipboard API falhar, o user pode selecionar manualmente
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3
          className="font-display text-2xl"
          style={{ color: 'var(--foreground)' }}
        >
          mega-prompt
        </h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={copiar}
            className="rounded-md px-6 py-3 font-semibold transition-colors"
            style={{
              backgroundColor: copiado ? 'var(--success)' : 'var(--primary)',
              color: 'var(--primary-fg)',
            }}
          >
            {copiado ? '✓ copiado!' : 'copiar tudo'}
          </button>
          <a
            href="https://notebooklm.google.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md px-6 py-3 font-semibold border transition-colors hover:bg-[var(--surface-muted)]"
            style={{
              borderColor: 'var(--border)',
              color: 'var(--foreground)',
            }}
          >
            abrir NotebookLM ↗
          </a>
        </div>
      </div>
      <textarea
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        className="w-full rounded-md border p-4 font-body text-base leading-relaxed resize-y"
        style={{
          borderColor: 'var(--border)',
          backgroundColor: 'var(--surface-elevated)',
          color: 'var(--foreground)',
          minHeight: '400px',
        }}
      />
    </div>
  );
}
