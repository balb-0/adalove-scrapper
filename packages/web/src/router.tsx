import { createRouter } from '@tanstack/react-router';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore -- generated on first dev/build
import { routeTree } from './routeTree.gen.ts';

export function getRouter() {
  return createRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreload: 'intent',
  });
}

// Type-safe router register pra as Link components.
declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
