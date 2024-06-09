#!/bin/sh
set -e

# Run migrations
npx -y prisma migrate deploy

exec "$@"
