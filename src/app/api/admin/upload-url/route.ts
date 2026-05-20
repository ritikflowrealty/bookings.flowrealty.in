import { NextRequest, NextResponse } from 'next/server';
import { guardAdmin } from '@/lib/guard';
import { getUploadUrl, type UploadType } from '@/lib/r2';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ALLOWED_TYPES = new Set<UploadType>(['cp-documents', 'project-images', 'project-brochures', 'team-photos', 'news', 'misc']);
const ALLOWED_MIME = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'application/pdf', 'video/mp4', 'video/webm'];

export async function POST(req: NextRequest) {
  const denied = await guardAdmin(req);
  if (denied) return denied;

  const body = await req.json();
  const type = (body.type || 'misc') as UploadType;
  if (!ALLOWED_TYPES.has(type)) {
    return NextResponse.json({ ok: false, message: 'Invalid upload type.' }, { status: 400 });
  }
  if (!ALLOWED_MIME.includes(body.contentType)) {
    return NextResponse.json({ ok: false, message: 'Unsupported file type.' }, { status: 400 });
  }
  try {
    const out = await getUploadUrl({
      type,
      filename: String(body.filename || 'upload'),
      contentType: String(body.contentType),
      expiresInSeconds: 600,
    });
    return NextResponse.json({ ok: true, uploadUrl: out.uploadUrl, publicUrl: out.publicUrl });
  } catch (err: any) {
    return NextResponse.json({ ok: false, message: err?.message || 'R2 not configured.' }, { status: 500 });
  }
}
