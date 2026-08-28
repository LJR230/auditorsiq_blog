import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

/**
 * Full-collection feed. Links are canonical post URLs WITHOUT utm params —
 * feed readers are not the funnel; the CTA inside the page carries attribution.
 */
export async function GET(context: APIContext) {
  const posts = (await getCollection('posts', ({ data }) => !data.draft)).sort(
    (a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime()
  );
  return rss({
    title: 'AuditorsIQ blog',
    description:
      'Sourced, specific Instagram marketing guides for med spas and other local businesses.',
    site: context.site ?? 'https://blog.auditorsiq.com',
    trailingSlash: true,
    items: posts.map((p) => ({
      title: p.data.title,
      description: p.data.description,
      pubDate: p.data.publishedAt,
      link: `/posts/${p.id}/`,
      categories: [p.data.cluster, p.data.type],
    })),
    customData: '<language>en-us</language>',
  });
}
