/**
 * Public endpoint that returns a pre-signed PUT URL the browser uploads a CV to
 * directly. Only PDF / DOCX are allowed. The R2 object lands under the `cv/`
 * prefix so it's easy to spot and lifecycle-rule separately if you want.
 *
 * No auth — these come from public job applicants — but we constrain by mime
 * type and filename length to keep abuse surface small.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getUploadUrl } from '@/lib/r2';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ALLOWED_MIME = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

export async function POST(req: NextRequest) {
  try {
    const { filename, contentType } = await req.json();

    if (typeof filename !== 'string' || typeof contentType !== 'string') {
      return NextResponse.json(
        { ok: false, message: 'Invalid request payload.' },
        { status: 400 }
      );
    }
    if (!ALLOWED_MIME.has(contentType)) {
      return NextResponse.json(
        { ok: false, message: 'Please upload your CV as PDF, DOC or DOCX.' },
        { status: 400 }
      );
    }
    if (filename.length > 200) {
      return NextResponse.json(
        { ok: false, message: 'File name is too long.' },
        { status: 400 }
      );
    }

    const out = await getUploadUrl({
      type: 'cv',
      filename,
      contentType,
      expiresInSeconds: 600,
    });

    return NextResponse.json({
      ok: true,
      uploadUrl: out.uploadUrl,
      publicUrl: out.publicUrl,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, message: err?.message || 'Could not generate upload URL.' },
      { status: 500 }
    );
  }
}
