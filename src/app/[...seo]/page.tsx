import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// Debug mode - set to true temporarily to see what's happening
const DEBUG = false;

const NEXTJS_ROUTES = new Set([
  'about', 'services', 'contact', 'booking', 'blog', 'courses',
  'readings', 'admin', 'funnel', 'api', 'sitemap',
]);

export async function GET(
  request: Request,
  { params }: { params: { seo: string[] } }
) {
  const seoPath = params.seo.join('/');

  if (DEBUG) {
    console.error('DEBUG catch-all:', seoPath, 'cwd:', process.cwd());
  }

  const first = seoPath.split('/')[0];
  if (NEXTJS_ROUTES.has(first)) {
    if (DEBUG) console.error('Blocked by NEXTJS_ROUTES:', first);
    return NextResponse.next();
  }

  const candidates = [seoPath + '.html', seoPath];
  for (const file of candidates) {
    const filePath = join(process.cwd(), 'public', file);
    if (DEBUG) console.error('Checking:', filePath, existsSync(filePath));
    if (existsSync(filePath)) {
      try {
        const content = await readFile(filePath, 'utf-8');
        if (DEBUG) console.error('Serving:', file);
        return new NextResponse(content, {
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'public, max-age=3600',
          },
        });
      } catch (e) {
        if (DEBUG) console.error('readFile error:', e);
      }
    }
  }

  if (DEBUG) console.error('Not found, falling through');
  return NextResponse.next();
}
