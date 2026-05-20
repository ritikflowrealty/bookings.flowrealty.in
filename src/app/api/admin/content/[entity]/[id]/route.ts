import { NextRequest, NextResponse } from 'next/server';
import { ensureSchema, getDb } from '@/lib/db';
import { guardAdmin } from '@/lib/guard';
import { sanitizeText } from '@/lib/validation';
import { audit } from '@/lib/audit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const TABLE_MAP: Record<string, { table: string; allowedColumns: string[] }> = {
  team: {
    table: 'team_members',
    allowedColumns: ['name', 'designation', 'category', 'photo_url', 'bio', 'linkedin_url', 'display_order', 'is_published'],
  },
  awards: {
    table: 'awards',
    allowedColumns: ['title', 'awarding_body', 'year', 'image_url', 'description', 'display_order', 'is_published'],
  },
  news: {
    table: 'news_items',
    allowedColumns: ['title', 'category', 'excerpt', 'content', 'cover_image_url', 'external_url', 'author', 'meta_title', 'meta_description', 'published_at', 'is_published'],
  },
  'case-studies': {
    table: 'case_studies',
    allowedColumns: ['title', 'subtitle', 'client_name', 'cover_image_url', 'excerpt', 'content',
                     'metric_1_label', 'metric_1_value', 'metric_2_label', 'metric_2_value', 'metric_3_label', 'metric_3_value',
                     'meta_title', 'meta_description', 'display_order', 'is_published'],
  },
  testimonials: {
    table: 'testimonials',
    allowedColumns: ['client_name', 'designation', 'company', 'photo_url', 'quote', 'rating', 'display_order', 'is_published'],
  },
  faqs: {
    table: 'faqs',
    allowedColumns: ['scope', 'scope_ref_id', 'question', 'answer', 'display_order', 'is_published'],
  },
  pages: {
    table: 'pages',
    allowedColumns: ['title', 'hero_image_url', 'hero_video_url', 'content', 'meta_title', 'meta_description', 'is_published'],
  },
};

const SANITIZE_LIMITS: Record<string, number> = {
  name: 120, designation: 120, photo_url: 500, bio: 1000, linkedin_url: 500,
  title: 200, awarding_body: 200, image_url: 500, description: 1000,
  category: 40, excerpt: 500, content: 100000, cover_image_url: 500, external_url: 500,
  author: 120, meta_title: 200, meta_description: 300, published_at: 30,
  subtitle: 300, client_name: 120, quote: 1000, scope: 40, question: 300, answer: 2000,
  hero_image_url: 500, hero_video_url: 500,
  metric_1_label: 80, metric_1_value: 40, metric_2_label: 80, metric_2_value: 40,
  metric_3_label: 80, metric_3_value: 40, company: 120,
};

function isNumberField(col: string): boolean {
  return ['display_order', 'is_published', 'year', 'rating', 'scope_ref_id'].includes(col);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ entity: string; id: string }> }) {
  const denied = await guardAdmin(req);
  if (denied) return denied;
  await ensureSchema();
  const { entity, id: idStr } = await params;
  const cfg = TABLE_MAP[entity];
  if (!cfg) return NextResponse.json({ ok: false, message: 'Unknown entity.' }, { status: 404 });
  const id = Number(idStr);
  if (!id) return NextResponse.json({ ok: false, message: 'Invalid id.' }, { status: 400 });

  const body = await req.json();
  const updates: string[] = [];
  const args: (string | number | null)[] = [];

  for (const col of cfg.allowedColumns) {
    if (body[col] === undefined) continue;
    if (isNumberField(col)) {
      const n = Number(body[col]);
      updates.push(`${col} = ?`);
      args.push(Number.isFinite(n) ? n : 0);
    } else {
      const limit = SANITIZE_LIMITS[col] || 200;
      updates.push(`${col} = ?`);
      args.push(sanitizeText(body[col] || '', limit));
    }
  }
  if (updates.length === 0) return NextResponse.json({ ok: false, message: 'Nothing to update.' }, { status: 400 });
  args.push(id);
  await getDb().execute({ sql: `UPDATE ${cfg.table} SET ${updates.join(', ')} WHERE id = ?`, args });
  await audit('admin.content_updated', { entity, id });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ entity: string; id: string }> }) {
  const denied = await guardAdmin(req);
  if (denied) return denied;
  const { entity, id: idStr } = await params;
  const cfg = TABLE_MAP[entity];
  if (!cfg) return NextResponse.json({ ok: false, message: 'Unknown entity.' }, { status: 404 });
  const id = Number(idStr);
  if (!id) return NextResponse.json({ ok: false, message: 'Invalid id.' }, { status: 400 });
  await getDb().execute({ sql: `DELETE FROM ${cfg.table} WHERE id = ?`, args: [id] });
  await audit('admin.content_deleted', { entity, id });
  return NextResponse.json({ ok: true });
}
