#!/bin/bash
# Set Vercel environment variables for HuntBoard deployment
# Run this script to configure production environment

set -e

echo "Setting Vercel environment variables..."

# Read DATABASE_URL from .env.local
DATABASE_URL=$(grep "^DATABASE_URL=" .env.local | cut -d'"' -f2)
NEXTAUTH_SECRET=$(grep "^NEXTAUTH_SECRET=" .env.local | cut -d'"' -f2)

if [ -z "$DATABASE_URL" ]; then
    echo "Error: DATABASE_URL not found in .env.local"
    exit 1
fi

if [ -z "$NEXTAUTH_SECRET" ]; then
    echo "Error: NEXTAUTH_SECRET not found in .env.local"
    exit 1
fi

# Set production environment variables
echo "Setting DATABASE_URL..."
echo "$DATABASE_URL" | vercel env add DATABASE_URL production

echo "Setting NEXTAUTH_SECRET..."
echo "$NEXTAUTH_SECRET" | vercel env add NEXTAUTH_SECRET production

echo "Setting NEXTAUTH_URL..."
echo "https://huntboard.vercel.app" | vercel env add NEXTAUTH_URL production

# GEMINI_API_KEY is optional - user needs to provide their own
echo ""
echo "✅ Core environment variables set!"
echo ""
echo "⚠️  GEMINI_API_KEY not set (optional)"
echo "   To enable AI features, run:"
echo "   vercel env add GEMINI_API_KEY production"
echo "   Then enter your Gemini API key when prompted"
echo ""
echo "Next step: vercel --prod"
