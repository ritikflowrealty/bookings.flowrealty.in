import { NextRequest, NextResponse } from 'next/server';
import { ensureSchema, getDb } from '@/lib/db';
import { guardAdmin } from '@/lib/guard';
import { sanitizeText } from '@/lib/validation';
import { audit } from '@/lib/audit';
import { sendToCustomerOrAdmin } from '@/lib/push';
import { notifyGallabox, buildUsRecipients } from '@/lib/gallabox';
import { getProjectById } from '@/lib/projects';
import { getSettings, setting } from '@/lib/settings';

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

  // WhatsApp via Gallabox — anything we send to the customer should also go
  // out on WhatsApp via the project they're booked into.
  void (async () => {
    try {
      const unitId = body.unit_id ? Number(body.unit_id) : null;
      const cRow = await getDb().execute({
        sql: `SELECT full_name, mobile FROM customer_users WHERE id = ? LIMIT 1`,
        args: [customer_id],
      });
      const cust = cRow.rows[0] as any;
      if (!cust) return;
      const uRow = await getDb().execute({
        sql: unitId
          ? `SELECT project_id, tower_unit FROM customer_units WHERE id = ? AND customer_id = ? LIMIT 1`
          : `SELECT project_id, tower_unit FROM customer_units WHERE customer_id = ? ORDER BY id LIMIT 1`,
        args: unitId ? [unitId, customer_id] : [customer_id],
      });
      const u = uRow.rows[0] as any;
      if (!u || !u.project_id) return;
      const project = await getProjectById(Number(u.project_id));
      if (!project) return;
      const s = await getSettings();
      const us = buildUsRecipients(setting(s, 'internal_whatsapp_numbers', ''));
      await notifyGallabox({
        project,
        event: {
          event: `notification.${type}`,
          title,
          data: {
            body: bodyText,
            type,
            tower_unit: u.tower_unit || '',
            customer_name: cust.full_name || '',
            customer_phone: cust.mobile || '',
          },
        },
        recipients: [
          { role: 'customer', phone: cust.mobile || '', name: cust.full_name || '' },
          ...us,
        ],
      });
    } catch (err: any) {
      console.error('[gallabox] customer notification fan-out failed:', err?.message || err);
    }
  })();

  return NextResponse.json({ ok: true });
}
