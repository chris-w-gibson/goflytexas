import { NextResponse } from 'next/server';
import { desc } from 'drizzle-orm';
import { db } from '@/lib/db';
import { leads } from '@/lib/db/schema';
import { getSessionFromCookies } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function csvCell(v: unknown): string {
  const s = v == null ? '' : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET() {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
  }
  const rows = await db.select().from(leads).orderBy(desc(leads.createdAt));
  const header = [
    'Name',
    'Email',
    'Phone',
    'Interest',
    'Preferred contact',
    'Status',
    'Source',
    'Message',
    'Created',
  ];
  const lines = [header.join(',')];
  for (const l of rows) {
    lines.push(
      [
        csvCell(l.name),
        csvCell(l.email),
        csvCell(l.phone),
        csvCell(l.flightInterest),
        csvCell(l.preferredContact),
        csvCell(l.status),
        csvCell(l.source),
        csvCell(l.message),
        csvCell(l.createdAt.toISOString()),
      ].join(','),
    );
  }
  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="goflytexas-leads-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
