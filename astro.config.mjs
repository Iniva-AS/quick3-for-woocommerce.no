// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  site: 'https://quick3-for-woocommerce.no',
  i18n: {
    defaultLocale: 'no',
    locales: ['no', 'en'],
    routing: {
      prefixDefaultLocale: true
    }
  },
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
    server: {
      allowedHosts: ['host.docker.internal']
    }
  }
});