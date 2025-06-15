-- Trigger name is cast to ::name to handle name truncation correctly

CREATE OR REPLACE FUNCTION forbid_column_change()
  RETURNS TRIGGER AS $$
DECLARE
    old_value TEXT;
    new_value TEXT;
BEGIN
  EXECUTE 'SELECT $1.' || TG_ARGV[0] INTO old_value USING OLD;
  EXECUTE 'SELECT $1.' || TG_ARGV[0] INTO new_value USING NEW;
  IF new_value != old_value THEN
    RAISE EXCEPTION 'Cannot change value of %.%', TG_TABLE_NAME, TG_ARGV[0];
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE PLPGSQL;

CREATE OR REPLACE FUNCTION make_forbid_change_column_triggers(colname TEXT)
  RETURNS VOID AS $$
DECLARE
  tbl_name TEXT;
BEGIN
  FOR tbl_name IN
  SELECT information_schema.columns.table_name
  FROM information_schema.columns
    JOIN information_schema.tables ON information_schema.columns.table_name = information_schema.tables.table_name
  WHERE column_name = colname
      AND information_schema.tables.table_schema = 'public'
      AND table_type = 'BASE TABLE'
  LOOP
    IF (
      SELECT tgname
      FROM pg_trigger
      WHERE tgname = (tbl_name || '_forbid_change_' || colname || '_column_trigger')::name) IS NULL
    THEN
      EXECUTE 'CREATE TRIGGER ' || tbl_name || '_forbid_change_' || colname || '_column_trigger BEFORE UPDATE OF ' ||
          colname || ' ON ' || tbl_name ||  ' FOR EACH ROW EXECUTE FUNCTION forbid_column_change(' || colname || ')';
    END IF;
  END LOOP;
END;
$$ LANGUAGE PLPGSQL;
