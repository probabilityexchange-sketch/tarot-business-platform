import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// List of known top-level Next.js routes that should NOT be served from public/
const NEXTJS_ROUTES = new Set([
  'about', 'services', 'contact', 'booking', 'blog', 'courses',
  'readings', 'admin', 'funnel', 'api', 'sitemap', 'page',
]);

export async function GET(
  request: Request,
  { params }: { params: { seo: string[] } }
) {
  const seoPath = params.seo.join('/');

  // Block known Next.js routes so they fall through to their own pages
  const first = seoPath.split('/')[0];
  if (NEXTJS_ROUTES.has(first)) {
    return NextResponse.next();
  }

  // Try .html, then bare path
  const candidates = [seoPath + '.html', seoPath];
  for (const file of candidates) {
    const filePath = join(process.cwd(), 'public', file);
    if (existsSync(filePath)) {
      try {
        const content = await readFile(filePath, 'utf-8');
        return new NextResponse(content, {
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'public, max-age=3600',
          },
        });
      } catch {
        // Fall through to 404
      }
    }
  }

  return new NextResponse('Not Found', { status: 404 });
}
