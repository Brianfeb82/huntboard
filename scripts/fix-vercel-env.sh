#!/bin/bash
# Fix: Add DATABASE_URL to all Vercel environments so Prisma can access it during builds

set -e

DATABASE_URL=$(grep "^DATABASE_URL=" .env.local | cut -d'"' -f2)
NEXTAUTH_SECRET=$(grep "^NEXTAUTH_SECRET=" .env.local | cut -d'"' -f2)

echo "Adding DATABASE_URL to Preview environment..."
echo "$DATABASE_URL" | vercel env add DATABASE_URL preview --yes 2>/dev/null || echo "  (Already exists or error - continuing)"

echo "Adding DATABASE_URL to Development environment..."
echo "$DATABASE_URL" | vercel env add DATABASE_URL development --yes 2>/dev/null || echo "  (Already exists or error - continuing)"

echo "Adding NEXTAUTH_SECRET to Preview environment..."
echo "$NEXTAUTH_SECRET" | vercel env add NEXTAUTH_SECRET preview --yes 2>/dev/null || echo "  (Already exists or error - continuing)"

echo "Adding NEXTAUTH_SECRET to Development environment..."
echo "$NEXTAUTH_SECRET" | vercel env add NEXTAUTH_SECRET development --yes 2>/dev/null || echo "  (Already exists or error - continuing)"

echo ""
echo "✅ Environment variables configured for all environments"
echo ""
echo "Verifying..."
vercel env ls
