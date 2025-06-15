// @generated
// Automatically generated. Don't change this file manually.

import DatabaseAssets, { DatabaseAssetsInitializer, DatabaseAssetsId } from './DatabaseAssets';
import DatabaseComments, { DatabaseCommentsInitializer, DatabaseCommentsId } from './DatabaseComments';
import DatabaseProfileDrafts, { DatabaseProfileDraftsInitializer, DatabaseProfileDraftsId } from './DatabaseProfileDrafts';
import DatabaseProfileElements, { DatabaseProfileElementsInitializer, DatabaseProfileElementsId } from './DatabaseProfileElements';
import DatabasePrompts, { DatabasePromptsInitializer, DatabasePromptsId } from './DatabasePrompts';
import DatabaseUsers, { DatabaseUsersInitializer, DatabaseUsersId } from './DatabaseUsers';

type Model =
  | DatabaseAssets
  | DatabaseComments
  | DatabaseProfileDrafts
  | DatabaseProfileElements
  | DatabasePrompts
  | DatabaseUsers

interface ModelTypeMap {
  'assets': DatabaseAssets;
  'comments': DatabaseComments;
  'profile_drafts': DatabaseProfileDrafts;
  'profile_elements': DatabaseProfileElements;
  'prompts': DatabasePrompts;
  'users': DatabaseUsers;
}

type ModelId =
  | DatabaseAssetsId
  | DatabaseCommentsId
  | DatabaseProfileDraftsId
  | DatabaseProfileElementsId
  | DatabasePromptsId
  | DatabaseUsersId

interface ModelIdTypeMap {
  'assets': DatabaseAssetsId;
  'comments': DatabaseCommentsId;
  'profile_drafts': DatabaseProfileDraftsId;
  'profile_elements': DatabaseProfileElementsId;
  'prompts': DatabasePromptsId;
  'users': DatabaseUsersId;
}

type Initializer =
  | DatabaseAssetsInitializer
  | DatabaseCommentsInitializer
  | DatabaseProfileDraftsInitializer
  | DatabaseProfileElementsInitializer
  | DatabasePromptsInitializer
  | DatabaseUsersInitializer

interface InitializerTypeMap {
  'assets': DatabaseAssetsInitializer;
  'comments': DatabaseCommentsInitializer;
  'profile_drafts': DatabaseProfileDraftsInitializer;
  'profile_elements': DatabaseProfileElementsInitializer;
  'prompts': DatabasePromptsInitializer;
  'users': DatabaseUsersInitializer;
}

export type {
  DatabaseAssets, DatabaseAssetsInitializer, DatabaseAssetsId,
  DatabaseComments, DatabaseCommentsInitializer, DatabaseCommentsId,
  DatabaseProfileDrafts, DatabaseProfileDraftsInitializer, DatabaseProfileDraftsId,
  DatabaseProfileElements, DatabaseProfileElementsInitializer, DatabaseProfileElementsId,
  DatabasePrompts, DatabasePromptsInitializer, DatabasePromptsId,
  DatabaseUsers, DatabaseUsersInitializer, DatabaseUsersId,

  Model,
  ModelTypeMap,
  ModelId,
  ModelIdTypeMap,
  Initializer,
  InitializerTypeMap
};
