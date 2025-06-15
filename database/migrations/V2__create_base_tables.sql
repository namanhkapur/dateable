DROP SEQUENCE IF EXISTS global_id_sequence;
CREATE SEQUENCE global_id_sequence
    AS BIGINT
    NO CYCLE;

CREATE OR REPLACE FUNCTION next_dateable_id(OUT result BIGINT) AS $$
BEGIN
    SELECT nextval('global_id_sequence') INTO result;
END;
$$ LANGUAGE PLPGSQL;



CREATE SCHEMA IF NOT EXISTS template;

/*
 * Use one of base_table or base_table_with_external_id for all tables we create (with some narrow exceptions for
 * auditing and analytics tables. Use base_table_with_external_id if the corresponding object will every be publicly
 * exposed. Use base_table for tables like password_hash which never will be.
 */

DROP TABLE IF EXISTS template.base_table;
CREATE TABLE template.base_table(
  id BIGINT NOT NULL DEFAULT next_dateable_id() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  last_modified TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

COMMENT ON COLUMN template.base_table.id IS $$
This is the primary key and should only be used internally. It is unique across all tables in the database although
take care if relying on this behavior as it could change in the future. It should not be exposed externally. Use
`external_id` from base_table_with_external_id for a public id. However foreign keys reference this value and will
need to be converted to the `external_id`.
$$;
COMMENT ON COLUMN template.base_table.created_at IS $$
Indicates when the row was created. Intended for auditing purposes only and should not be used by application logic.
If you find that you need access to this in application code, you should probably add a separate value that is set
by the application.
$$;
COMMENT ON COLUMN template.base_table.last_modified IS $$
Indicates when the row was last modified. Intended for auditing purposes only and should not be used by application logic.
If you find that you need access to this in application code, you should probably add a separate value that is set
by the application.
$$;
