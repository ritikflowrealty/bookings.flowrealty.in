import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { auth } from '@/auth';
import { ensureSchema, getDb } from '@/lib/db';
import { sanitizeText } from '@/lib/validation';
import { audit } from '@/lib/audit';
import { sendToCustomerOrAdmin } from '@/lib/push';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function leadRef(): string {
  const d = new Date();
  const date = `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, '0')}${String(d.getUTCDate()).padStart(2, '0')}`;
  return `LD-${date}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.cpId) {
      return NextResponse.json({ ok: false, message: 'Sign in required.' }, { status: 401 });
    }

    await ensureSchema();
    const db = getDb();

    // Confirm CP is approved
    const cpRow = await db.execute({
      sql: `SELECT id, status, full_name, email FROM channel_partners WHERE id = ? LIMIT 1`,
      args: [session.cpId],
    });
    const cp = cpRow.rows[0] as any;
    if (!cp || cp.status !== 'approved') {
      return NextResponse.json({ ok: false, message: 'Account not active.' }, { status: 403 });
    }

    const body = await req.json();
    const project_id = Number(body.project_id);
    if (!project_id) return NextResponse.json({ ok: false, message: 'Project required.' }, { status: 400 });

    const first = sanitizeText(body.prospect_first_name, 80);
    const last = sanitizeText(body.prospect_last_name, 80);
    const mobile = sanitizeText(body.prospect_mobile, 10);
    const altMobile = sanitizeText(body.prospect_alt_mobile, 10);
    const email = sanitizeText(body.prospect_email, 200);
    const configuration = sanitizeText(body.configuration, 40);
    const budget_range = sanitizeText(body.budget_range, 60);
    const preferred_location = sanitizeText(body.preferred_location, 120);
    const timeline = sanitizeText(body.timeline, 40);
    const notes = sanitizeText(body.notes, 1000);

    if (first.length < 2) return NextResponse.json({ ok: false, message: 'First name required.' }, { status: 400 });
    if (!/^[6-9]\d{9}$/.test(mobile)) return NextResponse.json({ ok: false, message: 'Valid mobile required.' }, { status: 400 });

    const reference = leadRef();
    await db.execute({
      sql: `INSERT INTO leads (
              reference_number, source, channel_partner_id, project_id,
              prospect_first_name, prospect_last_name, prospect_mobile, prospect_alt_mobile, prospect_email,
              configuration, budget_range, preferred_location, timeline, notes, status
            ) VALUES (?, 'cp', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new')`,
      args: [
        reference, cp.id, project_id,
        first, last, mobile, altMobile, email,
        configuration, budget_range, preferred_location, timeline, notes,
      ],
    });
    await audit('lead.cp_submitted', { reference, cp_id: cp.id, project_id });

    // Push to external CRM if configured for this project
    const projRow = await db.execute({
      sql: `SELECT crm_endpoint, crm_form_data FROM projects WHERE id = ? LIMIT 1`,
      args: [project_id],
    });
    const proj = projRow.rows[0] as any;
    if (proj?.crm_endpoint) {
      void pushToExternalCrm({
        endpoint: proj.crm_endpoint,
        formDataTemplate: proj.crm_form_data || '',
        prospectName: `${first} ${last}`.trim(),
        prospectPhone: mobile,
      }).catch((err) => {
        console.error('[crm-push] failed:', err?.message || err);
      });
    }

    // Push notification to admin
    void sendToCustomerOrAdmin('admin', null, {
      title: `New CP lead from ${cp.full_name}`,
      body: `${first} ${last} · ${configuration || 'config tbd'} · ${budget_range || 'budget tbd'}`,
      url: '/admin',
      tag: 'lead-new',
    }).catch(() => {});

    return NextResponse.json({ ok: true, reference_number: reference });
  } catch (err: any) {
    return NextResponse.json({ ok: false, message: err?.message || 'Could not submit.' }, { status: 500 });
  }
}


/**
 * Pushes lead data to an external CRM (e.g. Totalityre/Sparkle).
 * The `formDataTemplate` is a JSON string of key-value pairs stored in the admin panel.
 * Placeholders {{name}} and {{phone}} are replaced with actual lead data.
 */
async function pushToExternalCrm(args: {
  endpoint: string;
  formDataTemplate: string;
  prospectName: string;
  prospectPhone: string;
}): Promise<void> {
  let pairs: Record<string, string> = {};
  try {
    pairs = JSON.parse(args.formDataTemplate);
  } catch {
    return; // malformed config, skip silently
  }

  const formData = new FormData();
  for (const [key, val] of Object.entries(pairs)) {
    const resolved = String(val)
      .replace(/\{\{name\}\}/gi, args.prospectName)
      .replace(/\{\{phone\}\}/gi, args.prospectPhone);
    formData.append(key, resolved);
  }

  const resp = await fetch(args.endpoint, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      userpagename: 'firsthello',
      useraction: 'viewright',
      platform: '1',
      masterlisting: 'true',
    },
    body: formData,
  });

  if (!resp.ok) {
    throw new Error(`CRM responded ${resp.status}`);
  }
}
