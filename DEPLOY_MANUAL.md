# Manual Vercel Deployment via Dashboard

Since the Vercel CLI is experiencing network upload issues, deploy via the Vercel Dashboard instead:

## Step 1: Go to Vercel Dashboard

Visit: https://vercel.com/new

## Step 2: Import Git Repository

1. Click "Import Git Repository"
2. Select GitHub
3. Search for or paste: `Brianfeb82/huntboard`
4. Click "Import"

## Step 3: Configure Project

Vercel auto-detects Next.js settings:
- **Framework Preset**: Next.js (auto-detected)
- **Root Directory**: `./` (leave default)
- **Build Command**: `npm run build` (auto-detected)
- **Output Directory**: `.next` (auto-detected)
- **Install Command**: `npm install` (auto-detected)

## Step 4: Add Environment Variables

Click "Environment Variables" and add these (from .env.local):

| Name | Value | Note |
|------|-------|------|
| `DATABASE_URL` | `postgresql://neondb_owner:...@ep-lively-mud-azymcp5b.ap-southeast-1.aws.neon.tech/neondb?sslmode=require` | From .env.local |
| `NEXTAUTH_SECRET` | `[your secret from .env.local]` | Or generate new: `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `https://huntboard.vercel.app` | Will be your actual domain |
| `GEMINI_API_KEY` | `[your Gemini API key]` | Optional if using AI_BASE_URL |
| `GEMINI_MODEL` | `gemini-2.0-flash` | Optional |

**Optional** (for Vercel Blob storage):
| `BLOB_READ_WRITE_TOKEN` | `[your Vercel Blob token]` | Leave empty to use local storage fallback |

**Optional** (for local AI fallback):
- Skip `AI_BASE_URL`, `AI_MODEL`, `AI_API_KEY` — these only work with localhost

## Step 5: Deploy

1. Click **"Deploy"**
2. Wait 2-3 minutes for build to complete
3. Vercel will run:
   ```bash
   npm install
   npx prisma generate  # from postinstall script
   npm run build
   ```

## Step 6: Verify Deployment

Once deployment succeeds:

1. **Test homepage**: Visit the deployment URL (e.g., `huntboard.vercel.app`)
2. **Register account**: Go to `/register` and create a test account
3. **Test critical flows**:
   - Create an application
   - Upload a resume (or paste text)
   - Run AI tailor (if GEMINI_API_KEY is set)
   - Check dashboard stats

## Step 7: Set Production Domain

1. Go to Project Settings → Domains
2. Your project URL will be `huntboard-[hash].vercel.app`
3. To use `huntboard.vercel.app`:
   - Add domain: `huntboard.vercel.app`
   - Update `NEXTAUTH_URL` environment variable to match

## Troubleshooting

### Build fails with "Prisma Client not generated"
**Cause**: `postinstall` script didn't run
**Fix**: Add build command override:
```bash
npx prisma generate && npm run build
```

### "Unauthorized" on all API routes
**Cause**: `NEXTAUTH_URL` doesn't match deployment domain
**Fix**: Update environment variable to `https://your-actual-domain.vercel.app`

### AI features return 503
**Cause**: `GEMINI_API_KEY` not set
**Fix**: Add the key in Environment Variables, then redeploy

### Database connection fails
**Cause**: `DATABASE_URL` has wrong sslmode or is unreachable
**Fix**: Verify Neon database is active and connection string is correct

## Alternative: Deploy via Vercel CLI (when network is stable)

```bash
# 1. Login (if not already)
vercel login

# 2. Link project (if already created via dashboard)
vercel link

# 3. Set environment variables
vercel env pull .env.production.local

# 4. Deploy
vercel --prod
```

## Post-Deployment Checklist

- [ ] Deployment succeeds and app loads
- [ ] Register and login work
- [ ] Create application works
- [ ] Kanban board drag-drop works
- [ ] Upload resume works (or paste text fallback)
- [ ] AI tailor works (if GEMINI_API_KEY is set)
- [ ] Dashboard shows correct stats
- [ ] All pages are mobile-responsive

## Next Steps

Once deployed, update your portfolio:

1. Add live demo link: `https://huntboard.vercel.app`
2. Add to GitHub README
3. Add to brianfeb82.github.io projects section
4. Take screenshots for portfolio:
   - Kanban board with applications
   - AI tailor results page
   - Dashboard with charts

---

**Current Status** (2026-08-01):
- ✅ Code pushed to GitHub: `885a8e8`
- ✅ All tests passing (11/11)
- ✅ Build verified locally
- ⏳ Awaiting manual Vercel deployment via dashboard
