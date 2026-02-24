#!/bin/bash
# drop_db.sh - Drop the elimcbs database
psql -U postgres -c "DROP DATABASE IF EXISTS elimcbs;"
echo "Database elimcbs dropped."
