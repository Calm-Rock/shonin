import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  return [
    { url: base, changeFrequency: 'monthly', priority: 1 },
    { url: `${base}/docs`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/llms.txt`, changeFrequency: 'weekly', priority: 0.3 },
  ];
}
