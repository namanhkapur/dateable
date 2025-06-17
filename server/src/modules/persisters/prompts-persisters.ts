import { Context } from '../../config/context';
import { BaseModel } from '../../database/base-model';
import DatabasePrompts, { DatabasePromptsInitializer, DatabasePromptsId } from '../../types/database/DatabasePrompts';

export interface PromptsModel extends DatabasePrompts {}

export class PromptsModel extends BaseModel {
  static override tableName = 'public.prompts';
}

/**
 * Upserts a single prompt by the unique "title" field.
 */
const upsertPrompt = async (
  context: Context,
  prompt: DatabasePromptsInitializer,
): Promise<DatabasePrompts> => context.databaseService
    .query(PromptsModel)
    .insert(prompt)
    .onConflict('title')
    .merge()
    .returning('*')
    .first();

/**
 * Get a prompt by its ID.
 */
const getPromptById = async (
  context: Context,
  id: DatabasePromptsId,
): Promise<DatabasePrompts | undefined> => context.databaseService
    .query(PromptsModel)
    .where({ id })
    .first();

/**
 * Get a prompt by its title.
 */
const getPromptByTitle = async (
  context: Context,
  title: string,
): Promise<DatabasePrompts | undefined> => context.databaseService
    .query(PromptsModel)
    .where({ title })
    .first();

/**
 * Get prompts by type.
 */
const getPromptsByType = async (
  context: Context,
  type: string,
): Promise<DatabasePrompts[]> => context.databaseService
    .query(PromptsModel)
    .where({ type })
    .orderBy('title');

/**
 * Get all prompts.
 */
const getAllPrompts = async (
  context: Context,
): Promise<DatabasePrompts[]> => context.databaseService
    .query(PromptsModel)
    .orderBy('title');

/**
 * Create a new prompt.
 */
const createPrompt = async (
  context: Context,
  prompt: DatabasePromptsInitializer,
): Promise<DatabasePrompts> => context.databaseService
    .query(PromptsModel)
    .insert(prompt)
    .returning('*')
    .first();

/**
 * Update a prompt by ID.
 */
const updatePrompt = async (
  context: Context,
  id: DatabasePromptsId,
  updates: Partial<Pick<DatabasePrompts, 'title' | 'type'>>,
): Promise<DatabasePrompts> => context.databaseService
    .query(PromptsModel)
    .where({ id })
    .update(updates)
    .throwIfNotFound()
    .returning('*')
    .first();

/**
 * Delete a prompt by ID.
 */
const deletePrompt = async (
  context: Context,
  id: DatabasePromptsId,
): Promise<boolean> => {
  const deletedCount = await context.databaseService
    .query(PromptsModel)
    .where({ id })
    .delete();
  return deletedCount > 0;
};

export const PromptsPersister = {
  upsertPrompt,
  getPromptById,
  getPromptByTitle,
  getPromptsByType,
  getAllPrompts,
  createPrompt,
  updatePrompt,
  deletePrompt,
};
