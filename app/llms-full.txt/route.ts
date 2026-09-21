import { buildLlmsFull, listDocs } from '@/lib/docs';
import { siteUrl } from '@/lib/site';

export const dynamic = 'force-static';

export function GET() {
  return new Response(buildLlmsFull(listDocs(), siteUrl()), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
