import type { ReactNode } from 'react';
import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
  Link,
} from '@tanstack/react-router';
import { ThemeToggle } from '../components/ThemeToggle.tsx';

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'adalove-scrapper' },
      {
        name: 'description',
        content:
          'Preparador de aula do Inteli — pega os autoestudos, monta o mega-prompt, cola no NotebookLM.',
      },
    ],
    links: [{ rel: 'icon', href: '/favicon.png' }],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    </RootDocument>
  );
}

function Header() {
  return (
    <header
      className="border-b px-6 py-4 flex items-center justify-between"
      style={{ borderColor: 'var(--border)' }}
    >
      <Link
        to="/"
        className="text-2xl font-display"
        style={{ color: 'var(--primary)' }}
      >
        adalove-scrapper
      </Link>
      <div className="flex items-center gap-3">
        <a
          href="https://github.com/balb-0/adalove-scrapper"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm hover:underline"
          style={{ color: 'var(--foreground-muted)' }}
        >
          github
        </a>
        <ThemeToggle />
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer
      className="border-t px-6 py-4 text-sm"
      style={{
        borderColor: 'var(--border)',
        color: 'var(--foreground-muted)',
      }}
    >
      <p className="font-mono">
        MIT · open source · sem tracking · sem backend
      </p>
    </footer>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html suppressHydrationWarning>
      <head>
        <HeadContent />
        <script
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var t = localStorage.getItem('adalove-scrapper:theme');
                  if (t === 'light' || t === 'dark') {
                    document.documentElement.classList.add(t);
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
