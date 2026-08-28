import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://blog.auditorsiq.com',
  trailingSlash: 'always',
  output: 'static',
  build: { format: 'directory' },
  integrations: [
    sitemap({
      changefreq: 'weekly',
      // Keep the error page out of the sitemap; drafts never build in prod.
      filter: (page) => !page.endsWith('/404/'),
    }),
  ],
});
