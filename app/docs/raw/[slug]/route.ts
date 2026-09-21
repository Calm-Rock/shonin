import { docAsMarkdown, getDoc, listDocs } from '@/lib/docs';

export const dynamic = 'force-static';

export function generateStaticParams() {
  return listDocs().map((doc) => ({ slug: doc.slug }));
}

export async function GET(_req: Request, ctx: RouteContext<'/docs/raw/[slug]'>) {
  const { slug } = await ctx.params;
  const doc = getDoc(slug);
  if (!doc) return new Response('Not found', { status: 404 });

  return new Response(docAsMarkdown(doc), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
}
