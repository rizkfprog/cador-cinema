import { defineConfig } from 'vite';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));

export const PAGES = [
  'index',
  'methode-adam-boards',
  'point-de-depart',
  'plan-de-marche',
  'suivi-mensuel',
  'automatisation',
  'qui-je-suis',
  'mentions-legales',
  'confidentialite',
];

/**
 * Fragments HTML partagés, résolus au build :
 *   <!-- @include chrome.html act="Acte I · La jauge" -->
 * Les attributs remplacent les {{variables}} du fragment.
 */
function partials() {
  const dir = resolve(root, 'partials');
  const re = /<!--\s*@include\s+([\w.-]+)((?:\s+\w+="[^"]*")*)\s*-->/g;
  return {
    name: 'cador-partials',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        // préversion : pas d'indexation (le site de référence reste cador-gp.com)
        if (process.env.CADOR_PREVIEW) html = html.replace('<head>', '<head>\n  <meta name="robots" content="noindex, nofollow">');
        return html.replace(re, (_, file, attrs) => {
          const vars = {};
          attrs.replace(/(\w+)="([^"]*)"/g, (__, k, v) => (vars[k] = v));
          return readFileSync(resolve(dir, file), 'utf8').replace(/\{\{(\w+)\}\}/g, (__, k) => vars[k] ?? '');
        });
      },
    },
    configureServer(server) {
      server.watcher.add(dir);
      server.watcher.on('change', (f) => {
        if (f.startsWith(dir)) server.ws.send({ type: 'full-reload' });
      });
    },
  };
}

export default defineConfig({
  base: './',
  plugins: [partials()],
  build: {
    target: 'es2020',
    assetsInlineLimit: 0,
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      input: Object.fromEntries(PAGES.map((p) => [p, resolve(root, `${p}.html`)])),
    },
  },
  server: { port: 5173, host: true },
});
