import { Context } from '../../config/context';
import { BaseModel } from '../../database/base-model';
import DatabaseProfileDrafts, { DatabaseProfileDraftsInitializer, DatabaseProfileDraftsId } from '../../types/database/DatabaseProfileDrafts';
import { DatabaseUsersId } from '../../types/database/DatabaseUsers';

export interface ProfileDraftsModel extends DatabaseProfileDrafts {}

export class ProfileDraftsModel extends BaseModel {
  static override tableName = 'public.profile_drafts';
}

/**
 * Get a profile draft by its ID.
 */
const getProfileDraftById = async (
  context: Context,
  id: DatabaseProfileDraftsId,
): Promise<DatabaseProfileDrafts | undefined> => {
  return await context.databaseService
    .query(ProfileDraftsModel)
    .where({ id })
    .first();
};

/**
 * Get profile drafts by subject user ID.
 */
const getProfileDraftsBySubjectUserId = async (
  context: Context,
  subjectUserId: DatabaseUsersId,
): Promise<DatabaseProfileDrafts[]> => {
  return await context.databaseService
    .query(ProfileDraftsModel)
    .where({ subjectUserId })
    .orderBy('id', 'desc');
};

/**
 * Get profile drafts created by a specific user.
 */
const getProfileDraftsByCreatedByUserId = async (
  context: Context,
  createdByUserId: DatabaseUsersId,
): Promise<DatabaseProfileDrafts[]> => {
  return await context.databaseService
    .query(ProfileDraftsModel)
    .where({ createdByUserId })
    .orderBy('id', 'desc');
};

/**
 * Get finalized profile drafts for a subject user.
 */
const getFinalizedProfileDraftsBySubjectUserId = async (
  context: Context,
  subjectUserId: DatabaseUsersId,
): Promise<DatabaseProfileDrafts[]> => {
  return await context.databaseService
    .query(ProfileDraftsModel)
    .where({ subjectUserId, isFinalized: true })
    .orderBy('id', 'desc');
};

/**
 * Get draft (non-finalized) profile drafts for a subject user.
 */
const getDraftProfileDraftsBySubjectUserId = async (
  context: Context,
  subjectUserId: DatabaseUsersId,
): Promise<DatabaseProfileDrafts[]> => {
  return await context.databaseService
    .query(ProfileDraftsModel)
    .where({ subjectUserId, isFinalized: false })
    .orderBy('id', 'desc');
};

/**
 * Create a new profile draft.
 */
const createProfileDraft = async (
  context: Context,
  profileDraft: DatabaseProfileDraftsInitializer,
): Promise<DatabaseProfileDrafts> => {
  return await context.databaseService
    .query(ProfileDraftsModel)
    .insert(profileDraft)
    .returning('*')
    .first();
};

/**
 * Update a profile draft by ID.
 */
const updateProfileDraft = async (
  context: Context,
  id: DatabaseProfileDraftsId,
  updates: Partial<Pick<DatabaseProfileDrafts, 'isFinalized'>>,
): Promise<DatabaseProfileDrafts> => {
  return await context.databaseService
    .query(ProfileDraftsModel)
    .where({ id })
    .update(updates)
    .throwIfNotFound()
    .returning('*')
    .first();
};

/**
 * Finalize a profile draft.
 */
const finalizeProfileDraft = async (
  context: Context,
  id: DatabaseProfileDraftsId,
): Promise<DatabaseProfileDrafts | undefined> => {
  return await updateProfileDraft(context, id, { isFinalized: true });
};

/**
 * Delete a profile draft by ID.
 */
const deleteProfileDraft = async (
  context: Context,
  id: DatabaseProfileDraftsId,
): Promise<boolean> => {
  const deletedCount = await context.databaseService
    .query(ProfileDraftsModel)
    .where({ id })
    .delete();
  return deletedCount > 0;
};

export const ProfileDraftsPersister = {
  getProfileDraftById,
  getProfileDraftsBySubjectUserId,
  getProfileDraftsByCreatedByUserId,
  getFinalizedProfileDraftsBySubjectUserId,
  getDraftProfileDraftsBySubjectUserId,
  createProfileDraft,
  updateProfileDraft,
  finalizeProfileDraft,
  deleteProfileDraft,
};
