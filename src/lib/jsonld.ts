import type { Post } from './links';

const SITE = 'https://blog.auditorsiq.com';
const ORG = {
  '@type': 'Organization',
  name: 'AuditorsIQ',
  url: 'https://auditorsiq.com',
};

export function articleJsonLd(post: Post, canonicalUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.data.title,
    description: post.data.description,
    datePublished: post.data.publishedAt.toISOString(),
    dateModified: (post.data.updatedAt ?? post.data.publishedAt).toISOString(),
    author: { ...ORG, name: post.data.author },
    publisher: ORG,
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonicalUrl },
    citation: post.data.sources.map((s) => ({
      '@type': 'CreativeWork',
      name: s.title,
      url: s.url,
      ...(s.publisher ? { publisher: { '@type': 'Organization', name: s.publisher } } : {}),
    })),
    about: post.data.targetQuery,
  };
}

export function faqJsonLd(post: Post) {
  if (!post.data.faq.length) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: post.data.faq.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

export function breadcrumbJsonLd(
  post: Post,
  hub: Post | null,
  clusterLabel: string,
  clusterUrl: string,
  canonicalUrl: string
) {
  const items = [
    { name: 'Home', item: `${SITE}/` },
    { name: clusterLabel, item: clusterUrl },
  ];
  if (post.data.type === 'spoke' && hub) {
    items.push({ name: hub.data.title, item: `${SITE}/posts/${hub.id}/` });
  }
  items.push({ name: post.data.title, item: canonicalUrl });
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: it.item,
    })),
  };
}
