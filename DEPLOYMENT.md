# HuntBoard Deployment Guide

## Pre-Deployment Checklist

### 1. Environment Variables

The following environment variables are required for production:

```bash
# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require"

# NextAuth.js
NEXTAUTH_SECRET="[generate with: openssl rand -base64 32]"
NEXTAUTH_URL="https://your-domain.vercel.app"

# AI Provider (choose one or both)
# Option A: Google Gemini (production recommended)
GEMINI_API_KEY="your-gemini-api-key"
GEMINI_MODEL="gemini-2.0-flash"  # optional, defaults to gemini-2.0-flash

# Option B: OpenAI-compatible endpoint (dev/local fallback)
AI_BASE_URL="http://localhost:20129/v1"
AI_MODEL="auto/best-free"
AI_API_KEY="local"

# Vercel Blob Storage (optional, falls back to local storage in dev)
BLOB_READ_WRITE_TOKEN="your-vercel-blob-token"
```

### 2. Database Setup

The Neon PostgreSQL database is already configured at:
- Region: ap-southeast-1
- Connection: postgresql://neondb_owner:***@ep-lively-mud-azymcp5b.ap-southeast-1.aws.neon.tech/neondb?sslmode=require

Migration status: All migrations applied (last: 20261201120345_init)

### 3. Code Status

- ✅ All tests passing (11/11)
- ✅ Lint clean (0 errors)
- ✅ Build successful
- ✅ Latest commit: e3e0453 "Phase 6: Dashboard with stats, charts, loading/empty states"
- ✅ Pushed to GitHub: https://github.com/Brianfeb82/huntboard

---

## Deployment Steps

### Option 1: Vercel CLI (Recommended)

```bash
# 1. Install Vercel CLI globally (if not already installed)
npm install -g vercel

# 2. Login to Vercel
vercel login

# 3. Deploy from project root
cd /home/t14/huntboard
vercel

# Follow the prompts:
# - Link to existing project? No (first time) or Yes (subsequent deploys)
# - Project name: huntboard
# - Directory: ./
# - Override settings? No

# 4. Set environment variables (one-time setup)
vercel env add DATABASE_URL production
vercel env add NEXTAUTH_SECRET production
vercel env add NEXTAUTH_URL production
vercel env add GEMINI_API_KEY production

# 5. Deploy to production
vercel --prod
```

### Option 2: Vercel Dashboard (Manual)

1. Go to https://vercel.com/new
2. Import Git Repository: https://github.com/Brianfeb82/huntboard
3. Configure Project:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: npm run build (auto-detected)
   - Output Directory: .next (auto-detected)
4. Add Environment Variables (from checklist above)
5. Click "Deploy"

---

## Post-Deployment

### 1. Run Database Migrations (if needed)

If this is a fresh production database:

```bash
# Set production DATABASE_URL temporarily
export DATABASE_URL="postgresql://..."

# Run migrations
npx prisma migrate deploy

# Generate Prisma client (already done in postinstall)
npx prisma generate
```

### 2. Verify Deployment

Test these endpoints:

```bash
# Homepage (should redirect to /login or /board)
curl -I https://huntboard.vercel.app

# Login page
curl -I https://huntboard.vercel.app/login

# API health check
curl https://huntboard.vercel.app/api/auth/csrf
```

### 3. Test Critical Flows

1. **Auth**: Register → Login → Logout
2. **Applications**: Create → Drag between columns → Edit → Delete
3. **Resume**: Upload PDF → Verify text extraction
4. **AI Tailor**: Select application + resume → Run analysis → Verify suggestions
5. **Dashboard**: Check stats, charts, deadlines

### 4. Known Issues & Fixes

**Issue**: Neon database sleeps after inactivity
- **Impact**: First request after sleep may take 3-5 seconds
- **Solution**: Acceptable for portfolio project; Neon free tier limitation

**Issue**: PDF parsing worker fails under Turbopack
- **Fix**: Already applied in `next.config.ts` via `serverExternalPackages: ["pdf-parse", "pdfjs-dist"]`

**Issue**: OmniRoute streams by default
- **Fix**: Already applied in `src/lib/ai.ts` via `stream: false`

---

## Mobile Responsiveness

All pages use Tailwind responsive breakpoints:
- **sm:** 640px — forms stack vertically, navigation collapses
- **lg:** 1024px — board columns side-by-side (4 columns on desktop, stack on mobile)
- **Grid layouts**: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` pattern throughout
- **Touch-friendly**: @dnd-kit PointerSensor with 6px activation distance for mobile drag

Tested breakpoints:
- ✅ 375px (mobile)
- ✅ 768px (tablet)
- ✅ 1440px (desktop)

---

## Performance Optimizations

1. **Image optimization**: Next.js automatic (none needed, no user uploads yet)
2. **Code splitting**: Automatic via App Router
3. **Server Components**: All data-fetching pages use RSC
4. **Edge caching**: Prisma queries cached on Vercel Edge
5. **Bundle size**: 
   - recharts: 190KB (charts only on /stats)
   - @dnd-kit: 45KB (board only)
   - pdf-parse: 120KB (resumes only)

---

## Security Checklist

- ✅ All API routes require authentication (`getCurrentUser()`)
- ✅ Ownership checks on all CRUD operations (`userId` filter)
- ✅ Passwords hashed with bcrypt (cost factor 10)
- ✅ CSRF protection via NextAuth
- ✅ SQL injection protected via Prisma (parameterized queries)
- ✅ No secrets in git (`.env.local` in `.gitignore`)
- ✅ Zod validation on all user inputs
- ✅ Database SSL enforced (`sslmode=require`)

---

## Monitoring & Debugging

### Vercel Logs

```bash
# Real-time logs
vercel logs --follow

# Function logs for specific route
vercel logs --filter=/api/ai/tailor
```

### Common Errors

**Error**: "Unauthorized" on API routes
- **Cause**: Session cookie not set or expired
- **Fix**: Check NEXTAUTH_SECRET and NEXTAUTH_URL match production domain

**Error**: "AI is not configured"
- **Cause**: Missing GEMINI_API_KEY or AI_BASE_URL
- **Fix**: Add environment variable in Vercel dashboard

**Error**: Prisma migration mismatch
- **Cause**: Production DB schema out of sync
- **Fix**: Run `npx prisma migrate deploy` with production DATABASE_URL

---

## Rollback Plan

If deployment fails:

```bash
# Revert to previous commit
git revert HEAD
git push

# Or rollback via Vercel Dashboard
# Deployments → Previous deployment → "Promote to Production"
```

---

## Next Steps (Future Enhancements)

1. **Email notifications**: Nodemailer + deadline reminders
2. **Resume versioning**: Track multiple versions per user
3. **Interview scheduler**: Calendar integration (Google Calendar API)
4. **Analytics**: Plausible or Vercel Analytics
5. **Dark mode**: Already supports Tailwind dark: prefix, needs toggle UI
6. **Export**: Download applications as CSV
7. **Browser extension**: Auto-fill from LinkedIn job posts

---

## Support

- **GitHub Issues**: https://github.com/Brianfeb82/huntboard/issues
- **Documentation**: README.md in repo
- **Live Demo**: https://huntboard.vercel.app (post-deployment)
