import { NextResponse } from 'next/server';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

// Force dynamic - don't pre-render this route
export const dynamic = 'force-dynamic';

const NEXTJS_ROUTES = new Set([
  'about', 'services', 'contact', 'booking', 'blog', 'courses',
  'readings', 'admin', 'funnel', 'api', 'sitemap',
]);

// Cache the file listing at module load time
function getPublicFiles(dir: string, results: string[] = []): string[] {
  const entries = require('fs').readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      getPublicFiles(full, results);
    } else if (entry.name === 'index.html') {
      // Convert /public/foo/index.html -> /foo
      const pubIdx = full.indexOf('/public/');
      if (pubIdx >= 0) {
        let route = full.slice(pubIdx + '/public'.length, -'/index.html'.length);
        if (!route) route = '/';
        results.push(route);
      }
    }
  }
  return results;
}

let _cachedRoutes: string[] | null = null;
function getRoutes(): string[] {
  if (!_cachedRoutes) {
    try {
      _cachedRoutes = getPublicFiles(join(process.cwd(), 'public'));
    } catch {
      _cachedRoutes = [];
    }
  }
  return _cachedRoutes;
}

export async function GET(
  request: Request,
  { params }: { params: { seo: string[] } }
) {
  const seoPath = params.seo.join('/');
  const first = seoPath.split('/')[0];
  if (NEXTJS_ROUTES.has(first)) {
    return NextResponse.next();
  }

  const routes = getRoutes();
  const targetRoute = '/' + seoPath;

  if (!routes.includes(targetRoute)) {
    return NextResponse.next();
  }

  const filePath = join(process.cwd(), 'public', targetRoute, 'index.html');
  if (!existsSync(filePath)) {
    return NextResponse.next();
  }

  try {
    const content = readFileSync(filePath, 'utf-8');
    return new NextResponse(content, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (err) {
    return new NextResponse('ROUTE HIT but file error: ' + String(err), { status: 500 });
  }
}

// Debug: log all unmatched routes
return new NextResponse(
  'ROUTE DEBUG: seoPath=' + seoPath + ' targetRoute=' + targetRoute + ' routesMatch=' + routes.includes(targetRoute) + ' fileExists=' + existsSync(filePath),
  { status: 200, headers: { 'Content-Type': 'text/plain' } }
);
