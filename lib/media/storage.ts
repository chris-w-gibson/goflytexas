import { createReadStream } from 'node:fs';
import { mkdir, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { safeFilename } from './rules';

/**
 * Where media files live. Production: the Railway storage bucket (S3 API,
 * private — every read and write goes through a short-lived signed link, so
 * the browser talks to the bucket directly and a phone video never passes
 * through this server). Development: a folder on disk, served by the
 * /admin/media/local route, only when NODE_ENV is not production.
 */

type Env = Record<string, string | undefined>;

export type MediaStorage =
  | { driver: 's3'; bucket: string; endpoint: string; region: string; accessKeyId: string; secretAccessKey: string }
  | { driver: 'local'; dir: string };

export function mediaStorage(env: Env = process.env): MediaStorage | null {
  const bucket = env.MEDIA_BUCKET;
  const endpoint = env.MEDIA_ENDPOINT;
  const accessKeyId = env.MEDIA_ACCESS_KEY_ID;
  const secretAccessKey = env.MEDIA_SECRET_ACCESS_KEY;
  if (bucket && endpoint && accessKeyId && secretAccessKey) {
    return { driver: 's3', bucket, endpoint, region: env.MEDIA_REGION || 'auto', accessKeyId, secretAccessKey };
  }
  if (env.MEDIA_LOCAL_DIR && env.NODE_ENV !== 'production') {
    return { driver: 'local', dir: env.MEDIA_LOCAL_DIR };
  }
  return null;
}

const UPLOAD_SECONDS = 15 * 60;
const VIEW_SECONDS = 60 * 60;

let cached: { key: string; client: S3Client } | undefined;

function client(s: Extract<MediaStorage, { driver: 's3' }>): S3Client {
  const key = `${s.endpoint}|${s.bucket}|${s.accessKeyId}`;
  if (!cached || cached.key !== key) {
    cached = {
      key,
      client: new S3Client({
        region: s.region,
        endpoint: s.endpoint,
        credentials: { accessKeyId: s.accessKeyId, secretAccessKey: s.secretAccessKey },
        // A signed upload link must not demand a checksum header the browser never sends.
        requestChecksumCalculation: 'WHEN_REQUIRED',
        responseChecksumValidation: 'WHEN_REQUIRED',
      }),
    };
  }
  return cached.client;
}

function localPath(dir: string, key: string): string {
  const full = path.resolve(dir, key);
  if (!full.startsWith(path.resolve(dir) + path.sep)) throw new Error('key outside the media folder');
  return full;
}

function localUrl(key: string): string {
  return `/admin/media/local?key=${encodeURIComponent(key)}`;
}

/** A link the browser PUTs the file to. The content type is part of what is signed. */
export async function uploadUrl(s: MediaStorage, key: string, contentType: string): Promise<string> {
  if (s.driver === 'local') return localUrl(key);
  return getSignedUrl(client(s), new PutObjectCommand({ Bucket: s.bucket, Key: key, ContentType: contentType }), {
    expiresIn: UPLOAD_SECONDS,
    // Without this only the host is signed and the link takes any type.
    signableHeaders: new Set(['content-type']),
  });
}

/** A link that shows the file, or downloads it under `downloadAs`. */
export async function viewUrl(
  s: MediaStorage,
  key: string,
  opts: { contentType?: string; downloadAs?: string } = {},
): Promise<string> {
  if (s.driver === 'local') return localUrl(key);
  return getSignedUrl(
    client(s),
    new GetObjectCommand({
      Bucket: s.bucket,
      Key: key,
      ...(opts.contentType ? { ResponseContentType: opts.contentType } : {}),
      ...(opts.downloadAs
        ? { ResponseContentDisposition: `attachment; filename="${safeFilename(opts.downloadAs)}"` }
        : {}),
    }),
    { expiresIn: VIEW_SECONDS },
  );
}

/** Size of a stored file, or null when nothing is there (the upload never finished). */
export async function storedSize(s: MediaStorage, key: string): Promise<number | null> {
  if (s.driver === 'local') {
    return stat(localPath(s.dir, key)).then(
      (st) => st.size,
      () => null,
    );
  }
  try {
    const head = await client(s).send(new HeadObjectCommand({ Bucket: s.bucket, Key: key }));
    return head.ContentLength ?? null;
  } catch (err) {
    const status = (err as { $metadata?: { httpStatusCode?: number } }).$metadata?.httpStatusCode;
    if (status === 404 || status === 403) return null;
    throw err;
  }
}

export async function removeStored(s: MediaStorage, key: string): Promise<void> {
  if (s.driver === 'local') {
    await rm(localPath(s.dir, key), { force: true });
    return;
  }
  await client(s).send(new DeleteObjectCommand({ Bucket: s.bucket, Key: key }));
}

// ---------------------------------------------------------------- local driver (development only)

export async function writeLocal(s: MediaStorage, key: string, body: Buffer): Promise<void> {
  if (s.driver !== 'local') throw new Error('local storage is not in use');
  const full = localPath(s.dir, key);
  await mkdir(path.dirname(full), { recursive: true });
  await writeFile(full, body);
}

export async function readLocal(
  s: MediaStorage,
  key: string,
): Promise<{ stream: ReturnType<typeof createReadStream>; size: number } | null> {
  if (s.driver !== 'local') return null;
  const full = localPath(s.dir, key);
  const st = await stat(full).catch(() => null);
  if (!st) return null;
  return { stream: createReadStream(full), size: st.size };
}
