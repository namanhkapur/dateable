import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import { env } from '../config/env';

interface S3UploadResult {
  url: string;
  key: string;
  bucket: string;
}

interface S3UploadOptions {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
  folder?: string;
}

class S3Service {
  private s3Client: S3Client;
  private bucket: string;

  constructor() {
    this.bucket = env.AWS_S3_BUCKET;
    
    const config: any = {
      region: env.AWS_REGION,
    };

    // Use environment variables for AWS credentials if provided
    if (env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY) {
      config.credentials = {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      };
    }
    // Otherwise, SDK will use default credential chain (IAM roles, etc.)

    this.s3Client = new S3Client(config);
  }

  /**
   * Upload a file to S3 and return a presigned URL (no ACL required)
   */
  async uploadFile(options: S3UploadOptions): Promise<S3UploadResult> {
    const { buffer, originalName, mimeType, folder = 'uploads' } = options;
    
    // Generate a unique filename
    const fileExtension = originalName.split('.').pop() || '';
    const fileName = `${uuidv4()}.${fileExtension}`;
    const key = `${folder}/${fileName}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
      // No ACL setting - bucket doesn't support ACLs
    });

    await this.s3Client.send(command);

    // Generate a presigned URL for accessing the file (valid for 7 days by default)
    const url = await this.getPresignedDownloadUrl(key, 7 * 24 * 3600); // 7 days

    return {
      url,
      key,
      bucket: this.bucket,
    };
  }

  /**
   * Generate a presigned URL for downloading a file
   */
  async getPresignedDownloadUrl(key: string, expiresIn: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return await getSignedUrl(this.s3Client, command, { expiresIn });
  }

  /**
   * Generate a presigned URL for uploading a file (useful for direct browser uploads)
   */
  async getPresignedUploadUrl(key: string, contentType: string, expiresIn: number = 3600): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });

    return await getSignedUrl(this.s3Client, command, { expiresIn });
  }

  /**
   * Extract the S3 key from a full S3 URL (handles both direct URLs and presigned URLs)
   */
  extractKeyFromUrl(url: string): string | null {
    try {
      const urlObj = new URL(url);
      
      // Handle standard S3 URLs
      const bucketUrl = `https://${this.bucket}.s3.${env.AWS_REGION}.amazonaws.com/`;
      if (url.startsWith(bucketUrl)) {
        return url.substring(bucketUrl.length).split('?')[0]; // Remove query params
      }
      
      // Handle presigned URLs - extract key from the pathname
      if (urlObj.hostname.includes('s3') && urlObj.hostname.includes(env.AWS_REGION)) {
        // For presigned URLs like https://bucket.s3.region.amazonaws.com/path/file.ext?...
        return urlObj.pathname.substring(1); // Remove leading slash
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }
}

export const s3Service = new S3Service();
