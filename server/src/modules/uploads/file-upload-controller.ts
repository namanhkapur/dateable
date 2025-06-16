import { Request } from 'express';
import { Context } from '../../config/context';
import { Controller } from '../../utils/controller';
import { s3Service } from '../../services/s3-service';
import { AssetsPersister } from '../persisters/assets-persisters';
import { DatabaseUsersId } from '../../types/database/DatabaseUsers';
import DatabaseAssets, { DatabaseAssetsId } from '../../types/database/DatabaseAssets';
import { throwError } from '../../utils/error-handler';
import assert from '../../utils/assert-extensions';

interface FileUploadData {
  userId?: DatabaseUsersId;
  type?: string;
  caption?: string;
}

interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

interface RequestWithFiles extends Omit<Request, 'files'> {
  files?: MulterFile[];
}

/**
 * Map MIME types to database-allowed asset types
 */
const mapMimeTypeToAssetType = (mimeType: string): string => {
  if (mimeType.startsWith('image/')) {
    return 'photo';
  }
  if (mimeType.startsWith('video/')) {
    return 'video';
  }
  if (mimeType.startsWith('audio/')) {
    return 'voice';
  }
  // Default fallback for other types (PDF, text, etc.)
  // Since the database only allows 'photo', 'video', 'voice', we'll categorize documents as 'photo'
  // You might want to update the database schema to allow more types like 'document'
  return 'photo';
};

/**
 * Upload a single file to S3 and save asset record to database
 */
const uploadFile = async (context: Context, data: FileUploadData, req: RequestWithFiles): Promise<any> => {
  const files = req.files;
  
  if (!files || files.length === 0) {
    throwError('No file provided');
    return; // This will never be reached due to throwError
  }

  if (files.length > 1) {
    throwError('Only one file upload supported per request');
    return; // This will never be reached due to throwError
  }

  const file = files[0];
  
  // Validate file size (e.g., max 10MB)
  const maxSizeBytes = 10 * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    throwError('File size exceeds maximum allowed size of 10MB');
  }

  // Validate file type
  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
  ];
  
  if (!allowedMimeTypes.includes(file.mimetype)) {
    throwError(`File type ${file.mimetype} not allowed`);
  }

  try {
    // Upload to S3
    const s3Result = await s3Service.uploadFile({
      buffer: file.buffer,
      originalName: file.originalname,
      mimeType: file.mimetype,
      folder: 'user-uploads',
    });

    // Save asset record to database
    const asset = await AssetsPersister.upsertAsset(context, {
      url: s3Result.url,
      type: data.type || mapMimeTypeToAssetType(file.mimetype),
      caption: data.caption || null,
      uploadedBy: data.userId || null,
    });

    context.logger.info('File uploaded successfully', {
      assetId: asset.id,
      url: s3Result.url,
      originalName: file.originalname,
      size: file.size,
    });

    return {
      success: true,
      asset: {
        id: asset.id,
        url: asset.url,
        type: asset.type,
        caption: asset.caption,
        uploadedBy: asset.uploadedBy,
      },
      metadata: {
        originalName: file.originalname,
        size: file.size,
        mimeType: file.mimetype,
      },
    };
  } catch (error) {
    context.logger.error('File upload failed', { error: error });
    throwError('File upload failed');
  }
};

/**
 * Upload multiple files to S3 and save asset records to database
 */
const uploadMultipleFiles = async (context: Context, data: FileUploadData, req: RequestWithFiles): Promise<any> => {
  const files = req.files;
  
  if (!files || files.length === 0) {
    throwError('No files provided');
    return; // This will never be reached due to throwError
  }

  if (files.length > 10) {
    throwError('Maximum 10 files allowed per request');
    return; // This will never be reached due to throwError
  }

  const results = [];
  const errors = [];

  for (const file of files) {
    try {
      // Validate file size (e.g., max 10MB)
      const maxSizeBytes = 10 * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        errors.push({
          file: file.originalname,
          error: 'File size exceeds maximum allowed size of 10MB',
        });
        continue;
      }

      // Validate file type
      const allowedMimeTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf',
        'text/plain',
      ];
      
      if (!allowedMimeTypes.includes(file.mimetype)) {
        errors.push({
          file: file.originalname,
          error: `File type ${file.mimetype} not allowed`,
        });
        continue;
      }

      // Upload to S3
      const s3Result = await s3Service.uploadFile({
        buffer: file.buffer,
        originalName: file.originalname,
        mimeType: file.mimetype,
        folder: 'user-uploads',
      });

      // Save asset record to database
      const asset = await AssetsPersister.upsertAsset(context, {
        url: s3Result.url,
        type: data.type || mapMimeTypeToAssetType(file.mimetype),
        caption: data.caption || null,
        uploadedBy: data.userId || null,
      });

      results.push({
        success: true,
        asset: {
          id: asset.id,
          url: asset.url,
          type: asset.type,
          caption: asset.caption,
          uploadedBy: asset.uploadedBy,
        },
        metadata: {
          originalName: file.originalname,
          size: file.size,
          mimeType: file.mimetype,
        },
      });

      context.logger.info('File uploaded successfully', {
        assetId: asset.id,
        url: s3Result.url,
        originalName: file.originalname,
        size: file.size,
      });
    } catch (error) {
      context.logger.error('File upload failed for file', { 
        file: file.originalname,
        error: error 
      });
      errors.push({
        file: file.originalname,
        error: 'Upload failed',
      });
    }
  }

  return {
    success: errors.length === 0,
    uploaded: results,
    errors: errors,
    summary: {
      total: files.length,
      successful: results.length,
      failed: errors.length,
    },
  };
};

/**
 * Get asset information by ID
 */
const getAsset = async (context: Context, data: { assetId: DatabaseAssetsId }) => {
  const asset = await AssetsPersister.getAssetById(context, data.assetId);
  
  assert(asset, 'Asset not found');

  return {
    success: true,
    data: {
      id: asset.id,
      url: asset.url,
      type: asset.type,
      caption: asset.caption,
      uploadedBy: asset.uploadedBy,
    },
  };
};

/**
 * Get assets by uploader user ID
 */
const getAssetsByUser = async (context: Context, data: { userId: DatabaseUsersId }) => {
  const assets = await AssetsPersister.getAssetsByUploaderId(context, data.userId);
  
  return {
    assets: assets.map(asset => ({
      id: asset.id,
      url: asset.url,
      type: asset.type,
      caption: asset.caption,
      uploadedBy: asset.uploadedBy,
    })),
  };
};

/**
 * Get all assets (for admin/general listing)
 */
const getAllAssets = async (context: Context) => {
  const assets = await AssetsPersister.getAllAssets(context);
  
  return {
    success: true,
    data: assets.map((asset: DatabaseAssets) => ({
      id: asset.id,
      url: asset.url,
      type: asset.type,
      caption: asset.caption,
      uploadedBy: asset.uploadedBy,
      createdAt: new Date().toISOString(), // Using current date as placeholder since created_at is not available
      originalName: 'Unknown', // Database doesn't store original name, using placeholder
      fileSize: 0, // Database doesn't store file size, using placeholder  
      contentType: asset.type,
    })),
  };
};

/**
 * Generate a presigned URL for an asset
 */
const getPresignedUrl = async (context: Context, data: { assetId: DatabaseAssetsId }): Promise<any> => {
  const asset = await AssetsPersister.getAssetById(context, data.assetId);
  
  assert(asset, 'Asset not found');

  // Extract the S3 key from the asset URL
  const key = s3Service.extractKeyFromUrl(asset.url);
  
  if (!key) {
    throwError('Invalid asset URL format');
  }

  try {
    const presignedUrl = await s3Service.getPresignedDownloadUrl(key!);
    
    return {
      success: true,
      data: {
        presignedUrl,
        asset: {
          id: asset.id,
          type: asset.type,
          url: asset.url,
        },
      },
    };
  } catch (error) {
    context.logger.error('Failed to generate presigned URL', { 
      assetId: data.assetId,
      error: error 
    });
    throwError('Failed to generate presigned URL');
  }
};

export const FileUploadController = Controller.register({
  name: 'file-upload',
  controllers: {
    uploadFile: {
      fn: uploadFile,
      config: {},
    },
    uploadMultipleFiles: {
      fn: uploadMultipleFiles,
      config: {},
    },
    getAsset: {
      fn: getAsset,
      config: {},
    },
    getAssetsByUser: {
      fn: getAssetsByUser,
      config: {},
    },
    getAllAssets: {
      fn: getAllAssets,
      config: {},
    },
    getPresignedUrl: {
      fn: getPresignedUrl,
      config: {},
    },
  },
});
