import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';

const bucket = process.env.S3_BUCKET ?? 'designai';
const publicUrl = process.env.S3_PUBLIC_URL ?? 'http://localhost:9000/designai';

const s3 = new S3Client({
  region: process.env.S3_REGION ?? 'auto',
  endpoint: process.env.S3_ENDPOINT,
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID ?? '',
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? '',
  },
});

export async function uploadBuffer(buffer: Buffer, folder: string, ext = 'png') {
  const key = `${folder}/${randomUUID()}.${ext}`;
  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: `image/${ext}`,
      CacheControl: 'public, max-age=31536000, immutable',
    }),
  );
  return `${publicUrl}/${key}`;
}
