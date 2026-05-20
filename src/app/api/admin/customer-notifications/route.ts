import { NextRequest, NextResponse } from 'next/server';
import { ensureSchema, getDb } from '@/lib/db';
import { guardAdmin } from '@/lib/guard';
import { sanitizeText } from '@/lib/validation';
import { audit } from '@/lib/audit';
import { sendToCustomerOrAdmin } from '@/lib/push';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const TYPES = ['info', 'milestone', 'payment', 'document'];

export async function POST(req: NextRequest) {
  const denied = await guardAdmin(req);
  if (denied) return denied;
  await ensureSchema();
  const body = await req.json();
  const customer_id = Number(body.customer_id);
  const title = sanitizeText(body.title, 200);
  const bodyText = sanitizeText(body.body || '', 1000);
  const type = TYPES.includes(body.type) ? body.type : 'info';
  if (!customer_id || !title)
    return NextResponse.json({ ok: false, message: 'customer_id and title required.' }, { status: 400 });

  await getDb().execute({
    sql: `INSERT INTO customer_notifications (customer_id, unit_id, title, body, type) VALUES (?, ?, ?, ?, ?)`,
    args: [customer_id, body.unit_id ? Number(body.unit_id) : null, title, bodyText, type],
  });
  await audit('admin.customer_notif_sent', { customer_id, type });

  // Push
  void sendToCustomerOrAdmin('customer', customer_id, {
    title,
    body: bodyText,
    url: '/my-home/dashboard',
    tag: `customer-${type}`,
  }).catch(() => {});

  return NextResponse.json({ ok: true });
}
