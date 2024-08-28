#!/bin/bash
set -e

# Function to check if a database exists
database_exists() {
  local db_name="$1"
  psql -U "$POSTGRES_USER" -lqt | cut -d \| -f 1 | grep -qw "$db_name"
}

# Create databases if they don't exist
if ! database_exists "test"; then
  echo "Creating 'test' database..."
  psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<EOSQL
    CREATE DATABASE test;
EOSQL
fi

if ! database_exists "dev"; then
  echo "Creating 'dev' database..."
  psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<EOSQL
    CREATE DATABASE dev;
EOSQL
fi

if ! database_exists "production"; then
  echo "Creating 'production' database..."
  psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<EOSQL
    CREATE DATABASE production;
EOSQL
fi
