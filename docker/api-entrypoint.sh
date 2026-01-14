#!/bin/bash
set -e

echo "=== TALA API Entrypoint ==="
echo "Waiting for PostgreSQL to be ready..."

# Wait for database to be ready
/usr/local/bin/wait-for-it tala-db:5432 -t 60 -- echo "PostgreSQL is ready!"

echo "Running Prisma migrations..."
cd /app/packages/database

# Generate Prisma Client
echo "Generating Prisma Client..."
npx prisma generate

# Push schema to database (for development)
if [ "$NODE_ENV" = "development" ]; then
    echo "Pushing Prisma schema to database..."
    npx prisma db push --skip-generate --accept-data-loss || {
        echo "Warning: Prisma db push failed, attempting migration..."
        npx prisma migrate dev --name init || echo "Migration already applied or failed"
    }
    
    # Seed database with default data
    echo "Seeding database..."
    npm run seed || echo "Seeding completed or skipped"
fi

# Run migrations (for production)
if [ "$NODE_ENV" = "production" ]; then
    echo "Running Prisma migrations..."
    npx prisma migrate deploy
fi

echo "Database setup complete!"
echo "Starting API server..."

cd /app
exec "$@"
