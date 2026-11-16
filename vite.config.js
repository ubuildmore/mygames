import { defineConfig } from 'vite';
import { readdirSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

// Every folder with an index.html is a game page; include them all in builds.
const root = import.meta.dirname;
const games = readdirSync(root, { withFileTypes: true })
  .filter((d) => d.isDirectory() && !d.name.startsWith('.') && !['node_modules', 'dist', 'tests', 'test-results'].includes(d.name))
  .filter((d) => existsSync(resolve(root, d.name, 'index.html')))
  .map((d) => d.name);

export default defineConfig({
  base: './', // relative paths so builds work under ubuildmore.github.io/mygames/
  server: { port: 5173, open: false },
  build: {
    rollupOptions: {
      input: {
        main: resolve(root, 'index.html'),
        ...Object.fromEntries(games.map((g) => [g, resolve(root, g, 'index.html')])),
      },
    },
  },
});
