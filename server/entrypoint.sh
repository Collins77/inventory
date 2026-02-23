#!/bin/sh
set -e

mkdir -p /app/data

echo "→ Applying Prisma schema..."
npx prisma db push

echo "→ Checking if database needs seeding..."
if npx prisma store count | grep -q '^0$'; then
  echo "→ Seeding database..."
  npx prisma db seed
else
  echo "→ Already seeded"
fi

echo "→ Starting server..."
exec node dist/index.js