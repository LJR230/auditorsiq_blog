/**
 * Cloudflare Pages Function — runs in front of every request.
 *
 * Counts hits from known AI / search crawlers into the BLOG_CRAWLS
 * Analytics Engine dataset (see wrangler.toml) so the AuditorsIQ
 * measurement job can report crawl frequency per bot and per path.
 * Pure observation: it never blocks, never alters the response, never throws.
 */

const BOT_RE =
  /(GPTBot|ChatGPT-User|OAI-SearchBot|ClaudeBot|Claude-SearchBot|anthropic-ai|PerplexityBot|Perplexity-User|Google-Extended|Googlebot|Bingbot|bingbot|Amazonbot|Bytespider|CCBot|meta-externalagent)/;

export async function onRequest(context: any) {
  try {
    const ua: string = context.request.headers.get('user-agent') ?? '';
    const match = BOT_RE.exec(ua);
    const dataset = context.env?.BLOG_CRAWLS;
    if (match && dataset && typeof dataset.writeDataPoint === 'function') {
      const bot = match[1];
      const pathname = new URL(context.request.url).pathname;
      dataset.writeDataPoint({
        blobs: [bot, pathname],
        doubles: [1],
        indexes: [bot],
      });
    }
  } catch {
    // Observation must never affect delivery.
  }
  return context.next();
}
