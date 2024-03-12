#!/bin/bash

PRISMA_SCHEMA="apps/recnet-api/prisma/schema.prisma"
PRISMA_MIGRATIONS_DIR="apps/recnet-api/prisma/migrations"

MIGRATION_NAME="$1"

perform_migration_up() {
    pnpx prisma migrate dev --name $MIGRATION_NAME --schema="$PRISMA_SCHEMA"
}

perform_migration_down() {
    npx prisma migrate diff \
      --from-schema-datamodel $PRISMA_SCHEMA \
      --to-schema-datasource $PRISMA_SCHEMA \
      --script > down.sql
}

move_down_sql_file() {
    DIRECTORY=$(find $PRISMA_MIGRATIONS_DIR -type d -name "*$MIGRATION_NAME*" | tail -n 1)
    if [ -s "down.sql" ]; then
        mv down.sql $DIRECTORY/down.sql
    else
        rm down.sql
    fi
}

echo "Migrating database to $MIGRATION_NAME"
echo "Performing migration down"
perform_migration_down

echo "Performing migration up"
perform_migration_up

echo "Moving down.sql to migration directory"
move_down_sql_file
