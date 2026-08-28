# auditorsiq_blog

The static site behind **https://blog.auditorsiq.com** — the content/search side of AuditorsIQ. Every post ends in a CTA to the free Instagram audit on auditorsiq.com.

## What this is

- **Astro 5**, static output. Posts are markdown files in `src/content/posts/<slug>.md` with typed frontmatter (`src/content.config.ts`).
- **Hub-and-spoke structure.** A post is either a `hub` or a `spoke`; spokes name their hub in frontmatter and share its `cluster`. Internal links (spoke → hub, hub → spokes, spoke ↔ sibling spokes within a cluster, max 3) are rendered from frontmatter by `src/lib/links.ts` — never hand-written into post bodies.
- **CTA copy lives in one component** (`src/components/CtaBlock.astro`). Post bodies never contain "book a call" / "run your audit" copy.
- **Every post cites sources.** The `sources` array in frontmatter is required and non-empty; the build fails otherwise.
- `sitemap-index.xml`, `rss.xml`, `robots.txt` (explicitly allowing AI crawlers), and Article / FAQPage / BreadcrumbList JSON-LD are all generated.
- `functions/_middleware.ts` is a Cloudflare Pages Function that counts hits from known AI/search crawlers into an Analytics Engine dataset (`blog_crawls`); the AuditorsIQ measurement job reads it.

## How it deploys

Cloudflare Pages, connected to this repo. Production branch `main`, build command `npm run build`, output directory `dist`, Node 22 (`.node-version`). Every push to `main` deploys; other branches get preview deployments.

Optional env var on the Pages project: `PUBLIC_CF_BEACON_TOKEN` — when set, the Cloudflare Web Analytics beacon is rendered.

## How posts get here

Hand-written posts can be committed directly. Once the content engine is live, **the AuditorsIQ API's publish job commits approved posts** into `src/content/posts/<slug>.md` via the GitHub API (one commit per post, on `main`), then pings IndexNow. The frontmatter it writes is generated from the content item, so it always validates.

## Local development

```
npm install
npm run dev      # http://localhost:4321
npm run build    # writes dist/
npm run preview
```
