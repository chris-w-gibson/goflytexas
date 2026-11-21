/**
 * One-time set-up for the media bucket: let the browser send files straight
 * to it from the site (a signed upload is a cross-origin PUT). Re-run after
 * the site's address changes.
 *
 *   MEDIA_BUCKET=… MEDIA_ENDPOINT=… MEDIA_ACCESS_KEY_ID=… MEDIA_SECRET_ACCESS_KEY=… \
 *     npx tsx scripts/media-bucket-cors.ts https://www.goflytexas.com [more origins…]
 */
import { GetBucketCorsCommand, PutBucketCorsCommand, S3Client } from '@aws-sdk/client-s3';
import { mediaStorage } from '../lib/media/storage';

async function main() {
  const origins = process.argv.slice(2);
  const s = mediaStorage();
  if (!s || s.driver !== 's3') throw new Error('MEDIA_BUCKET, MEDIA_ENDPOINT and the two keys are required');
  if (origins.length === 0) throw new Error('give at least one origin, e.g. https://www.goflytexas.com');
  const client = new S3Client({
    region: s.region,
    endpoint: s.endpoint,
    credentials: { accessKeyId: s.accessKeyId, secretAccessKey: s.secretAccessKey },
  });
  await client.send(
    new PutBucketCorsCommand({
      Bucket: s.bucket,
      CORSConfiguration: {
        CORSRules: [
          {
            AllowedOrigins: origins,
            AllowedMethods: ['PUT', 'GET', 'HEAD'],
            AllowedHeaders: ['*'],
            ExposeHeaders: ['ETag'],
            MaxAgeSeconds: 3000,
          },
        ],
      },
    }),
  );
  const now = await client.send(new GetBucketCorsCommand({ Bucket: s.bucket }));
  console.log(JSON.stringify(now.CORSRules, null, 2));
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
