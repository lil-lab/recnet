#!/bin/bash

ENV_PATH="apps/recnet-api/scripts/.env.dbdump.local"

SOURCE_SQL_FILE="apps/recnet-api/scripts/source_backup.sql"
DESTINATION_SQL_FILE="apps/recnet-api/scripts/destination_backup.sql"

dump_source() {
    PGPASSWORD=$SOURCE_DB_PASSWORD pg_dump -h $SOURCE_DB_HOST\
     -U $SOURCE_DB_USER -d $SOURCE_DB_NAME --no-owner -f $SOURCE_SQL_FILE
}

dump_destination() {
    PGPASSWORD=$DESTINATION_DB_PASSWORD pg_dump -h $DESTINATION_DB_HOST\
     -U $DESTINATION_DB_USER -d $DESTINATION_DB_NAME --no-owner -f $DESTINATION_SQL_FILE
}

schema_exists() {
    local schema_name="$1"
    local exists_query="SELECT EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = '$schema_name');"
    local result=$(PGPASSWORD=$DESTINATION_DB_PASSWORD psql -h $DESTINATION_DB_HOST -U $DESTINATION_DB_USER -d $DESTINATION_DB_NAME -tAc "$exists_query")
    if [[ $result == 't' ]]; then
        return 0  # Schema exists
    else
        return 1  # Schema does not exist
    fi
}

remove_destination_schemas() {
  # Backup
  dump_destination

  # Drop public schema
  if schema_exists 'public'; then
      echo "Schema 'public' exists."
      echo "Dropping schema 'public'..."
      PGPASSWORD=$DESTINATION_DB_PASSWORD psql -h $DESTINATION_DB_HOST -U $DESTINATION_DB_USER -d $DESTINATION_DB_NAME -c "DROP SCHEMA public CASCADE;"
  else
      echo "Schema 'public' does not exist."
  fi

  # Drop recnet schema
  if schema_exists 'recnet'; then
    echo "Schema 'recnet' exists."
    echo "Dropping schema 'recnet'..."
    PGPASSWORD=$DESTINATION_DB_PASSWORD psql -h $DESTINATION_DB_HOST -U $DESTINATION_DB_USER -d $DESTINATION_DB_NAME -c "DROP SCHEMA recnet CASCADE;"
  else
      echo "Schema 'recnet' does not exist."
  fi

  echo "Recreating publicschemas..."
  PGPASSWORD=$DESTINATION_DB_PASSWORD psql -h $DESTINATION_DB_HOST -U $DESTINATION_DB_USER -d $DESTINATION_DB_NAME -c "CREATE SCHEMA public;"
}

restore_to_destination() {
    PGPASSWORD=$DESTINATION_DB_PASSWORD psql -h $DESTINATION_DB_HOST\
     -U $DESTINATION_DB_USER -d $DESTINATION_DB_NAME -f $SOURCE_SQL_FILE
}

remove_dump_files() {
    rm $SOURCE_SQL_FILE
    rm $DESTINATION_SQL_FILE
}


source $ENV_PATH

echo "Dumping remote database to file..."
dump_source

echo "Removing schemas before restoring..."
remove_destination_schemas

echo "Restoring dump to local database..."
if restore_to_destination; then
    echo "Database restored successfully."
    remove_dump_files
else
    echo "Database restore failed."
fi
