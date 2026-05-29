import { NextRequest, NextResponse } from 'next/server';
import { ensureSchema, getDb } from '@/lib/db';
import { guardAdmin } from '@/lib/guard';
import { sanitizeText } from '@/lib/validation';
import { audit } from '@/lib/audit';
import { notifyGallabox, buildUsRecipients } from '@/lib/gallabox';
import { getProjectById } from '@/lib/projects';
import { getSettings, setting } from '@/lib/settings';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DOC_TYPES = ['agreement', 'receipt', 'allocation_letter', 'noc', 'other'];

export async function POST(req: NextRequest) {
  const denied = await guardAdmin(req);
  if (denied) return denied;
  await ensureSchema();
  const body = await req.json();
  const customer_id = Number(body.customer_id);
  const doc_type = DOC_TYPES.includes(body.doc_type) ? body.doc_type : 'other';
  const title = sanitizeText(body.title, 200);
  const doc_url = sanitizeText(body.doc_url, 500);
  if (!customer_id || !title || !doc_url)
    return NextResponse.json({ ok: false, message: 'customer_id, title and doc_url required.' }, { status: 400 });

  await getDb().execute({
    sql: `INSERT INTO customer_documents (customer_id, unit_id, doc_type, title, doc_url, uploaded_by)
          VALUES (?, ?, ?, ?, ?, 'admin')`,
    args: [customer_id, body.unit_id ? Number(body.unit_id) : null, doc_type, title, doc_url],
  });

  // Auto-create a notification
  await getDb().execute({
    sql: `INSERT INTO customer_notifications (customer_id, unit_id, title, body, type)
          VALUES (?, ?, ?, ?, 'document')`,
    args: [
      customer_id,
      body.unit_id ? Number(body.unit_id) : null,
      `New document: ${title}`,
      'A new document has been added to your portal.',
    ],
  });

  await audit('admin.customer_doc_added', { customer_id, doc_type });

  // WhatsApp the customer that a new document is available
  void (async () => {
    try {
      // Get the customer's phone and resolve a project from either the
      // explicit unit_id or their first known unit.
      const unitId = body.unit_id ? Number(body.unit_id) : null;
      const baseRow = await getDb().execute({
        sql: `SELECT full_name, mobile FROM customer_users WHERE id = ? LIMIT 1`,
        args: [customer_id],
      });
      const cust = baseRow.rows[0] as any;
      if (!cust) return;

      let projectId: number | null = null;
      let towerUnit = '';
      const unitRow = await getDb().execute({
        sql: unitId
          ? `SELECT project_id, tower_unit FROM customer_units WHERE id = ? AND customer_id = ? LIMIT 1`
          : `SELECT project_id, tower_unit FROM customer_units WHERE customer_id = ? ORDER BY id LIMIT 1`,
        args: unitId ? [unitId, customer_id] : [customer_id],
      });
      const u = unitRow.rows[0] as any;
      if (u) {
        projectId = Number(u.project_id);
        towerUnit = String(u.tower_unit || '');
      }
      if (!projectId) return;

      const project = await getProjectById(projectId);
      if (!project) return;
      const s = await getSettings();
      const us = buildUsRecipients(setting(s, 'internal_whatsapp_numbers', ''));
      await notifyGallabox({
        project,
        event: {
          event: 'document.added',
          title: 'New document',
          data: {
            doc_type,
            doc_title: title,
            doc_url,
            tower_unit: towerUnit,
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
      console.error('[gallabox] document.added notify failed:', err?.message || err);
    }
  })();

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const denied = await guardAdmin(req);
  if (denied) return denied;
  const id = Number(new URL(req.url).searchParams.get('id'));
  if (!id) return NextResponse.json({ ok: false, message: 'id required.' }, { status: 400 });
  await getDb().execute({ sql: `DELETE FROM customer_documents WHERE id = ?`, args: [id] });
  await audit('admin.customer_doc_deleted', { id });
  return NextResponse.json({ ok: true });
}
