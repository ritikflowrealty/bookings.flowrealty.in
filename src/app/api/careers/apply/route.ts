/**
 * Public endpoint to receive a careers/job application.
 *
 * Flow:
 *   1. Browser uploads the CV to R2 via /api/careers/upload-url (pre-signed PUT).
 *   2. Browser POSTs the form payload (including the resulting cv_url) here.
 *   3. We validate, persist into `career_applications`, audit, and ping admin
 *      via web push so recruiters see it immediately.
 */
import { NextRequest, NextResponse } from 'next/server';
import { ensureSchema, getDb } from '@/lib/db';
import { sanitizeText } from '@/lib/validation';
import { audit } from '@/lib/audit';
import { sendToCustomerOrAdmin } from '@/lib/push';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ALLOWED_ROLES = new Set([
  'sales',
  'marketing',
  'tech',
  'operations',
  'finance',
  'customer-success',
  'design',
  'other',
]);
const ALLOWED_EXP = new Set(['0-1', '1-3', '3-5', '5-10', '10+']);

function generateRef(): string {
  const yyyymmdd = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rnd = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `CAR-${yyyymmdd}-${rnd}`;
}

export async function POST(req: NextRequest) {
  try {
    await ensureSchema();
    const body = await req.json();

    const full_name = sanitizeText(body.full_name, 120);
    const email = sanitizeText(body.email, 200);
    const mobile = sanitizeText(body.mobile, 10);
    const city = sanitizeText(body.city || '', 80);
    const role_interest = ALLOWED_ROLES.has(body.role_interest)
      ? body.role_interest
      : 'other';
    const experience_years = ALLOWED_EXP.has(body.experience_years)
      ? body.experience_years
      : '';
    const current_company = sanitizeText(body.current_company || '', 200);
    const current_role = sanitizeText(body.current_role || '', 200);
    const linkedin_url = sanitizeText(body.linkedin_url || '', 400);
    const portfolio_url = sanitizeText(body.portfolio_url || '', 400);
    const message = sanitizeText(body.message || '', 2000);
    const cv_url = sanitizeText(body.cv_url || '', 800);
    const cv_filename = sanitizeText(body.cv_filename || '', 200);
    const source_page = sanitizeText(body.source_page || '', 200);

    if (full_name.length < 2)
      return NextResponse.json(
        { ok: false, message: 'Please enter your full name.' },
        { status: 400 }
      );
    if (!/^[6-9]\d{9}$/.test(mobile))
      return NextResponse.json(
        { ok: false, message: 'Enter a valid 10-digit Indian mobile number.' },
        { status: 400 }
      );
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return NextResponse.json(
        { ok: false, message: 'Enter a valid email address.' },
        { status: 400 }
      );

    // CV is required — that's the whole point of replacing the mailto flow.
    if (!cv_url || !/^https?:\/\//i.test(cv_url))
      return NextResponse.json(
        { ok: false, message: 'Please attach your CV before submitting.' },
        { status: 400 }
      );

    if (linkedin_url && !/^https?:\/\//i.test(linkedin_url))
      return NextResponse.json(
        { ok: false, message: 'LinkedIn URL must start with https://' },
        { status: 400 }
      );
    if (portfolio_url && !/^https?:\/\//i.test(portfolio_url))
      return NextResponse.json(
        { ok: false, message: 'Portfolio URL must start with https://' },
        { status: 400 }
      );

    const reference_number = generateRef();
    const db = getDb();
    await db.execute({
      sql: `INSERT INTO career_applications
        (reference_number, full_name, email, mobile, city, role_interest, experience_years,
         current_company, current_role, linkedin_url, portfolio_url, message,
         cv_url, cv_filename, source_page)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        reference_number,
        full_name,
        email,
        mobile,
        city,
        role_interest,
        experience_years,
        current_company,
        current_role,
        linkedin_url,
        portfolio_url,
        message,
        cv_url,
        cv_filename,
        source_page,
      ],
    });

    await audit(
      'career.applied',
      { reference_number, full_name, role_interest, mobile, email },
      {
        ip: req.headers.get('x-forwarded-for') || '',
        ua: req.headers.get('user-agent') || '',
      }
    );

    void sendToCustomerOrAdmin('admin', null, {
      title: `New career application: ${full_name}`,
      body: `${role_interest}${experience_years ? ' · ' + experience_years + ' yrs' : ''}${current_company ? ' · ' + current_company : ''}`,
      url: '/admin',
      tag: 'career-new',
    }).catch(() => {});

    return NextResponse.json({ ok: true, reference_number });
  } catch (err: any) {
    console.error('[careers.apply] failed:', err);
    return NextResponse.json(
      { ok: false, message: 'Could not submit application. Please try again.' },
      { status: 500 }
    );
  }
}
