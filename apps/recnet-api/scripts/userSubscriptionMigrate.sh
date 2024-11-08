#!/bin/bash

# Database connection details
DB_NAME=""
DB_USER=""
DB_HOST=""
DB_PORT=""
DB_PASSWORD=""

export PGPASSWORD=$DB_PASSWORD

# Query to select all user IDs and insert into Subscription table
psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -p "$DB_PORT" -t -c "SELECT id FROM recnet.\"User\";" | while read -r userId; do
  if [[ -n "$userId" ]]; then
    # Insert a new subscription for each user ID
    psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -p "$DB_PORT" -c \
      "INSERT INTO recnet.\"Subscription\" (\"userId\", \"type\", \"channel\") VALUES ('$userId', 'WEEKLY_DIGEST', 'EMAIL') ON CONFLICT DO NOTHING;"
  fi
done
