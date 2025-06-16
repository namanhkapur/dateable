import express from 'express';
import multer from 'multer';
import { Context } from '../../config/context';
import { FileUploadController } from './file-upload-controller';
import { RequestWithContext } from '../../web/routes/router-helpers';
import { DatabaseUsersId } from '../../types/database/DatabaseUsers';
import { DatabaseAssetsId } from '../../types/database/DatabaseAssets';

export const router = express.Router();

// Multer configuration for file uploads
const fileUploadConfig = multer({ storage: multer.memoryStorage() }).any();

interface FileUploadRequestBody {
  userId?: string;
  type?: string;
  caption?: string;
}

interface GetAssetRequestBody {
  assetId: string;
}

interface GetAssetsByUserRequestBody {
  userId: string;
}

// Helper function to add file upload routes
const addFileUploadRoute = (
  path: string,
  handler: (context: Context, data: any, req: any) => Promise<any>
) => {
  router.post(path, fileUploadConfig, async (req, res, next) => {
    try {
      const context = (req as RequestWithContext).context!;
      
      // Parse form data from body
      const formData = req.body;
      
      // Convert string values to proper types
      const data = {
        userId: formData.userId ? Number(formData.userId) as DatabaseUsersId : undefined,
        type: formData.type,
        caption: formData.caption,
      };

      const result = await handler(context, data, req);
      
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  });
};

// Helper function to add regular JSON routes
const addJsonRoute = (
  path: string,
  handler: (context: Context, data: any) => Promise<any>
) => {
  router.post(path, async (req, res, next) => {
    try {
      const context = (req as RequestWithContext).context!;
      const result = await handler(context, req.body);
      
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  });
};

// POST /uploads/single - Upload a single file
// This endpoint accepts multipart/form-data with files and optional metadata
addFileUploadRoute('/single', FileUploadController.uploadFile);

// POST /uploads/multiple - Upload multiple files
// This endpoint accepts multipart/form-data with files and optional metadata
addFileUploadRoute('/multiple', FileUploadController.uploadMultipleFiles);

// POST /uploads/asset - Get asset information by ID
addJsonRoute('/asset', async (context: Context, data: GetAssetRequestBody) => {
  const assetId = Number(data.assetId) as DatabaseAssetsId;
  return FileUploadController.getAsset(context, { assetId });
});

// POST /uploads/user-assets - Get assets by uploader user ID
addJsonRoute('/user-assets', async (context: Context, data: GetAssetsByUserRequestBody) => {
  const userId = Number(data.userId) as DatabaseUsersId;
  return FileUploadController.getAssetsByUser(context, { userId });
});

// GET /uploads/assets - Get all assets (for listing)
router.get('/assets', async (req, res, next) => {
  try {
    const context = (req as RequestWithContext).context!;
    const result = await FileUploadController.getAllAssets(context);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

// GET /uploads/asset/:id - Get asset information by ID
router.get('/asset/:id', async (req, res, next) => {
  try {
    const context = (req as RequestWithContext).context!;
    const assetId = Number(req.params.id) as DatabaseAssetsId;
    const result = await FileUploadController.getAsset(context, { assetId });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

// GET /uploads/asset/:id/presigned-url - Get presigned URL for asset
router.get('/asset/:id/presigned-url', async (req, res, next) => {
  try {
    const context = (req as RequestWithContext).context!;
    const assetId = Number(req.params.id) as DatabaseAssetsId;
    const result = await FileUploadController.getPresignedUrl(context, { assetId });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});
