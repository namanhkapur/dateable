// @generated
// Automatically generated. Don't change this file manually.

import { ZonedDateTime } from '@js-joda/core';

export type DatabaseUsersId = number & { " __flavor": 'users' };

export default interface DatabaseUsers {
  /**
   * This is the primary key and should only be used internally. It is unique across all tables in the database although
take care if relying on this behavior as it could change in the future. It should not be exposed externally. Use
`external_id` from base_table_with_external_id for a public id. However foreign keys reference this value and will
need to be converted to the `external_id`.
   * Primary key. Index: users_pkey
   */
  id: DatabaseUsersId;

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

  name: string;

  /**
   * Unique username for profile routing (3-20 chars, alphanumeric, _, -)
   * Index: idx_users_username
   * Index: users_username_key
   */
  username: string | null;

  /** Index: users_phone_key */
  phone: string | null;

  /**
   * Supabase auth user ID (UUID)
   * Index: idx_users_auth_id
   * Index: users_auth_id_key
   */
  authId: string | null;

  /**
   * User email address from Supabase auth
   * Index: idx_users_email
   * Index: users_email_key
   */
  email: string | null;
}

export interface DatabaseUsersInitializer {
  /**
   * This is the primary key and should only be used internally. It is unique across all tables in the database although
take care if relying on this behavior as it could change in the future. It should not be exposed externally. Use
`external_id` from base_table_with_external_id for a public id. However foreign keys reference this value and will
need to be converted to the `external_id`.
   * Default value: next_dateable_id()
   * Primary key. Index: users_pkey
   */
  id?: DatabaseUsersId;

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

  name: string;

  /**
   * Unique username for profile routing (3-20 chars, alphanumeric, _, -)
   * Index: idx_users_username
   * Index: users_username_key
   */
  username?: string | null;

  /** Index: users_phone_key */
  phone?: string | null;

  /**
   * Supabase auth user ID (UUID)
   * Index: idx_users_auth_id
   * Index: users_auth_id_key
   */
  authId?: string | null;

  /**
   * User email address from Supabase auth
   * Index: idx_users_email
   * Index: users_email_key
   */
  email?: string | null;
}
