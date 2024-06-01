import { vitePlugin as remix } from '@remix-run/dev';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import Unfonts from 'unplugin-fonts/vite';

export default defineConfig({
  plugins: [
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
      },
    }),
    tsconfigPaths(),
    Unfonts({
      custom: {
        families: [
          {
            name: 'Geist',
            src: './node_modules/geist/dist/fonts/geist-sans/*.woff2',
          },
        ],
      },
    }),
  ],
  server: {
    port: parseInt(process.env.PORT || '5173', 10),
  },
});
