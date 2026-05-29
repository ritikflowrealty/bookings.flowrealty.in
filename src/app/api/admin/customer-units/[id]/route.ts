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

const STAGES = ['announced', 'foundation', 'structure', 'finishing', 'ready', 'handover'];

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await guardAdmin(req);
  if (denied) return denied;
  await ensureSchema();
  const { id: idStr } = await params;
  const id = Number(idStr);
  const body = await req.json();
  const updates: string[] = [];
  const args: (string | number)[] = [];
  let stageChange: string | null = null;
  if (body.tower_unit !== undefined) { updates.push('tower_unit = ?'); args.push(sanitizeText(body.tower_unit, 50)); }
  if (body.configuration !== undefined) { updates.push('configuration = ?'); args.push(sanitizeText(body.configuration, 40)); }
  if (body.carpet_area_sqft !== undefined) { updates.push('carpet_area_sqft = ?'); args.push(Number(body.carpet_area_sqft)); }
  if (body.total_value !== undefined) { updates.push('total_value = ?'); args.push(Number(body.total_value)); }
  if (body.construction_stage !== undefined && STAGES.includes(body.construction_stage)) {
    updates.push('construction_stage = ?');
    args.push(body.construction_stage);
    stageChange = body.construction_stage;
  }
  if (body.expected_possession !== undefined) { updates.push('expected_possession = ?'); args.push(sanitizeText(body.expected_possession, 20)); }
  if (updates.length === 0) return NextResponse.json({ ok: false, message: 'Nothing to update.' }, { status: 400 });
  args.push(id);
  await getDb().execute({ sql: `UPDATE customer_units SET ${updates.join(', ')} WHERE id = ?`, args });
  await audit('admin.customer_unit_updated', { id, stage: stageChange });

  // Construction stage update → WhatsApp the customer
  if (stageChange) {
    void (async () => {
      try {
        const r = await getDb().execute({
          sql: `SELECT u.tower_unit, u.project_id,
                       c.full_name AS customer_name, c.mobile AS customer_mobile, c.email AS customer_email
                FROM customer_units u
                LEFT JOIN customer_users c ON c.id = u.customer_id
                WHERE u.id = ? LIMIT 1`,
          args: [id],
        });
        const row = r.rows[0] as any;
        if (!row || !row.project_id) return;
        const project = await getProjectById(row.project_id);
        if (!project) return;
        const s = await getSettings();
        const us = buildUsRecipients(setting(s, 'internal_whatsapp_numbers', ''));
        await notifyGallabox({
          project,
          event: {
            event: 'construction.stage_updated',
            title: `Construction: ${stageChange}`,
            data: {
              tower_unit: row.tower_unit || '',
              stage: stageChange,
              customer_name: row.customer_name || '',
              customer_phone: row.customer_mobile || '',
            },
          },
          recipients: [
            { role: 'customer', phone: row.customer_mobile || '', name: row.customer_name || '' },
            ...us,
          ],
        });
      } catch (err: any) {
        console.error('[gallabox] construction stage notify failed:', err?.message || err);
      }
    })();
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await guardAdmin(req);
  if (denied) return denied;
  const { id: idStr } = await params;
  const id = Number(idStr);
  await getDb().execute({ sql: `DELETE FROM customer_units WHERE id = ?`, args: [id] });
  await audit('admin.customer_unit_deleted', { id });
  return NextResponse.json({ ok: true });
}
