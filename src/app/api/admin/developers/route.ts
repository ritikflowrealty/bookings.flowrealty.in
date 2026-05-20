import { NextRequest, NextResponse } from 'next/server';
import { ensureSchema, getDb } from '@/lib/db';
import { guardAdmin } from '@/lib/guard';
import { sanitizeText } from '@/lib/validation';
import { audit } from '@/lib/audit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const denied = await guardAdmin(req);
  if (denied) return denied;
  await ensureSchema();
  const db = getDb();
  const r = await db.execute(`SELECT id, slug, name, logo_url, total_projects, is_published FROM developers ORDER BY name`);
  return NextResponse.json({ ok: true, developers: r.rows });
}

export async function POST(req: NextRequest) {
  const denied = await guardAdmin(req);
  if (denied) return denied;
  await ensureSchema();
  const body = await req.json();
  const name = sanitizeText(body.name, 120);
  const slug = sanitizeText(body.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''), 80);
  if (!name || !slug) return NextResponse.json({ ok: false, message: 'Name required.' }, { status: 400 });
  try {
    const r = await getDb().execute({
      sql: `INSERT INTO developers (slug, name, description, founded_year, total_projects, is_published)
            VALUES (?, ?, ?, ?, ?, 1) RETURNING id`,
      args: [
        slug, name,
        sanitizeText(body.description || '', 600),
        body.founded_year ? Number(body.founded_year) : null,
        body.total_projects ? Number(body.total_projects) : 0,
      ],
    });
    const id = (r.rows[0] as any)?.id;
    await audit('admin.developer_created', { id, slug });
    return NextResponse.json({ ok: true, id });
  } catch (err: any) {
    if (String(err?.message || '').includes('UNIQUE')) {
      return NextResponse.json({ ok: false, message: 'Slug already exists.' }, { status: 409 });
    }
    return NextResponse.json({ ok: false, message: 'Could not create developer.' }, { status: 500 });
  }
}
