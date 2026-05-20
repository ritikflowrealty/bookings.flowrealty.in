import { NextRequest, NextResponse } from 'next/server';
import { ensureSchema, getDb } from '@/lib/db';
import { guardAdmin } from '@/lib/guard';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const denied = await guardAdmin(req);
  if (denied) return denied;
  await ensureSchema();
  const status = new URL(req.url).searchParams.get('status') || '';
  const sql = status
    ? `SELECT i.*, cp.full_name AS cp_name, cp.email AS cp_email, l.reference_number AS lead_ref, p.name AS project_name
       FROM cp_invoices i
       LEFT JOIN channel_partners cp ON cp.id = i.channel_partner_id
       LEFT JOIN leads l ON l.id = i.lead_id
       LEFT JOIN projects p ON p.id = COALESCE(l.project_id, (SELECT project_id FROM bookings WHERE id = i.booking_id))
       WHERE i.status = ?
       ORDER BY i.created_at DESC LIMIT 200`
    : `SELECT i.*, cp.full_name AS cp_name, cp.email AS cp_email, l.reference_number AS lead_ref, p.name AS project_name
       FROM cp_invoices i
       LEFT JOIN channel_partners cp ON cp.id = i.channel_partner_id
       LEFT JOIN leads l ON l.id = i.lead_id
       LEFT JOIN projects p ON p.id = COALESCE(l.project_id, (SELECT project_id FROM bookings WHERE id = i.booking_id))
       ORDER BY i.created_at DESC LIMIT 200`;
  const r = await getDb().execute({ sql, args: status ? [status] : [] });
  return NextResponse.json({ ok: true, invoices: r.rows });
}
