// @generated
// Automatically generated. Don't change this file manually.

import { DatabaseUsersId } from './DatabaseUsers';
import { ZonedDateTime } from '@js-joda/core';

export type DatabaseProfileDraftsId = number & { " __flavor": 'profile_drafts' };

export default interface DatabaseProfileDrafts {
  /**
   * This is the primary key and should only be used internally. It is unique across all tables in the database although
take care if relying on this behavior as it could change in the future. It should not be exposed externally. Use
`external_id` from base_table_with_external_id for a public id. However foreign keys reference this value and will
need to be converted to the `external_id`.
   * Primary key. Index: profile_drafts_pkey
   */
  id: DatabaseProfileDraftsId;

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

  subjectUserId: DatabaseUsersId | null;

  createdByUserId: DatabaseUsersId | null;

  isFinalized: boolean | null;
}

export interface DatabaseProfileDraftsInitializer {
  /**
   * This is the primary key and should only be used internally. It is unique across all tables in the database although
take care if relying on this behavior as it could change in the future. It should not be exposed externally. Use
`external_id` from base_table_with_external_id for a public id. However foreign keys reference this value and will
need to be converted to the `external_id`.
   * Default value: next_dateable_id()
   * Primary key. Index: profile_drafts_pkey
   */
  id?: DatabaseProfileDraftsId;

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

  subjectUserId?: DatabaseUsersId | null;

  createdByUserId?: DatabaseUsersId | null;

  /** Default value: false */
  isFinalized?: boolean | null;
}
