import { defineConfig } from 'wxt';

// URL do web app pra onde a extension manda o payload.
// Em dev, aponta pra localhost:3000; em prod, o build passa VITE_WEB_URL=https://adalove-scrapper.vercel.app.
const DEV_WEB_URL = 'http://localhost:3000';

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'adalove-scrapper',
    description: 'Preparador de aula do Inteli — scrape os autoestudos, cole no NotebookLM',
    permissions: ['activeTab', 'storage', 'tabs'],
    host_permissions: ['https://adalove.inteli.edu.br/*'],
    action: {
      default_title: 'adalove-scrapper',
    },
    browser_specific_settings: {
      gecko: {
        id: 'adalove-scrapper@balb-0',
      },
    },
  },
  vite: () => ({
    define: {
      __WEB_URL__: JSON.stringify(process.env.VITE_WEB_URL ?? DEV_WEB_URL),
    },
  }),
});
