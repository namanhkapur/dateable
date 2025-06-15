CREATE OR REPLACE FUNCTION update_modified_column()
  RETURNS TRIGGER AS $$
BEGIN
  NEW.last_modified = now();
  RETURN NEW;
END;
$$ LANGUAGE PLPGSQL;

CREATE OR REPLACE FUNCTION make_update_last_modified_trigger()
  RETURNS VOID AS $$
DECLARE
  tbl_name TEXT;
BEGIN
  FOR tbl_name IN
  SELECT information_schema.columns.table_name
  FROM information_schema.columns
    JOIN information_schema.tables ON information_schema.columns.table_name = information_schema.tables.table_name
  WHERE column_name = 'last_modified'
      AND information_schema.tables.table_schema = 'public'
      AND table_type = 'BASE TABLE'
  LOOP
    IF (
      SELECT tgname
      FROM pg_trigger
      WHERE tgname = (tbl_name || '_update_last_modified_trigger')::name) IS NULL
    THEN
      EXECUTE 'CREATE TRIGGER ' || tbl_name || '_update_last_modified_trigger BEFORE UPDATE ON ' || tbl_name ||
          ' FOR EACH ROW EXECUTE FUNCTION update_modified_column()';
    END IF;
  END LOOP;
END;
$$ LANGUAGE PLPGSQL;
