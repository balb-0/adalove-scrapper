import { useEffect, useState } from 'react';
import { createFileRoute, useRouter } from '@tanstack/react-router';
import { decode } from '@adalove-scrapper/shared';
import { saveKanban } from '../lib/storage.ts';

export const Route = createFileRoute('/import')({
  component: ImportPage,
});

function ImportPage() {
  const router = useRouter();
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    const rodar = async () => {
      const hash = window.location.hash.slice(1);
      const params = new URLSearchParams(hash);
      const data = params.get('data');

      if (!data) {
        setErro('nenhum payload no URL (esperado #data=<base64>)');
        return;
      }

      try {
        const kanban = await decode(data);
        saveKanban(kanban);
        const primeiraAula = kanban.aulas[0];
        if (primeiraAula) {
          void router.navigate({ to: `/aula/${primeiraAula.id}` });
        } else {
          setErro('nenhuma aula encontrada no kanban');
        }
      } catch (e) {
        setErro(e instanceof Error ? e.message : 'payload inválido');
      }
    };
    void rodar();
  }, [router]);

  if (erro) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16 text-center">
        <h1
          className="text-3xl font-display mb-4"
          style={{ color: 'var(--danger)' }}
        >
          erro no import
        </h1>
        <p className="mb-6 font-mono" style={{ color: 'var(--foreground-muted)' }}>
          {erro}
        </p>
        <a
          href="/"
          className="inline-block rounded-md px-6 py-3 font-semibold"
          style={{
            backgroundColor: 'var(--primary)',
            color: 'var(--primary-fg)',
          }}
        >
          voltar
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-16 text-center">
      <p className="text-xl font-display" style={{ color: 'var(--foreground-muted)' }}>
        descompactando kanban…
      </p>
    </div>
  );
}
