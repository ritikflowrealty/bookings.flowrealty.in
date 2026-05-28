/**
 * Cloudflare R2 helpers (S3-compatible API).
 *
 * Configure via env vars:
 *   R2_ACCOUNT_ID
 *   R2_ACCESS_KEY_ID
 *   R2_SECRET_ACCESS_KEY
 *   R2_BUCKET            (e.g. flowrealty-assets)
 *   R2_PUBLIC_URL        (e.g. https://pub-xxxx.r2.dev or your custom CDN domain)
 *
 * Two helpers:
 *   getUploadUrl()   — produces a pre-signed PUT URL the browser uploads to directly
 *   uploadObject()   — server-side direct upload (for system-generated assets)
 */
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

let _client: S3Client | null = null;

function client(): S3Client {
  if (_client) return _client;
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error('R2 credentials not configured. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY.');
  }

  _client = new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
  return _client;
}

export type UploadType =
  | 'cp-documents'
  | 'project-images'
  | 'project-brochures'
  | 'team-photos'
  | 'news'
  | 'cv'
  | 'misc';

export function bucket(): string {
  const b = process.env.R2_BUCKET;
  if (!b) throw new Error('R2_BUCKET not configured');
  return b;
}

export function publicUrl(key: string): string {
  const base = process.env.R2_PUBLIC_URL || '';
  if (!base) return key;
  return `${base.replace(/\/$/, '')}/${key}`;
}

/**
 * Produce a pre-signed PUT URL the browser uploads to directly.
 * Saves a round-trip through our own server.
 */
export async function getUploadUrl(args: {
  type: UploadType;
  filename: string;
  contentType: string;
  expiresInSeconds?: number;
}): Promise<{ uploadUrl: string; publicUrl: string; key: string }> {
  const safeName = args.filename.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 120);
  const key = `${args.type}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`;
  const cmd = new PutObjectCommand({
    Bucket: bucket(),
    Key: key,
    ContentType: args.contentType,
  });
  const uploadUrl = await getSignedUrl(client(), cmd, {
    expiresIn: args.expiresInSeconds || 600,
  });
  return { uploadUrl, publicUrl: publicUrl(key), key };
}

/**
 * Server-side upload (when we already have the bytes).
 */
export async function uploadObject(args: {
  type: UploadType;
  filename: string;
  contentType: string;
  body: Buffer | Uint8Array;
}): Promise<{ publicUrl: string; key: string }> {
  const safeName = args.filename.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 120);
  const key = `${args.type}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`;
  await client().send(
    new PutObjectCommand({
      Bucket: bucket(),
      Key: key,
      Body: args.body,
      ContentType: args.contentType,
    })
  );
  return { publicUrl: publicUrl(key), key };
}
