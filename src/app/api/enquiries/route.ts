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
    const email = sanitizeText(body.email, 200);
    const mobile = sanitizeText(body.mobile, 10);
    const city = sanitizeText(body.city, 80);
    const configuration = sanitizeText(body.configuration, 40);
    const budget_range = sanitizeText(body.budget_range, 60);
    const message = sanitizeText(body.message, 1000);
    const source_page = sanitizeText(body.source_page, 200);

    if (full_name.length < 2) return NextResponse.json({ ok: false, message: 'Enter your name.' }, { status: 400 });
    if (!/^[6-9]\d{9}$/.test(mobile)) return NextResponse.json({ ok: false, message: 'Enter a valid 10-digit mobile.' }, { status: 400 });
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return NextResponse.json({ ok: false, message: 'Enter a valid email.' }, { status: 400 });

    const db = getDb();
    await db.execute({
      sql: `INSERT INTO enquiries (full_name, email, mobile, city, configuration, budget_range, message, source_page)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [full_name, email, mobile, city, configuration, budget_range, message, source_page],
    });
    await audit('enquiry.submitted', { full_name, mobile, city }, { ip: req.headers.get('x-forwarded-for') || '' });

    // Push admin
    void sendToCustomerOrAdmin('admin', null, {
      title: `New enquiry from ${full_name}`,
      body: `${mobile}${configuration ? ' · ' + configuration : ''}${budget_range ? ' · ' + budget_range : ''}`,
      url: '/admin',
      tag: 'enquiry-new',
    }).catch(() => {});

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, message: 'Could not submit enquiry.' }, { status: 500 });
  }
}
