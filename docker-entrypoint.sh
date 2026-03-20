#!/bin/sh
set -e

echo "Waiting for database to be ready..."

MAX_RETRIES=30
RETRY_INTERVAL=2
RETRIES=0

until node -e "
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  prisma.\$connect().then(() => {
    console.log('Database is ready');
    prisma.\$disconnect();
    process.exit(0);
  }).catch(() => process.exit(1));
" 2>/dev/null; do
  RETRIES=$((RETRIES + 1))
  if [ "$RETRIES" -ge "$MAX_RETRIES" ]; then
    echo "ERROR: Could not connect to database after ${MAX_RETRIES} attempts"
    exit 1
  fi
  echo "Database not ready yet (attempt $RETRIES/$MAX_RETRIES). Retrying in ${RETRY_INTERVAL}s..."
  sleep "$RETRY_INTERVAL"
done

echo "Running Prisma migrations..."
node ./node_modules/prisma/build/index.js migrate deploy

echo "Starting application..."
exec node server.js
