import { buildLlmsTxt, listDocs } from '@/lib/docs';
import { GITHUB_URL, siteUrl } from '@/lib/site';

export const dynamic = 'force-static';

export function GET() {
  return new Response(buildLlmsTxt(listDocs(), siteUrl(), GITHUB_URL), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
