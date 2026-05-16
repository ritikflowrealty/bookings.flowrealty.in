import { NextRequest, NextResponse } from 'next/server';
import { ensureSchema, getDb, type ProjectRow } from '@/lib/db';
import { guardAdmin } from '@/lib/guard';
import { sanitizeText } from '@/lib/validation';
import { audit } from '@/lib/audit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await guardAdmin(req);
  if (denied) return denied;
  const { id: idStr } = await params;
  const id = Number(idStr);
  if (!id) return NextResponse.json({ ok: false, message: 'Invalid id' }, { status: 400 });

  await ensureSchema();
  const db = getDb();
  const result = await db.execute({ sql: 'SELECT * FROM projects WHERE id = ?', args: [id] });
  const row = result.rows[0] as unknown as ProjectRow | undefined;
  if (!row) return NextResponse.json({ ok: false, message: 'Not found' }, { status: 404 });

  const body = await req.json();

  const name = sanitizeText(body.name ?? row.name, 120);
  const developer = sanitizeText(body.developer ?? row.developer, 120);
  const city = sanitizeText(body.city ?? row.city, 80);
  const description = sanitizeText(body.description ?? row.description, 600);
  const highlight_text = sanitizeText(body.highlight_text ?? row.highlight_text, 80);
  const image_url = sanitizeText(body.image_url ?? row.image_url, 600);
  const learn_more_url = sanitizeText(body.learn_more_url ?? row.learn_more_url, 600);

  const razorpay_key_id =
    body.razorpay_key_id !== undefined && body.razorpay_key_id !== ''
      ? sanitizeText(body.razorpay_key_id, 120)
      : row.razorpay_key_id;
  const razorpay_key_secret =
    body.razorpay_key_secret !== undefined && body.razorpay_key_secret !== ''
      ? sanitizeText(body.razorpay_key_secret, 200)
      : row.razorpay_key_secret;

  const razorpay_active = razorpay_key_id && razorpay_key_secret ? 1 : 0;

  const is_visible = body.is_visible !== undefined ? (body.is_visible ? 1 : 0) : row.is_visible;
  let booking_enabled =
    body.booking_enabled !== undefined ? (body.booking_enabled ? 1 : 0) : row.booking_enabled;
  let payment_enabled =
    body.payment_enabled !== undefined ? (body.payment_enabled ? 1 : 0) : row.payment_enabled;

  if ((booking_enabled || payment_enabled) && !razorpay_active) {
    return NextResponse.json(
      {
        ok: false,
        message:
          'Cannot enable booking or payment until Razorpay key and secret are set for this project.',
      },
      { status: 400 }
    );
  }

  await db.execute({
    sql: `UPDATE projects SET
            name = ?, developer = ?, city = ?, description = ?, highlight_text = ?,
            image_url = ?, learn_more_url = ?,
            razorpay_key_id = ?, razorpay_key_secret = ?, razorpay_active = ?,
            is_visible = ?, booking_enabled = ?, payment_enabled = ?,
            updated_at = datetime('now')
          WHERE id = ?`,
    args: [
      name,
      developer,
      city,
      description,
      highlight_text,
      image_url,
      learn_more_url,
      razorpay_key_id,
      razorpay_key_secret,
      razorpay_active,
      is_visible,
      booking_enabled,
      payment_enabled,
      id,
    ],
  });

  await audit('admin.project_updated', { id });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await guardAdmin(req);
  if (denied) return denied;
  const { id: idStr } = await params;
  const id = Number(idStr);
  if (!id) return NextResponse.json({ ok: false, message: 'Invalid id' }, { status: 400 });

  await ensureSchema();
  const db = getDb();
  const refsRes = await db.execute({
    sql: 'SELECT COUNT(*) as c FROM bookings WHERE project_id = ?',
    args: [id],
  });
  const c = Number((refsRes.rows[0] as Record<string, unknown>)?.c ?? 0);
  if (c > 0) {
    return NextResponse.json(
      { ok: false, message: 'Project has existing bookings. Disable visibility instead.' },
      { status: 409 }
    );
  }
  await db.execute({ sql: 'DELETE FROM projects WHERE id = ?', args: [id] });
  await audit('admin.project_deleted', { id });
  return NextResponse.json({ ok: true });
}
