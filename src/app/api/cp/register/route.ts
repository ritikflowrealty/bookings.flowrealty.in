import { NextRequest, NextResponse } from 'next/server';
import { ensureSchema, getDb } from '@/lib/db';
import { sanitizeText } from '@/lib/validation';
import { audit } from '@/lib/audit';
import { sendToCustomerOrAdmin } from '@/lib/push';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    await ensureSchema();
    const body = await req.json();

    const full_name = sanitizeText(body.full_name, 120);
    const email = sanitizeText(body.email, 200).toLowerCase();
    const mobile = sanitizeText(body.mobile, 10);
    const whatsapp = sanitizeText(body.whatsapp, 10);
    const rera_number = sanitizeText(body.rera_number, 60);
    const aadhaar_number = sanitizeText(body.aadhaar_number, 12);
    const pan_number = sanitizeText(body.pan_number, 10).toUpperCase();
    const company_name = sanitizeText(body.company_name, 200);
    const city = sanitizeText(body.city, 80);
    const rera_doc_url = sanitizeText(body.rera_doc_url, 500);
    const aadhaar_doc_url = sanitizeText(body.aadhaar_doc_url, 500);
    const pan_doc_url = sanitizeText(body.pan_doc_url, 500);
    const photo_url = sanitizeText(body.photo_url, 500);

    if (full_name.length < 2) return NextResponse.json({ ok: false, message: 'Enter your full name.' }, { status: 400 });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ ok: false, message: 'Enter a valid email.' }, { status: 400 });
    if (!/^[6-9]\d{9}$/.test(mobile)) return NextResponse.json({ ok: false, message: 'Enter a 10-digit mobile.' }, { status: 400 });
    if (!rera_number) return NextResponse.json({ ok: false, message: 'RERA number required.' }, { status: 400 });
    if (!/^\d{12}$/.test(aadhaar_number)) return NextResponse.json({ ok: false, message: 'Aadhaar must be 12 digits.' }, { status: 400 });
    if (!/^[A-Z]{5}\d{4}[A-Z]$/.test(pan_number)) return NextResponse.json({ ok: false, message: 'PAN format invalid.' }, { status: 400 });
    if (!rera_doc_url || !aadhaar_doc_url || !pan_doc_url || !photo_url)
      return NextResponse.json({ ok: false, message: 'All documents must be uploaded.' }, { status: 400 });

    const db = getDb();

    // Check duplicate email
    const dup = await db.execute({
      sql: `SELECT id, status FROM channel_partners WHERE email = ? LIMIT 1`,
      args: [email],
    });
    if (dup.rows.length > 0) {
      const existing = dup.rows[0] as any;
      if (existing.status === 'rejected') {
        // Allow re-registration after rejection
        await db.execute({
          sql: `UPDATE channel_partners SET
                  full_name = ?, mobile = ?, whatsapp = ?,
                  rera_number = ?, rera_doc_url = ?,
                  aadhaar_number = ?, aadhaar_doc_url = ?,
                  pan_number = ?, pan_doc_url = ?, photo_url = ?,
                  company_name = ?, city = ?,
                  status = 'pending', rejection_reason = '', updated_at = datetime('now')
                WHERE id = ?`,
          args: [full_name, mobile, whatsapp, rera_number, rera_doc_url, aadhaar_number, aadhaar_doc_url, pan_number, pan_doc_url, photo_url, company_name, city, existing.id],
        });
      } else {
        return NextResponse.json({ ok: false, message: 'This email is already registered. Sign in or contact us if you need help.' }, { status: 409 });
      }
    } else {
      await db.execute({
        sql: `INSERT INTO channel_partners (
                email, full_name, mobile, whatsapp,
                rera_number, rera_doc_url,
                aadhaar_number, aadhaar_doc_url,
                pan_number, pan_doc_url, photo_url,
                company_name, city, status
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
        args: [
          email, full_name, mobile, whatsapp,
          rera_number, rera_doc_url,
          aadhaar_number, aadhaar_doc_url,
          pan_number, pan_doc_url, photo_url,
          company_name, city,
        ],
      });
    }

    await audit('cp.registration_submitted', { email, mobile });

    // Push admin
    void sendToCustomerOrAdmin('admin', null, {
      title: `New CP registration: ${full_name}`,
      body: `${email} · ${mobile}`,
      url: '/admin',
      tag: 'cp-registered',
    }).catch(() => {});

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ ok: false, message: err?.message || 'Registration failed.' }, { status: 500 });
  }
}
