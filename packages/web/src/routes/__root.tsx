import { Outlet, createRootRoute, Link } from '@tanstack/react-router';
import { ThemeToggle } from '../components/ThemeToggle.tsx';

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
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

