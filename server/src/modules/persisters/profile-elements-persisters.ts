import { Context } from '../../config/context';
import { BaseModel } from '../../database/base-model';
import DatabaseProfileElements, { DatabaseProfileElementsInitializer } from '../../types/database/DatabaseProfileElements';

export interface ProfileElementsModel extends DatabaseProfileElements {}

export class ProfileElementsModel extends BaseModel {
  static override tableName = 'public.profile_elements';
}

/**
 * Get a profile element by its ID.
 */
const getProfileElementById = async (
  context: Context,
  id: number,
): Promise<DatabaseProfileElements | undefined> => {
  return await context.databaseService
    .query(ProfileElementsModel)
    .where({ id })
    .first();
};

/**
 * Get profile elements by profile draft ID, ordered by position.
 */
const getProfileElementsByProfileDraftId = async (
  context: Context,
  profileDraftId: number,
): Promise<DatabaseProfileElements[]> => {
  return await context.databaseService
    .query(ProfileElementsModel)
    .where({ profileDraftId })
    .orderBy('position');
};

/**
 * Get profile elements by type.
 */
const getProfileElementsByType = async (
  context: Context,
  profileDraftId: number,
  type: string,
): Promise<DatabaseProfileElements[]> => {
  return await context.databaseService
    .query(ProfileElementsModel)
    .where({ profileDraftId, type })
    .orderBy('position');
};

/**
 * Get profile elements that reference a specific asset.
 */
const getProfileElementsByAssetId = async (
  context: Context,
  assetId: number,
): Promise<DatabaseProfileElements[]> => {
  return await context.databaseService
    .query(ProfileElementsModel)
    .where({ assetId })
    .orderBy('id');
};

/**
 * Get profile elements that reference a specific prompt.
 */
const getProfileElementsByPromptId = async (
  context: Context,
  promptId: number,
): Promise<DatabaseProfileElements[]> => {
  return await context.databaseService
    .query(ProfileElementsModel)
    .where({ promptId })
    .orderBy('id');
};

/**
 * Create a new profile element.
 */
const createProfileElement = async (
  context: Context,
  profileElement: DatabaseProfileElementsInitializer,
): Promise<DatabaseProfileElements> => {
  return await context.databaseService
    .query(ProfileElementsModel)
    .insert(profileElement)
    .returning('*')
    .first();
};

/**
 * Update a profile element by ID.
 */
const updateProfileElement = async (
  context: Context,
  id: number,
  updates: Partial<Pick<DatabaseProfileElements, 'position' | 'type' | 'assetId' | 'promptId' | 'textResponse' | 'subResponses'>>,
): Promise<DatabaseProfileElements | undefined> => {
  return await context.databaseService
    .query(ProfileElementsModel)
    .where({ id })
    .update(updates)
    .returning('*')
    .first();
};

/**
 * Update the position of a profile element.
 */
const updateProfileElementPosition = async (
  context: Context,
  id: number,
  position: number,
): Promise<DatabaseProfileElements | undefined> => {
  return await updateProfileElement(context, id, { position });
};

/**
 * Delete a profile element by ID.
 */
const deleteProfileElement = async (
  context: Context,
  id: number,
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
  profileDraftId: number,
): Promise<number> => {
  return await context.databaseService
    .query(ProfileElementsModel)
    .where({ profileDraftId })
    .delete();
};

/**
 * Reorder profile elements for a profile draft.
 */
const reorderProfileElements = async (
  context: Context,
  profileDraftId: number,
  elementIdPositionPairs: Array<{ id: number; position: number }>,
): Promise<void> => {
  for (const { id, position } of elementIdPositionPairs) {
    await updateProfileElementPosition(context, id, position);
  }
};

export const ProfileElementsPersister = {
  getProfileElementById,
  getProfileElementsByProfileDraftId,
  getProfileElementsByType,
  getProfileElementsByAssetId,
  getProfileElementsByPromptId,
  createProfileElement,
  updateProfileElement,
  updateProfileElementPosition,
  deleteProfileElement,
  deleteProfileElementsByProfileDraftId,
  reorderProfileElements,
};
