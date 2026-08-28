/**
 * Every CTA on the blog points at the existing homepage flow, tagged so the
 * audit request created there can attribute back to the post.
 * (utm_campaign = cluster, post = slug; the site captures both at handle submission.)
 */
export const SITE_ORIGIN = 'https://auditorsiq.com';
export const AUDIT_PATH = '/social-audit';

export function buildCtaHref(cluster: string, slug: string): string {
  const params = new URLSearchParams({
    utm_source: 'blog',
    utm_medium: 'organic',
    utm_campaign: cluster,
    post: slug,
  });
  return `${SITE_ORIGIN}${AUDIT_PATH}?${params.toString()}`;
}

/** Non-post surfaces (header/footer) — still attributed, no post. */
export function buildSiteHref(placement: string): string {
  const params = new URLSearchParams({
    utm_source: 'blog',
    utm_medium: 'organic',
    utm_campaign: placement,
  });
  return `${SITE_ORIGIN}${AUDIT_PATH}?${params.toString()}`;
}
