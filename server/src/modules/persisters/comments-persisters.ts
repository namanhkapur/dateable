import { Context } from '../../config/context';
import { BaseModel } from '../../database/base-model';
import DatabaseComments, { DatabaseCommentsInitializer, DatabaseCommentsId } from '../../types/database/DatabaseComments';
import { DatabaseProfileDraftsId } from '../../types/database/DatabaseProfileDrafts';
import { DatabaseUsersId } from '../../types/database/DatabaseUsers';

export interface CommentsModel extends DatabaseComments {}

export class CommentsModel extends BaseModel {
  static override tableName = 'public.comments';
}

/**
 * Get a comment by its ID.
 */
const getCommentById = async (
  context: Context,
  id: DatabaseCommentsId,
): Promise<DatabaseComments | undefined> => {
  return await context.databaseService
    .query(CommentsModel)
    .where({ id })
    .first();
};

/**
 * Get comments by profile draft ID, ordered by creation time.
 */
const getCommentsByProfileDraftId = async (
  context: Context,
  profileDraftId: DatabaseProfileDraftsId,
): Promise<DatabaseComments[]> => {
  return await context.databaseService
    .query(CommentsModel)
    .where({ profileDraftId })
    .orderBy('id');
};

/**
 * Get comments by author ID.
 */
const getCommentsByAuthorId = async (
  context: Context,
  authorId: DatabaseUsersId,
): Promise<DatabaseComments[]> => {
  return await context.databaseService
    .query(CommentsModel)
    .where({ authorId })
    .orderBy('id', 'desc');
};

/**
 * Get comments by type.
 */
const getCommentsByType = async (
  context: Context,
  profileDraftId: DatabaseProfileDraftsId,
  type: string,
): Promise<DatabaseComments[]> => {
  return await context.databaseService
    .query(CommentsModel)
    .where({ profileDraftId, type })
    .orderBy('id');
};

/**
 * Get system comments for a profile draft.
 */
const getSystemCommentsByProfileDraftId = async (
  context: Context,
  profileDraftId: DatabaseProfileDraftsId,
): Promise<DatabaseComments[]> => {
  return await getCommentsByType(context, profileDraftId, 'system');
};

/**
 * Get user comments for a profile draft.
 */
const getUserCommentsByProfileDraftId = async (
  context: Context,
  profileDraftId: DatabaseProfileDraftsId,
): Promise<DatabaseComments[]> => {
  return await getCommentsByType(context, profileDraftId, 'user');
};

/**
 * Create a new comment.
 */
const createComment = async (
  context: Context,
  comment: DatabaseCommentsInitializer,
): Promise<DatabaseComments> => {
  return await context.databaseService
    .query(CommentsModel)
    .insert(comment)
    .returning('*')
    .first();
};

/**
 * Create a user comment.
 */
const createUserComment = async (
  context: Context,
  profileDraftId: DatabaseProfileDraftsId,
  authorId: DatabaseUsersId,
  message: string,
  metadata?: unknown,
): Promise<DatabaseComments> => {
  return await createComment(context, {
    profileDraftId,
    authorId,
    type: 'user',
    message,
    metadata,
  });
};

/**
 * Create a system comment.
 */
const createSystemComment = async (
  context: Context,
  profileDraftId: DatabaseProfileDraftsId,
  message: string,
  metadata?: unknown,
): Promise<DatabaseComments> => {
  return await createComment(context, {
    profileDraftId,
    authorId: null,
    type: 'system',
    message,
    metadata,
  });
};

/**
 * Update a comment by ID.
 */
const updateComment = async (
  context: Context,
  id: DatabaseCommentsId,
  updates: Partial<Pick<DatabaseComments, 'message' | 'metadata'>>,
): Promise<DatabaseComments> => {
  return await context.databaseService
    .query(CommentsModel)
    .where({ id })
    .update(updates)
    .throwIfNotFound()
    .returning('*')
    .first();
};

/**
 * Delete a comment by ID.
 */
const deleteComment = async (
  context: Context,
  id: DatabaseCommentsId,
): Promise<boolean> => {
  const deletedCount = await context.databaseService
    .query(CommentsModel)
    .where({ id })
    .delete();
  return deletedCount > 0;
};

/**
 * Delete all comments for a profile draft.
 */
const deleteCommentsByProfileDraftId = async (
  context: Context,
  profileDraftId: DatabaseProfileDraftsId,
): Promise<number> => {
  return await context.databaseService
    .query(CommentsModel)
    .where({ profileDraftId })
    .delete();
};

export const CommentsPersister = {
  getCommentById,
  getCommentsByProfileDraftId,
  getCommentsByAuthorId,
  getCommentsByType,
  getSystemCommentsByProfileDraftId,
  getUserCommentsByProfileDraftId,
  createComment,
  createUserComment,
  createSystemComment,
  updateComment,
  deleteComment,
  deleteCommentsByProfileDraftId,
};
