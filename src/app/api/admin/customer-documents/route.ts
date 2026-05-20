import { NextRequest, NextResponse } from 'next/server';
import { ensureSchema, getDb } from '@/lib/db';
import { guardAdmin } from '@/lib/guard';
import { sanitizeText } from '@/lib/validation';
import { audit } from '@/lib/audit';

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
