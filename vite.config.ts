import { fileURLToPath } from 'node:url';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

/** Set by `npm run dev:e2e`, which is all Playwright ever starts. */
const isE2E = process.env.E2E === '1';

/**
 * Swaps the Firestore-backed store and the Firebase entry point for their
 * localStorage stand-ins, so Playwright can drive the whole app without an
 * auth popup or an emulator.
 *
 * It matches on the *resolved* file rather than the import specifier, so it
 * catches './lib/useStore' and '../lib/useStore' alike and cannot be defeated
 * by a future file moving a directory. Active only under E2E=1 — a production
 * build never loads this plugin, so the stand-ins cannot reach real users.
 */
function e2eStandIns(): Plugin {
  const standIn = (name: string) =>
    fileURLToPath(new URL(`./src/lib/${name}.e2e.ts`, import.meta.url));
  const swaps: Record<string, string> = {
    '/src/lib/useStore.ts': standIn('useStore'),
    '/src/lib/firebase.ts': standIn('firebase'),
  };

  return {
    name: 'e2e-stand-ins',
    enforce: 'pre',
    async resolveId(source, importer, options) {
      if (!importer || source.includes('.e2e')) return null;
      const resolved = await this.resolve(source, importer, { ...options, skipSelf: true });
      if (!resolved) return null;
      const hit = Object.keys(swaps).find((suffix) => resolved.id.endsWith(suffix));
      return hit ? swaps[hit] : null;
    },
  };
}

export default defineConfig({
  plugins: [react(), ...(isE2E ? [e2eStandIns()] : [])],
  base: './',
  server: { port: 5173, open: !isE2E },
});
