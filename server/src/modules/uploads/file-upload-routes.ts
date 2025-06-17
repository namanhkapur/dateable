import express from 'express';
import multer from 'multer';
import { Context } from '../../config/context';
import { FileUploadController } from './file-upload-controller';
import { addPublicRoute, RequestWithContext } from '../../web/routes/router-helpers';
import { DatabaseUsersId } from '../../types/database/DatabaseUsers';
import { DatabaseAssetsId } from '../../types/database/DatabaseAssets';

export const router = express.Router();

// Multer configuration for file uploads
const fileUploadConfig = multer({ storage: multer.memoryStorage() }).any();

// Helper function to add file upload routes (keep this for file uploads)
const addFileUploadRoute = (
  path: string,
  handler: (context: Context, data: any, req: any) => Promise<any>
) => {
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  router.post(path, fileUploadConfig, async (req, res, next): Promise<void> => {
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

// POST /uploads/single - Upload a single file (keep file upload route)
addFileUploadRoute('/single', FileUploadController.uploadFile);

// POST /uploads/multiple - Upload multiple files (keep file upload route)
addFileUploadRoute('/multiple', FileUploadController.uploadMultipleFiles);

// POST /uploads/asset - Get asset information by ID
addPublicRoute(router, '/asset', async (context, data: { assetId: string }) => {
  const assetId = Number(data.assetId) as DatabaseAssetsId;
  return FileUploadController.getAsset(context, { assetId });
});

// POST /uploads/user-assets - Get assets by uploader user ID
addPublicRoute(router, '/user-assets', async (context, data: { userId: string }) => {
  const userId = Number(data.userId) as DatabaseUsersId;
  return FileUploadController.getAssetsByUser(context, { userId });
});

// POST /uploads/assets - Get all assets (for listing)
addPublicRoute(router, '/assets', FileUploadController.getAllAssets);

// POST /uploads/presigned-url - Get presigned URL for asset
addPublicRoute(router, '/presigned-url', async (context, data: { assetId: string }) => {
  const assetId = Number(data.assetId) as DatabaseAssetsId;
  return FileUploadController.getPresignedUrl(context, { assetId });
});
