/**
 * Generic CMS list/create endpoint for marketing entities. Each entity maps to a
 * known DB table, with a known set of safe fields. Every entity has the same
 * basic shape: list (GET) and create (POST).
 *
 * Entities: team / awards / news / case-studies / testimonials / faqs / pages
 */
import { NextRequest, NextResponse } from 'next/server';
import { ensureSchema, getDb } from '@/lib/db';
import { guardAdmin } from '@/lib/guard';
import { sanitizeText } from '@/lib/validation';
import { audit } from '@/lib/audit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type EntityConfig = {
  table: string;
  selectColumns: string;
  insertColumns: string[];
  buildArgs: (b: any) => (string | number | null)[];
  orderBy: string;
};

function configs(): Record<string, EntityConfig> {
  return {
    team: {
      table: 'team_members',
      selectColumns: '*',
      insertColumns: ['slug', 'name', 'designation', 'category', 'photo_url', 'cutout_url', 'bio', 'pedigree', 'linkedin_url', 'display_order', 'is_published'],
      buildArgs: (b) => [
        slugify(sanitizeText(b.slug || b.name, 80)),
        sanitizeText(b.name, 120),
        sanitizeText(b.designation, 120),
        ['leadership', 'cofounder', 'team'].includes(b.category) ? b.category : 'team',
        sanitizeText(b.photo_url || '', 500),
        sanitizeText(b.cutout_url || '', 500),
        sanitizeText(b.bio || '', 2000),
        sanitizeText(b.pedigree || '', 500),
        sanitizeText(b.linkedin_url || '', 500),
        Number(b.display_order || 0),
        b.is_published === false ? 0 : 1,
      ],
      orderBy: 'display_order, name',
    },
    awards: {
      table: 'awards',
      selectColumns: '*',
      insertColumns: ['title', 'awarding_body', 'year', 'image_url', 'description', 'display_order', 'is_published'],
      buildArgs: (b) => [
        sanitizeText(b.title, 200),
        sanitizeText(b.awarding_body, 200),
        b.year ? Number(b.year) : null,
        sanitizeText(b.image_url || '', 500),
        sanitizeText(b.description || '', 1000),
        Number(b.display_order || 0),
        b.is_published === false ? 0 : 1,
      ],
      orderBy: 'display_order, year DESC',
    },
    news: {
      table: 'news_items',
      selectColumns: '*',
      insertColumns: ['slug', 'title', 'category', 'excerpt', 'content', 'cover_image_url', 'external_url', 'author', 'meta_title', 'meta_description', 'published_at', 'is_published'],
      buildArgs: (b) => [
        slugify(sanitizeText(b.slug || b.title, 80)),
        sanitizeText(b.title, 200),
        ['news', 'blog', 'press'].includes(b.category) ? b.category : 'news',
        sanitizeText(b.excerpt || '', 500),
        sanitizeText(b.content || '', 50000),
        sanitizeText(b.cover_image_url || '', 500),
        sanitizeText(b.external_url || '', 500),
        sanitizeText(b.author || '', 120),
        sanitizeText(b.meta_title || '', 200),
        sanitizeText(b.meta_description || '', 300),
        sanitizeText(b.published_at || new Date().toISOString(), 30),
        b.is_published === false ? 0 : 1,
      ],
      orderBy: 'published_at DESC, id DESC',
    },
    'case-studies': {
      table: 'case_studies',
      selectColumns: '*',
      insertColumns: ['slug', 'title', 'subtitle', 'client_name', 'cover_image_url', 'excerpt', 'content',
                      'metric_1_label', 'metric_1_value', 'metric_2_label', 'metric_2_value', 'metric_3_label', 'metric_3_value',
                      'meta_title', 'meta_description', 'display_order', 'is_published'],
      buildArgs: (b) => [
        slugify(sanitizeText(b.slug || b.title, 80)),
        sanitizeText(b.title, 200),
        sanitizeText(b.subtitle || '', 300),
        sanitizeText(b.client_name || '', 120),
        sanitizeText(b.cover_image_url || '', 500),
        sanitizeText(b.excerpt || '', 500),
        sanitizeText(b.content || '', 50000),
        sanitizeText(b.metric_1_label || '', 80),
        sanitizeText(b.metric_1_value || '', 40),
        sanitizeText(b.metric_2_label || '', 80),
        sanitizeText(b.metric_2_value || '', 40),
        sanitizeText(b.metric_3_label || '', 80),
        sanitizeText(b.metric_3_value || '', 40),
        sanitizeText(b.meta_title || '', 200),
        sanitizeText(b.meta_description || '', 300),
        Number(b.display_order || 0),
        b.is_published === false ? 0 : 1,
      ],
      orderBy: 'display_order, id DESC',
    },
    testimonials: {
      table: 'testimonials',
      selectColumns: '*',
      insertColumns: ['client_name', 'designation', 'company', 'photo_url', 'quote', 'rating', 'display_order', 'is_published'],
      buildArgs: (b) => [
        sanitizeText(b.client_name, 120),
        sanitizeText(b.designation || '', 120),
        sanitizeText(b.company || '', 120),
        sanitizeText(b.photo_url || '', 500),
        sanitizeText(b.quote, 1000),
        Number(b.rating || 5),
        Number(b.display_order || 0),
        b.is_published === false ? 0 : 1,
      ],
      orderBy: 'display_order, id DESC',
    },
    faqs: {
      table: 'faqs',
      selectColumns: '*',
      insertColumns: ['scope', 'scope_ref_id', 'question', 'answer', 'display_order', 'is_published'],
      buildArgs: (b) => [
        ['global', 'location', 'configuration', 'budget', 'project'].includes(b.scope) ? b.scope : 'global',
        b.scope_ref_id ? Number(b.scope_ref_id) : null,
        sanitizeText(b.question, 300),
        sanitizeText(b.answer, 2000),
        Number(b.display_order || 0),
        b.is_published === false ? 0 : 1,
      ],
      orderBy: 'scope, display_order',
    },
    pages: {
      table: 'pages',
      selectColumns: '*',
      insertColumns: ['slug', 'title', 'hero_image_url', 'hero_video_url', 'content', 'meta_title', 'meta_description', 'is_published'],
      buildArgs: (b) => [
        slugify(sanitizeText(b.slug || b.title, 80)),
        sanitizeText(b.title, 200),
        sanitizeText(b.hero_image_url || '', 500),
        sanitizeText(b.hero_video_url || '', 500),
        sanitizeText(b.content || '', 100000),
        sanitizeText(b.meta_title || '', 200),
        sanitizeText(b.meta_description || '', 300),
        b.is_published === false ? 0 : 1,
      ],
      orderBy: 'title',
    },
    partners: {
      table: 'partners',
      selectColumns: '*',
      insertColumns: ['name', 'category', 'logo_url', 'website_url', 'display_order', 'is_published'],
      buildArgs: (b) => [
        sanitizeText(b.name, 120),
        ['developer', 'banking', 'channel'].includes(b.category) ? b.category : 'developer',
        sanitizeText(b.logo_url || '', 500),
        sanitizeText(b.website_url || '', 500),
        Number(b.display_order || 0),
        b.is_published === false ? 0 : 1,
      ],
      orderBy: 'category, display_order, name',
    },
  };
}

function slugify(s: string): string {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ entity: string }> }) {
  const denied = await guardAdmin(req);
  if (denied) return denied;
  await ensureSchema();
  const { entity } = await params;
  const cfg = configs()[entity];
  if (!cfg) return NextResponse.json({ ok: false, message: 'Unknown entity.' }, { status: 404 });
  const r = await getDb().execute(`SELECT ${cfg.selectColumns} FROM ${cfg.table} ORDER BY ${cfg.orderBy}`);
  return NextResponse.json({ ok: true, items: r.rows });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ entity: string }> }) {
  const denied = await guardAdmin(req);
  if (denied) return denied;
  await ensureSchema();
  const { entity } = await params;
  const cfg = configs()[entity];
  if (!cfg) return NextResponse.json({ ok: false, message: 'Unknown entity.' }, { status: 404 });

  const body = await req.json();
  const args = cfg.buildArgs(body);
  const placeholders = cfg.insertColumns.map(() => '?').join(', ');

  try {
    const r = await getDb().execute({
      sql: `INSERT INTO ${cfg.table} (${cfg.insertColumns.join(', ')}) VALUES (${placeholders}) RETURNING id`,
      args,
    });
    const id = (r.rows[0] as any)?.id;
    await audit('admin.content_created', { entity, id });
    return NextResponse.json({ ok: true, id });
  } catch (err: any) {
    if (String(err?.message || '').includes('UNIQUE')) {
      return NextResponse.json({ ok: false, message: 'Slug already exists.' }, { status: 409 });
    }
    return NextResponse.json({ ok: false, message: err?.message || 'Could not create.' }, { status: 500 });
  }
}
