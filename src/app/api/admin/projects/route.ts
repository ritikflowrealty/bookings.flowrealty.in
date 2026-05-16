import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { listAllProjects } from '@/lib/projects';
import { guardAdmin } from '@/lib/guard';
import { sanitizeText } from '@/lib/validation';
import { audit } from '@/lib/audit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const denied = guardAdmin(req);
  if (denied) return denied;
  return NextResponse.json({ ok: true, projects: listAllProjects() });
}

export async function POST(req: NextRequest) {
  const denied = guardAdmin(req);
  if (denied) return denied;

  try {
    const body = await req.json();
    const name = sanitizeText(body.name, 120);
    const developer = sanitizeText(body.developer, 120);
    const city = sanitizeText(body.city, 80);
    if (!name || !developer || !city) {
      return NextResponse.json(
        { ok: false, message: 'Name, developer and city are required.' },
        { status: 400 }
      );
    }
    const slug = sanitizeText(body.slug, 80) || slugify(name);
    const description = sanitizeText(body.description, 600);
    const highlight_text = sanitizeText(body.highlight_text, 80);
    const image_url = sanitizeText(body.image_url, 600);
    const learn_more_url = sanitizeText(body.learn_more_url, 600);
    const razorpay_key_id = sanitizeText(body.razorpay_key_id, 120);
    const razorpay_key_secret = sanitizeText(body.razorpay_key_secret, 200);

    const db = getDb();
    const max =
      (db.prepare('SELECT MAX(display_order) as m FROM projects').get() as { m: number | null })
        .m || 0;

    const result = db
      .prepare(
        `INSERT INTO projects (
          slug, name, developer, city, description, highlight_text, image_url, learn_more_url,
          razorpay_key_id, razorpay_key_secret, razorpay_active,
          is_visible, booking_enabled, payment_enabled, display_order
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 0, ?)`
      )
      .run(
        slug,
        name,
        developer,
        city,
        description,
        highlight_text,
        image_url,
        learn_more_url,
        razorpay_key_id,
        razorpay_key_secret,
        razorpay_key_id && razorpay_key_secret ? 1 : 0,
        max + 1
      );
    audit('admin.project_created', { id: result.lastInsertRowid, slug });
    return NextResponse.json({ ok: true, id: result.lastInsertRowid });
  } catch (err: any) {
    if (String(err?.message || '').includes('UNIQUE')) {
      return NextResponse.json({ ok: false, message: 'Slug already exists.' }, { status: 409 });
    }
    return NextResponse.json({ ok: false, message: 'Could not create project.' }, { status: 500 });
  }
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}
