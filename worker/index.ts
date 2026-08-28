/**
 * Cloudflare Worker in front of the static Astro build.
 *
 * Two jobs, in order:
 *  1. Count hits from known AI / search crawlers into the BLOG_CRAWLS
 *     Analytics Engine dataset (see wrangler.toml) so the AuditorsIQ
 *     measurement job can report crawl frequency per bot and per path.
 *     Pure observation: never blocks, never alters the response, never throws.
 *  2. Serve the request from the static assets binding (dist/).
 */

const BOT_RE =
  /(GPTBot|ChatGPT-User|OAI-SearchBot|ClaudeBot|Claude-SearchBot|anthropic-ai|PerplexityBot|Perplexity-User|Google-Extended|Googlebot|Bingbot|bingbot|Amazonbot|Bytespider|CCBot|meta-externalagent)/;

interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> };
  BLOG_CRAWLS?: { writeDataPoint(point: { blobs?: string[]; doubles?: number[]; indexes?: string[] }): void };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      const ua = request.headers.get('user-agent') ?? '';
      const match = BOT_RE.exec(ua);
      if (match && env.BLOG_CRAWLS && typeof env.BLOG_CRAWLS.writeDataPoint === 'function') {
        const bot = match[1];
        const pathname = new URL(request.url).pathname;
        env.BLOG_CRAWLS.writeDataPoint({ blobs: [bot, pathname], doubles: [1], indexes: [bot] });
      }
    } catch {
      // Observation must never affect delivery.
    }
    return env.ASSETS.fetch(request);
  },
};
