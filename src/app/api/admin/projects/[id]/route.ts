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
  const brochure_url = sanitizeText(body.brochure_url ?? row.brochure_url, 600);
  const trust_point_1 = sanitizeText(body.trust_point_1 ?? row.trust_point_1, 200);
  const trust_point_2 = sanitizeText(body.trust_point_2 ?? row.trust_point_2, 200);
  const trust_point_3 = sanitizeText(body.trust_point_3 ?? row.trust_point_3, 200);

  // Payment provider (mutex: only one active)
  const payment_provider =
    body.payment_provider === 'cashfree'
      ? 'cashfree'
      : body.payment_provider === 'payu'
        ? 'payu'
        : 'razorpay';

  // Razorpay keys
  const razorpay_key_id =
    body.razorpay_key_id !== undefined && body.razorpay_key_id !== ''
      ? sanitizeText(body.razorpay_key_id, 120)
      : row.razorpay_key_id;
  const razorpay_key_secret =
    body.razorpay_key_secret !== undefined && body.razorpay_key_secret !== ''
      ? sanitizeText(body.razorpay_key_secret, 200)
      : row.razorpay_key_secret;
  const razorpay_active = razorpay_key_id && razorpay_key_secret ? 1 : 0;

  // Cashfree keys
  const cashfree_app_id =
    body.cashfree_app_id !== undefined && body.cashfree_app_id !== ''
      ? sanitizeText(body.cashfree_app_id, 120)
      : row.cashfree_app_id;
  const cashfree_secret_key =
    body.cashfree_secret_key !== undefined && body.cashfree_secret_key !== ''
      ? sanitizeText(body.cashfree_secret_key, 200)
      : row.cashfree_secret_key;
  const cashfree_active = cashfree_app_id && cashfree_secret_key ? 1 : 0;
  const cashfree_mode = body.cashfree_mode === 'production' ? 'production' : 'test';

  // PayU credentials
  const payu_merchant_key =
    body.payu_merchant_key !== undefined && body.payu_merchant_key !== ''
      ? sanitizeText(body.payu_merchant_key, 120)
      : (row as any).payu_merchant_key || '';
  const payu_salt =
    body.payu_salt !== undefined && body.payu_salt !== ''
      ? sanitizeText(body.payu_salt, 200)
      : (row as any).payu_salt || '';
  const payu_active = payu_merchant_key && payu_salt ? 1 : 0;
  const payu_mode = body.payu_mode === 'production' ? 'production' : 'test';

  // Gallabox WhatsApp notifications (per project)
  const gallabox_webhook_url =
    body.gallabox_webhook_url !== undefined
      ? sanitizeText(body.gallabox_webhook_url, 600)
      : (row as any).gallabox_webhook_url || '';
  const gallabox_active =
    body.gallabox_active !== undefined
      ? body.gallabox_active && gallabox_webhook_url
        ? 1
        : 0
      : (row as any).gallabox_active && gallabox_webhook_url
        ? 1
        : 0;
  const developer_whatsapp =
    body.developer_whatsapp !== undefined
      ? sanitizeText(body.developer_whatsapp, 20)
      : (row as any).developer_whatsapp || '';

  // External CRM
  const crm_endpoint = sanitizeText(body.crm_endpoint ?? (row as any).crm_endpoint ?? '', 500);
  const crm_form_data = sanitizeText(body.crm_form_data ?? (row as any).crm_form_data ?? '', 5000);
  const crm_company_id = sanitizeText(body.crm_company_id ?? (row as any).crm_company_id ?? '', 120);
  const crm_access_token = sanitizeText(body.crm_access_token ?? (row as any).crm_access_token ?? '', 200);
  const crm_api_key = sanitizeText(body.crm_api_key ?? (row as any).crm_api_key ?? '', 200);
  const crm_project_name = sanitizeText(body.crm_project_name ?? (row as any).crm_project_name ?? '', 200);

  // Toggles
  const is_visible = body.is_visible !== undefined ? (body.is_visible ? 1 : 0) : row.is_visible;
  const booking_enabled =
    body.booking_enabled !== undefined ? (body.booking_enabled ? 1 : 0) : row.booking_enabled;
  const payment_enabled =
    body.payment_enabled !== undefined ? (body.payment_enabled ? 1 : 0) : row.payment_enabled;

  // Enforce: cannot enable payment without the active provider having credentials
  if (payment_enabled) {
    if (payment_provider === 'razorpay' && !razorpay_active) {
      return NextResponse.json(
        { ok: false, message: 'Cannot enable payment. Razorpay key and secret are not set.' },
        { status: 400 }
      );
    }
    if (payment_provider === 'cashfree' && !cashfree_active) {
      return NextResponse.json(
        { ok: false, message: 'Cannot enable payment. Cashfree App ID and Secret are not set.' },
        { status: 400 }
      );
    }
    if (payment_provider === 'payu' && !payu_active) {
      return NextResponse.json(
        { ok: false, message: 'Cannot enable payment. PayU Merchant Key and Salt are not set.' },
        { status: 400 }
      );
    }
  }

  await db.execute({
    sql: `UPDATE projects SET
            name = ?, developer = ?, city = ?, description = ?, highlight_text = ?,
            image_url = ?, learn_more_url = ?, brochure_url = ?,
            trust_point_1 = ?, trust_point_2 = ?, trust_point_3 = ?,
            payment_provider = ?,
            razorpay_key_id = ?, razorpay_key_secret = ?, razorpay_active = ?,
            cashfree_app_id = ?, cashfree_secret_key = ?, cashfree_active = ?, cashfree_mode = ?,
            payu_merchant_key = ?, payu_salt = ?, payu_active = ?, payu_mode = ?,
            gallabox_webhook_url = ?, gallabox_active = ?, developer_whatsapp = ?,
            crm_endpoint = ?, crm_form_data = ?, crm_company_id = ?, crm_access_token = ?, crm_api_key = ?, crm_project_name = ?,
            is_visible = ?, booking_enabled = ?, payment_enabled = ?,
            updated_at = datetime('now')
          WHERE id = ?`,
    args: [
      name, developer, city, description, highlight_text,
      image_url, learn_more_url, brochure_url,
      trust_point_1, trust_point_2, trust_point_3,
      payment_provider,
      razorpay_key_id, razorpay_key_secret, razorpay_active,
      cashfree_app_id, cashfree_secret_key, cashfree_active, cashfree_mode,
      payu_merchant_key, payu_salt, payu_active, payu_mode,
      gallabox_webhook_url, gallabox_active, developer_whatsapp,
      crm_endpoint, crm_form_data, crm_company_id, crm_access_token, crm_api_key, crm_project_name,
      is_visible, booking_enabled, payment_enabled,
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
