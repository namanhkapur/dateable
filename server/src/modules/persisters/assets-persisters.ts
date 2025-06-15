import { Context } from '../../config/context';
import { BaseModel } from '../../database/base-model';
import DatabaseAssets, { DatabaseAssetsInitializer, DatabaseAssetsId } from '../../types/database/DatabaseAssets';
import { DatabaseUsersId } from '../../types/database/DatabaseUsers';

export interface AssetsModel extends DatabaseAssets {}

export class AssetsModel extends BaseModel {
  static override tableName = 'public.assets';
}

/**
 * Upserts a single asset by the unique "url" field.
 */
const upsertAsset = async (
  context: Context,
  asset: DatabaseAssetsInitializer,
): Promise<DatabaseAssets> => {
  return await context.databaseService
    .query(AssetsModel)
    .insert(asset)
    .onConflict('url')
    .merge()
    .returning('*')
    .first();
};

/**
 * Get an asset by its ID.
 */
const getAssetById = async (
  context: Context,
  id: DatabaseAssetsId,
): Promise<DatabaseAssets | undefined> => {
  return await context.databaseService
    .query(AssetsModel)
    .where({ id })
    .first();
};

/**
 * Get assets by uploader user ID.
 */
const getAssetsByUploaderId = async (
  context: Context,
  uploadedBy: DatabaseUsersId,
): Promise<DatabaseAssets[]> => {
  return await context.databaseService
    .query(AssetsModel)
    .where({ uploadedBy })
    .orderBy('id', 'desc');
};

/**
 * Get assets by type.
 */
const getAssetsByType = async (
  context: Context,
  type: string,
): Promise<DatabaseAssets[]> => {
  return await context.databaseService
    .query(AssetsModel)
    .where({ type })
    .orderBy('id', 'desc');
};

/**
 * Create a new asset.
 */
const createAsset = async (
  context: Context,
  asset: DatabaseAssetsInitializer,
): Promise<DatabaseAssets> => {
  return await context.databaseService
    .query(AssetsModel)
    .insert(asset)
    .returning('*')
    .first();
};

/**
 * Update an asset by ID.
 */
const updateAsset = async (
  context: Context,
  id: DatabaseAssetsId,
  updates: Partial<Pick<DatabaseAssets, 'type' | 'url' | 'caption'>>,
): Promise<DatabaseAssets> => {
  return await context.databaseService
    .query(AssetsModel)
    .where({ id })
    .update(updates)
    .throwIfNotFound()
    .returning('*')
    .first();
};

/**
 * Delete an asset by ID.
 */
const deleteAsset = async (
  context: Context,
  id: DatabaseAssetsId,
): Promise<boolean> => {
  const deletedCount = await context.databaseService
    .query(AssetsModel)
    .where({ id })
    .delete();
  return deletedCount > 0;
};

export const AssetsPersister = {
  upsertAsset,
  getAssetById,
  getAssetsByUploaderId,
  getAssetsByType,
  createAsset,
  updateAsset,
  deleteAsset,
};
