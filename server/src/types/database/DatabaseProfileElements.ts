// @generated
// Automatically generated. Don't change this file manually.

import { DatabaseProfileDraftsId } from './DatabaseProfileDrafts';
import { DatabaseAssetsId } from './DatabaseAssets';
import { DatabasePromptsId } from './DatabasePrompts';
import { ZonedDateTime } from '@js-joda/core';

export type DatabaseProfileElementsId = number & { " __flavor": 'profile_elements' };

export default interface DatabaseProfileElements {
  /**
   * This is the primary key and should only be used internally. It is unique across all tables in the database although
take care if relying on this behavior as it could change in the future. It should not be exposed externally. Use
`external_id` from base_table_with_external_id for a public id. However foreign keys reference this value and will
need to be converted to the `external_id`.
   * Primary key. Index: profile_elements_pkey
   */
  id: DatabaseProfileElementsId;

  /** Indicates when the row was created. Intended for auditing purposes only and should not be used by application logic.
If you find that you need access to this in application code, you should probably add a separate value that is set
by the application. */
  
// @Custom removed property by .kanelrc.js
// created_at: ZonedDateTime;

  /** Indicates when the row was last modified. Intended for auditing purposes only and should not be used by application logic.
If you find that you need access to this in application code, you should probably add a separate value that is set
by the application. */
  
// @Custom removed property by .kanelrc.js
// last_modified: ZonedDateTime;

  /** Index: profile_elements_profile_draft_id_position_key */
  profileDraftId: DatabaseProfileDraftsId | null;

  /** Index: profile_elements_profile_draft_id_position_key */
  position: number;

  type: string | null;

  assetId: DatabaseAssetsId | null;

  promptId: DatabasePromptsId | null;

  textResponse: string | null;

  subResponses: unknown | null;
}

export interface DatabaseProfileElementsInitializer {
  /**
   * This is the primary key and should only be used internally. It is unique across all tables in the database although
take care if relying on this behavior as it could change in the future. It should not be exposed externally. Use
`external_id` from base_table_with_external_id for a public id. However foreign keys reference this value and will
need to be converted to the `external_id`.
   * Default value: next_dateable_id()
   * Primary key. Index: profile_elements_pkey
   */
  id?: DatabaseProfileElementsId;

  /**
   * Indicates when the row was created. Intended for auditing purposes only and should not be used by application logic.
If you find that you need access to this in application code, you should probably add a separate value that is set
by the application.
   * Default value: now()
   */
  
// @Custom removed property by .kanelrc.js
// created_at?: ZonedDateTime;

  /**
   * Indicates when the row was last modified. Intended for auditing purposes only and should not be used by application logic.
If you find that you need access to this in application code, you should probably add a separate value that is set
by the application.
   * Default value: now()
   */
  
// @Custom removed property by .kanelrc.js
// last_modified?: ZonedDateTime;

  /** Index: profile_elements_profile_draft_id_position_key */
  profileDraftId?: DatabaseProfileDraftsId | null;

  /** Index: profile_elements_profile_draft_id_position_key */
  position: number;

  type?: string | null;

  assetId?: DatabaseAssetsId | null;

  promptId?: DatabasePromptsId | null;

  textResponse?: string | null;

  subResponses?: unknown | null;
}
