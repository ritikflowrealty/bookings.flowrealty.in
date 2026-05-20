import { NextRequest, NextResponse } from 'next/server';
import { getUploadUrl } from '@/lib/r2';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ALLOWED_SLOTS = new Set(['rera_doc', 'aadhaar_doc', 'pan_doc', 'photo']);

export async function POST(req: NextRequest) {
  try {
    const { slot, filename, contentType } = await req.json();
    if (!ALLOWED_SLOTS.has(slot)) {
      return NextResponse.json({ ok: false, message: 'Invalid slot.' }, { status: 400 });
    }
    if (typeof filename !== 'string' || typeof contentType !== 'string') {
      return NextResponse.json({ ok: false, message: 'Bad payload.' }, { status: 400 });
    }
    if (
      !['image/png', 'image/jpeg', 'image/webp', 'application/pdf'].includes(contentType)
    ) {
      return NextResponse.json({ ok: false, message: 'Unsupported file type.' }, { status: 400 });
    }
    const out = await getUploadUrl({
      type: 'cp-documents',
      filename,
      contentType,
      expiresInSeconds: 600,
    });
    return NextResponse.json({ ok: true, uploadUrl: out.uploadUrl, publicUrl: out.publicUrl });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, message: err?.message || 'Could not generate upload URL.' },
      { status: 500 }
    );
  }
}
