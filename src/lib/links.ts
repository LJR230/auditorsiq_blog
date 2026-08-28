import type { CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'posts'>;

export interface PostLinks {
  /** The hub this spoke belongs to (null for hubs). */
  hub: Post | null;
  /** Every spoke in the cluster (hubs only; empty for spokes). */
  spokes: Post[];
  /** Sibling spokes in the same cluster, max 3 (spokes only). */
  related: Post[];
}

const byPublishedAt = (a: Post, b: Post) =>
  b.data.publishedAt.getTime() - a.data.publishedAt.getTime();

/**
 * Deterministic internal links derived from frontmatter only.
 *
 * Rules:
 *  - spokes link up to their hub (rendered above the fold and in the footer block)
 *  - hubs list every spoke in their cluster
 *  - spokes cross-link only within their cluster, max 3 — explicit `related`
 *    slugs first, then the newest siblings
 *  - no cross-cluster links except via the hub
 */
export function linksFor(post: Post, all: Post[]): PostLinks {
  const inCluster = all.filter(
    (p) => p.data.cluster === post.data.cluster && p.id !== post.id && !p.data.draft
  );

  if (post.data.type === 'hub') {
    return {
      hub: null,
      spokes: inCluster.filter((p) => p.data.type === 'spoke').sort(byPublishedAt),
      related: [],
    };
  }

  const hub = all.find((p) => p.id === post.data.hub) ?? null;
  const explicit = post.data.related
    .map((slug) => all.find((p) => p.id === slug))
    .filter((p): p is Post => Boolean(p) && p!.data.cluster === post.data.cluster);
  const siblings = inCluster
    .filter((p) => p.data.type === 'spoke' && !explicit.includes(p))
    .sort(byPublishedAt);
  const related = [...explicit, ...siblings].slice(0, 3);

  return { hub, spokes: [], related };
}

/** Canonical path for a post — always trailing-slashed to match astro.config. */
export function postPath(post: Post): string {
  return `/posts/${post.id}/`;
}

export function clusterPath(cluster: string): string {
  return `/clusters/${cluster}/`;
}

/** Human label for a cluster key, e.g. 'med-spa-instagram' → 'Med Spa Instagram'. */
export function clusterLabel(cluster: string): string {
  return cluster
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
