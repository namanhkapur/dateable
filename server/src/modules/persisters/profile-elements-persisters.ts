import { Context } from '../../config/context';
import { BaseModel } from '../../database/base-model';
import DatabaseProfileElements, { DatabaseProfileElementsInitializer, DatabaseProfileElementsId } from '../../types/database/DatabaseProfileElements';
import { DatabaseProfileDraftsId } from '../../types/database/DatabaseProfileDrafts';
import { DatabaseAssetsId } from '../../types/database/DatabaseAssets';

export interface ProfileElementsModel extends DatabaseProfileElements {}

export class ProfileElementsModel extends BaseModel {
  static override tableName = 'public.profile_elements';
}

/**
 * Upserts a single profile element by the unique (profile_draft_id, position) constraint.
 */
const upsertProfileElement = async (
  context: Context,
  profileElement: DatabaseProfileElementsInitializer,
): Promise<DatabaseProfileElements> => context.databaseService
    .query(ProfileElementsModel)
    .insert(profileElement)
    .onConflict(['profile_draft_id', 'position'])
    .merge()
    .returning('*')
    .first();

/**
 * Get a profile element by its ID.
 */
const getProfileElementById = async (
  context: Context,
  id: DatabaseProfileElementsId,
): Promise<DatabaseProfileElements | undefined> => context.databaseService
    .query(ProfileElementsModel)
    .where({ id })
    .first();

/**
 * Get profile elements by profile draft ID, ordered by position.
 */
const getProfileElementsByProfileDraftId = async (
  context: Context,
  profileDraftId: DatabaseProfileDraftsId,
): Promise<DatabaseProfileElements[]> => context.databaseService
    .query(ProfileElementsModel)
    .where({ profileDraftId })
    .orderBy('position');

/**
 * Get profile elements by type.
 */
const getProfileElementsByType = async (
  context: Context,
  profileDraftId: DatabaseProfileDraftsId,
  type: string,
): Promise<DatabaseProfileElements[]> => context.databaseService
    .query(ProfileElementsModel)
    .where({ profileDraftId, type })
    .orderBy('position');

/**
 * Get profile elements that reference a specific asset.
 */
const getProfileElementsByAssetId = async (
  context: Context,
  assetId: DatabaseAssetsId,
): Promise<DatabaseProfileElements[]> => context.databaseService
    .query(ProfileElementsModel)
    .where({ assetId })
    .orderBy('id');

/**
 * Update a profile element by ID.
 */
const updateProfileElement = async (
  context: Context,
  id: DatabaseProfileElementsId,
  updates: Partial<Pick<DatabaseProfileElements, 'position' | 'type' | 'assetId' | 'prompt' | 'textResponse' | 'subResponses'>>,
): Promise<DatabaseProfileElements> => context.databaseService
    .query(ProfileElementsModel)
    .where({ id })
    .update(updates)
    .throwIfNotFound()
    .returning('*')
    .first();

/**
 * Update the position of a profile element.
 */
const updateProfileElementPosition = async (
  context: Context,
  id: DatabaseProfileElementsId,
  position: number,
): Promise<DatabaseProfileElements | undefined> => updateProfileElement(context, id, { position });

/**
 * Delete a profile element by ID.
 */
const deleteProfileElement = async (
  context: Context,
  id: DatabaseProfileElementsId,
): Promise<boolean> => {
  const deletedCount = await context.databaseService
    .query(ProfileElementsModel)
    .where({ id })
    .delete();
  return deletedCount > 0;
};

/**
 * Delete all profile elements for a profile draft.
 */
const deleteProfileElementsByProfileDraftId = async (
  context: Context,
  profileDraftId: DatabaseProfileDraftsId,
): Promise<number> => context.databaseService
    .query(ProfileElementsModel)
    .where({ profileDraftId })
    .delete();

export const ProfileElementsPersister = {
  upsertProfileElement,
  getProfileElementById,
  getProfileElementsByProfileDraftId,
  getProfileElementsByType,
  getProfileElementsByAssetId,
  updateProfileElement,
  updateProfileElementPosition,
  deleteProfileElement,
  deleteProfileElementsByProfileDraftId,
};
