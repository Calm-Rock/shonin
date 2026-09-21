import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/site';

// The approve and decision confirm pages carry one-time tokens in their URLs, so they must never be crawled.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/dashboard', '/approve/', '/decisions/', '/auth/'],
    },
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
