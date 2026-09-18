import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly publicUrl: string;

  constructor(private config: ConfigService) {
    this.bucket = config.get('S3_BUCKET') ?? 'designai';
    this.publicUrl = config.get('S3_PUBLIC_URL') ?? 'http://localhost:9000/designai';
    this.s3 = new S3Client({
      region: config.get('S3_REGION') ?? 'auto',
      endpoint: config.get('S3_ENDPOINT'),
      forcePathStyle: true,
      credentials: {
        accessKeyId: config.get('S3_ACCESS_KEY_ID') ?? '',
        secretAccessKey: config.get('S3_SECRET_ACCESS_KEY') ?? '',
      },
    });
  }

  /** Uploads a buffer and returns its public URL. */
  async upload(buffer: Buffer, opts: { folder: string; contentType?: string; ext?: string }) {
    const key = `${opts.folder}/${randomUUID()}.${opts.ext ?? 'png'}`;
    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: opts.contentType ?? 'image/png',
        CacheControl: 'public, max-age=31536000, immutable',
      }),
    );
    this.logger.log(`Uploaded ${key}`);
    return `${this.publicUrl}/${key}`;
  }

  async uploadDataUrl(dataUrl: string, folder: string) {
    const match = /^data:(.+?);base64,(.*)$/.exec(dataUrl);
    if (!match) throw new Error('Invalid data URL');
    const [, mime, b64] = match;
    return this.upload(Buffer.from(b64, 'base64'), {
      folder,
      contentType: mime,
      ext: mime.split('/')[1],
    });
  }
}
