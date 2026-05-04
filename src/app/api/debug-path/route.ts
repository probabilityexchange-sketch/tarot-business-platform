import { NextResponse } from 'next/server';
import { existsSync } from 'fs';
import { join } from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
  const paths = [
    process.cwd(),
    join(process.cwd(), 'public'),
    join(process.cwd(), '..', 'public'),
  ];
  const results = paths.map(p => ({ path: p, exists: existsSync(p) }));
  return NextResponse.json({ cwd: process.cwd(), results });
}
