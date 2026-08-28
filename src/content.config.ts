import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Frontmatter contract for every post. The AuditorsIQ API's publish job
 * generates this shape from a content item; Astro's build fails loudly on
 * any drift, which is the point — the blog can never publish a post that
 * lacks sources, a cluster, or (for spokes) a hub.
 *
 * With the glob loader the entry id is the file name without extension;
 * pages/posts/[slug].astro asserts frontmatter `slug` === entry id.
 */
const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string().min(10).max(90),
    description: z.string().min(50).max(200),          // meta description + RSS summary
    slug: z.string().regex(/^[a-z0-9-]+$/),
    type: z.enum(['hub', 'spoke']),
    cluster: z.string().regex(/^[a-z0-9-]+$/),
    hub: z.string().regex(/^[a-z0-9-]+$/).nullable(),   // hub slug; null for hubs
    intent: z.enum(['informational', 'commercial', 'comparison', 'transactional']),
    targetQuery: z.string(),
    vertical: z.string().nullable().default(null),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    author: z.string().default('AuditorsIQ'),
    cta: z.object({
      campaign: z.string(),                              // utm_campaign
      label: z.string().default('Run your free Instagram audit'),
    }),
    sources: z.array(z.object({
      title: z.string(),
      url: z.string().url(),
      publisher: z.string().nullable().default(null),
      publishedAt: z.string().nullable().default(null),
    })).min(1),                                          // non-empty, enforced at build too
    faq: z.array(z.object({ q: z.string(), a: z.string() })).default([]),  // → FAQPage JSON-LD
    // Optional explicit cross-links (spoke↔spoke within the cluster, max 3);
    // when absent the internal-link module picks siblings by cluster.
    related: z.array(z.string()).max(3).default([]),
    draft: z.boolean().default(false),
    contentItemId: z.string().optional(),                // Mongo _id, for round-tripping
  }),
});

export const collections = { posts };
