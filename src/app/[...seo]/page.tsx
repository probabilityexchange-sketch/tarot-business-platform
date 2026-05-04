import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const NEXTJS_ROUTES = new Set([
  'about', 'services', 'contact', 'booking', 'blog', 'courses',
  'readings', 'admin', 'funnel', 'api', 'sitemap',
]);

export async function GET(
  request: Request,
  { params }: { params: { seo: string[] } }
) {
  const seoPath = params.seo.join('/');

  const first = seoPath.split('/')[0];
  if (NEXTJS_ROUTES.has(first)) {
    return NextResponse.next();
  }

  // Try multiple possible public/ paths - Firebase App Hosting runs from build dir
  const possibleRoots = [
    process.cwd(),
    join(process.cwd(), '..'),
  ];

  const candidates = [seoPath + '.html', seoPath];

  for (const root of possibleRoots) {
    for (const file of candidates) {
      const filePath = join(root, 'public', file);
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
          // continue
        }
      }
    }
  }

  return NextResponse.next();
}
