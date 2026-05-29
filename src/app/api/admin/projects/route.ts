import { NextRequest, NextResponse } from 'next/server';
import { ensureSchema, getDb } from '@/lib/db';
import { listAllProjects } from '@/lib/projects';
import { guardAdmin } from '@/lib/guard';
import { sanitizeText } from '@/lib/validation';
import { audit } from '@/lib/audit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const denied = await guardAdmin(req);
  if (denied) return denied;
  const projects = await listAllProjects();
  return NextResponse.json({ ok: true, projects });
}

export async function POST(req: NextRequest) {
  const denied = await guardAdmin(req);
  if (denied) return denied;

  try {
    await ensureSchema();
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
    const brochure_url = sanitizeText(body.brochure_url, 600);
    const trust_point_1 = sanitizeText(body.trust_point_1, 200);
    const trust_point_2 = sanitizeText(body.trust_point_2, 200);
    const trust_point_3 = sanitizeText(body.trust_point_3, 200);
    const payment_provider =
      body.payment_provider === 'cashfree'
        ? 'cashfree'
        : body.payment_provider === 'payu'
          ? 'payu'
          : 'razorpay';
    const razorpay_key_id = sanitizeText(body.razorpay_key_id, 120);
    const razorpay_key_secret = sanitizeText(body.razorpay_key_secret, 200);
    const cashfree_app_id = sanitizeText(body.cashfree_app_id, 120);
    const cashfree_secret_key = sanitizeText(body.cashfree_secret_key, 200);
    const cashfree_mode = body.cashfree_mode === 'production' ? 'production' : 'test';
    const payu_merchant_key = sanitizeText(body.payu_merchant_key, 120);
    const payu_salt = sanitizeText(body.payu_salt, 200);
    const payu_mode = body.payu_mode === 'production' ? 'production' : 'test';
    const gallabox_webhook_url = sanitizeText(body.gallabox_webhook_url || '', 600);
    const gallabox_active = body.gallabox_active && gallabox_webhook_url ? 1 : 0;
    const developer_whatsapp = sanitizeText(body.developer_whatsapp || '', 20);

    const db = getDb();
    const maxResult = await db.execute('SELECT MAX(display_order) as m FROM projects');
    const maxRow = (maxResult.rows[0] as Record<string, unknown>) || {};
    const max = Number(maxRow.m ?? 0);

    const result = await db.execute({
      sql: `INSERT INTO projects (
          slug, name, developer, city, description, highlight_text, image_url, learn_more_url,
          brochure_url, trust_point_1, trust_point_2, trust_point_3, payment_provider,
          razorpay_key_id, razorpay_key_secret, razorpay_active,
          cashfree_app_id, cashfree_secret_key, cashfree_active, cashfree_mode,
          payu_merchant_key, payu_salt, payu_active, payu_mode,
          gallabox_webhook_url, gallabox_active, developer_whatsapp,
          is_visible, booking_enabled, payment_enabled, display_order
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 0, ?) RETURNING id`,
      args: [
        slug, name, developer, city, description, highlight_text, image_url, learn_more_url,
        brochure_url, trust_point_1, trust_point_2, trust_point_3, payment_provider,
        razorpay_key_id, razorpay_key_secret, razorpay_key_id && razorpay_key_secret ? 1 : 0,
        cashfree_app_id, cashfree_secret_key, cashfree_app_id && cashfree_secret_key ? 1 : 0,
        cashfree_mode,
        payu_merchant_key, payu_salt, payu_merchant_key && payu_salt ? 1 : 0, payu_mode,
        gallabox_webhook_url, gallabox_active, developer_whatsapp,
        max + 1,
      ],
    });
    const id = Number((result.rows[0] as Record<string, unknown>)?.id ?? 0);
    await audit('admin.project_created', { id, slug });
    return NextResponse.json({ ok: true, id });
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
