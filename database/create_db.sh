#!/bin/bash
# create_db.sh - Create the elimcbs database and tables
psql -U postgres -c "CREATE DATABASE elimcbs;"
psql -U postgres -d elimcbs -f "$(dirname "$0")/schema.sql"
echo "Database elimcbs created and schema applied."
