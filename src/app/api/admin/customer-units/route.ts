import { NextRequest, NextResponse } from 'next/server';
import { ensureSchema, getDb } from '@/lib/db';
import { guardAdmin } from '@/lib/guard';
import { sanitizeText } from '@/lib/validation';
import { audit } from '@/lib/audit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const STAGES = ['announced', 'foundation', 'structure', 'finishing', 'ready', 'handover'];

export async function POST(req: NextRequest) {
  const denied = await guardAdmin(req);
  if (denied) return denied;
  await ensureSchema();
  const body = await req.json();
  const customer_id = Number(body.customer_id);
  const project_id = Number(body.project_id);
  if (!customer_id || !project_id)
    return NextResponse.json({ ok: false, message: 'customer_id and project_id required.' }, { status: 400 });

  const r = await getDb().execute({
    sql: `INSERT INTO customer_units (customer_id, booking_id, project_id, tower_unit, configuration,
            carpet_area_sqft, total_value, construction_stage, expected_possession)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`,
    args: [
      customer_id,
      body.booking_id ? Number(body.booking_id) : null,
      project_id,
      sanitizeText(body.tower_unit, 50),
      sanitizeText(body.configuration, 40),
      Number(body.carpet_area_sqft || 0),
      Number(body.total_value || 0),
      STAGES.includes(body.construction_stage) ? body.construction_stage : 'announced',
      sanitizeText(body.expected_possession || '', 20),
    ],
  });
  const id = (r.rows[0] as any)?.id;
  await audit('admin.customer_unit_created', { id, customer_id });
  return NextResponse.json({ ok: true, id });
}
