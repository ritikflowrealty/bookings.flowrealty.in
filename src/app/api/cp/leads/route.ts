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
      sql: `SELECT crm_endpoint, crm_form_data, crm_company_id, crm_access_token, crm_api_key, crm_project_name FROM projects WHERE id = ? LIMIT 1`,
      args: [project_id],
    });
    const proj = projRow.rows[0] as any;
    if (proj?.crm_endpoint && proj?.crm_access_token) {
      void pushToExternalCrm({
        endpoint: proj.crm_endpoint,
        companyId: proj.crm_company_id || '',
        accessToken: proj.crm_access_token || '',
        apiKey: proj.crm_api_key || '',
        projectName: proj.crm_project_name || '',
        formDataOverride: proj.crm_form_data || '',
        prospectFirstName: first,
        prospectLastName: last,
        prospectPhone: mobile,
        prospectEmail: email,
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
 * Pushes lead to external CRM (Totalityre format).
 * Uses the structured LeadDetails JSON payload with auth headers.
 */
async function pushToExternalCrm(args: {
  endpoint: string;
  companyId: string;
  accessToken: string;
  apiKey: string;
  projectName: string;
  formDataOverride: string;
  prospectFirstName: string;
  prospectLastName: string;
  prospectPhone: string;
  prospectEmail: string;
}): Promise<void> {
  // If there's a raw JSON override, use that (legacy mode)
  if (args.formDataOverride) {
    try {
      const pairs = JSON.parse(args.formDataOverride) as Record<string, string>;
      const formData = new FormData();
      for (const [key, val] of Object.entries(pairs)) {
        formData.append(
          key,
          String(val)
            .replace(/\{\{name\}\}/gi, `${args.prospectFirstName} ${args.prospectLastName}`.trim())
            .replace(/\{\{phone\}\}/gi, args.prospectPhone)
            .replace(/\{\{email\}\}/gi, args.prospectEmail)
        );
      }
      await fetch(args.endpoint, { method: 'POST', body: formData });
      return;
    } catch {
      // Fall through to structured format
    }
  }

  // Totalityre structured API
  const payload = {
    LeadDetails: [
      { Attribute: 'FirstName', Value: args.prospectFirstName },
      { Attribute: 'LastName', Value: args.prospectLastName },
      { Attribute: 'LeadStatusSecondary', Value: 'New' },
      { Attribute: 'countrycode', Value: '+91' },
      { Attribute: 'Mobile', Value: args.prospectPhone },
      { Attribute: 'Email', Value: args.prospectEmail },
    ],
    ProjectDetails: [
      { Attribute: 'Project', Value: args.projectName },
      { Attribute: 'LeadSource', Value: 'Media Online' },
      { Attribute: 'LeadSecondarySource', Value: 'Website' },
      { Attribute: 'LeadTertiarySource', Value: 'Flow Realty CP Portal' },
    ],
  };

  const resp = await fetch(args.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      AccessToken: args.accessToken,
      AccessAPIkey: args.apiKey,
      CompanyId: args.companyId,
    },
    body: JSON.stringify(payload),
  });

  if (!resp.ok) {
    const text = await resp.text().catch(() => '');
    throw new Error(`CRM responded ${resp.status}: ${text.slice(0, 200)}`);
  }
}
