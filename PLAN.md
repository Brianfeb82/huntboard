# HuntBoard — Job Application Tracker with AI Resume Tailoring

## PROJECT OVERVIEW

A fullstack web app that helps job seekers track their applications on a Kanban board and uses AI to tailor their resume for each job description. Built to solve a real problem (you're a student looking for internships) while demonstrating fullstack competence.

---

## GOALS

### Primary Goals
1. Ship a deployable fullstack app that works end-to-end
2. Demonstrate: auth, CRUD, drag-and-drop UI, AI integration, file parsing, dashboard analytics, deployment
3. Add to portfolio as the "flagship" fullstack project
4. Actually use it for your own job hunt

### Success Criteria
- User can sign up, log in, and manage their applications
- Kanban board supports drag-and-drop between 4 columns (Applied, Interview, Offer, Rejected)
- User can paste a job description + select a resume, AI returns keyword gaps and tailored suggestions
- Dashboard shows application stats (total, response rate, upcoming deadlines, status breakdown)
- App is deployed live on Vercel with a PostgreSQL database
- Clean, responsive UI that works on mobile

### Non-Goals (for v1)
- No social features (sharing boards, comments)
- No email notifications (can add later)
- No multi-resume versioning system (one resume at a time for v1)
- No browser extension for auto-importing job postings

---

## TECH STACK

| Layer | Technology | Reason |
|-------|-----------|--------|
| Frontend | Next.js 15 (App Router) + TypeScript | You already use it (StudySpark) |
| Styling | Tailwind CSS + shadcn/ui | Fast, clean, consistent components |
| Database | PostgreSQL (Neon free tier) | Free hosted Postgres, reliable |
| ORM | Prisma | Type-safe, migrations, good DX |
| Auth | NextAuth.js (Credentials provider) | Simple, no third-party dependency |
| AI | Gemini 1.5 Flash API | You already have access, cheap/fast |
| File Upload | UploadThing or local + Vercel Blob | For resume PDF uploads |
| PDF Parsing | pdf-parse (server-side) | Extract text from uploaded resumes |
| Drag & Drop | @dnd-kit/core | Modern, accessible, works on mobile |
| Charts | Recharts | Simple, React-native charts |
| Deployment | Vercel (app) + Neon (database) | Both free tiers, zero cost |
| Validation | Zod | Schema validation for API + forms |

Total cost: $0 (all free tiers)

---

## SYSTEM ARCHITECTURE

```
┌─────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                   │
│                                                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │ Kanban   │  │ Dashboard│  │ AI Tailor Panel  │  │
│  │ Board    │  │ Charts   │  │ JD input + Resume │  │
│  │ (dnd-kit)│  │ (Recharts)│  │ Suggestions UI   │  │
│  └──────────┘  └──────────┘  └──────────────────┘  │
└──────────────────────┬──────────────────────────────┘
                       │ HTTPS
┌──────────────────────▼──────────────────────────────┐
│              NEXT.JS (APP ROUTER)                     │
│                                                       │
│  ┌─────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │  Pages   │  │  API Routes  │  │  Server Actions  │  │
│  │          │  │              │  │                  │  │
│  │ /login   │  │ /api/auth    │  │ createApp()      │  │
│  │ /board   │  │ /api/apps    │  │ updateStatus()   │  │
│  │ /stats   │  │ /api/ai      │  │ deleteApp()      │  │
│  │ /tailor  │  │ /api/resumes │  │                  │  │
│  └─────────┘  └─────────────┘  └─────────────────┘  │
│                                                       │
│  ┌───────────────────────────────────────────────┐   │
│  │                SERVICE LAYER                    │   │
│  │  authService  appService  aiService  resumeSvc │   │
│  └───────────────────────────────────────────────┘   │
└──────┬────────────────┬──────────────────┬───────────┘
       │                │                  │
┌──────▼──────┐  ┌─────▼─────┐  ┌──────▼──────────┐
│  PostgreSQL  │  │  Gemini   │  │  Vercel Blob    │
│   (Neon)     │  │   API     │  │  (PDF Storage)  │
│              │  │           │  │                  │
│  users       │  │ Tailoring │  │  /resumes/*.pdf  │
│  applications│  │ JD analysis│ │                  │
│  resumes     │  │ Keywords  │  │                  │
│  interviews  │  │           │  │                  │
└──────────────┘  └───────────┘  └──────────────────┘
```

---

## DATA MODEL (Prisma Schema)

```
User
├── id           String   @id @default(cuid())
├── email        String   @unique
├── passwordHash String
├── name         String
├── createdAt    DateTime @default(now())
└── applications Application[]

Application
├── id             String   @id @default(cuid())
├── userId         String   (FK → User)
├── company        String
├── role           String
├── salaryMin      Int?     (optional)
├── salaryMax      Int?     (optional)
├── status         Status   (APPLIED | INTERVIEW | OFFER | REJECTED)
├── jobDescription Text     (pasted JD text)
├── location       String?
├── jobUrl         String?
├── deadline       DateTime?
├── notes          String?
├── createdAt      DateTime @default(now())
├── updatedAt      DateTime @updatedAt
├── interviews     Interview[]
└── aiSuggestions  AiSuggestion[]

Interview
├── id              String   @id @default(cuid())
├── applicationId   String   (FK → Application)
├── date            DateTime
├── type            InterviewType (PHONE | TECHNICAL | BEHAVIORAL | ONSITE)
├── notes           String?
├── outcome         String?
└── createdAt       DateTime @default(now())

Resume
├── id           String   @id @default(cuid())
├── userId        String   (FK → User)
├── filename      String
├── fileUrl       String   (Vercel Blob URL)
├── contentText   Text     (extracted via pdf-parse)
├── isActive      Boolean  @default(false)
└── createdAt     DateTime @default(now())

AiSuggestion
├── id            String   @id @default(cuid())
├── applicationId String   (FK → Application)
├── resumeId      String   (FK → Resume)
├── matchScore    Int      (0-100, how well resume matches JD)
├── keywords      Json     (extracted keywords from JD)
├── missing       Json     (keywords in JD not found in resume)
├── suggestions   Text     (AI-generated tailoring advice)
└── createdAt     DateTime @default(now())
```

---

## API DESIGN

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/auth/register | Create account |
| POST | /api/auth/login | Login, set session |
| POST | /api/auth/logout | Clear session |
| GET | /api/auth/me | Get current user |

### Applications
| Method | Route | Description |
|--------|-------|-------------|
| GET | /api/applications | List all apps for user |
| POST | /api/applications | Create new application |
| GET | /api/applications/:id | Get single application |
| PATCH | /api/applications/:id | Update application |
| DELETE | /api/applications/:id | Delete application |
| PATCH | /api/applications/:id/status | Update status (kanban drag) |

### Interviews
| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/applications/:id/interviews | Add interview |
| PATCH | /api/interviews/:id | Update interview |
| DELETE | /api/interviews/:id | Delete interview |

### Resumes
| Method | Route | Description |
|--------|-------|-------------|
| GET | /api/resumes | List user's resumes |
| POST | /api/resumes | Upload PDF, parse text |
| DELETE | /api/resumes/:id | Delete resume |
| PATCH | /api/resumes/:id/activate | Set as active resume |

### AI
| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/ai/tailor | Body: { applicationId, resumeId } → match score, missing keywords, suggestions |
| POST | /api/ai/analyze-jd | Body: { jobDescription } → extracted keywords, requirements, seniority |

### Dashboard
| Method | Route | Description |
|--------|-------|-------------|
| GET | /api/dashboard/stats | Returns: total apps, by status, response rate, upcoming deadlines |

---

## AI TAILORING FLOW

```
User flow:
1. User adds a new application, pastes the job description
2. User uploads their resume (PDF) → server extracts text with pdf-parse
3. User clicks "Tailor My Resume" on an application card
4. Backend sends to Gemini API:

   PROMPT STRUCTURE:
   - System: "You are an expert resume reviewer..."
   - User: "Job Description: [JD text]\n\nResume: [resume text]\n\n
            Analyze the gap between this resume and job description.
            Return JSON with: matchScore (0-100), keywords found in JD,
            keywords missing from resume, specific suggestions to tailor
            resume for this role."

5. Gemini returns structured JSON
6. Saved to AiSuggestion table
7. Frontend displays:
   - Match score (circular progress)
   - Keywords found (green tags)
   - Keywords missing (red tags)
   - Actionable suggestions (bullet list)

WHY THIS IS IMPRESSIVE:
- Shows you can integrate LLMs into a real product (not just a chatbot)
- Structured output (JSON) not free-text
- Persistent (saved to DB, user can review later)
- Practical value (users actually benefit from this)
```

---

## PAGE STRUCTURE (App Router)

```
app/
├── layout.tsx                 # Root layout, fonts, providers
├── page.tsx                   # Landing page (if not authed) or redirect to /board
├── (auth)/
│   ├── login/page.tsx         # Login form
│   └── register/page.tsx      # Register form
├── (dashboard)/
│   ├── layout.tsx             # Sidebar nav, auth guard
│   ├── board/page.tsx         # Kanban board (main view)
│   ├── applications/
│   │   ├── new/page.tsx       # New application form
│   │   └── [id]/page.tsx      # Application detail + interview log
│   ├── tailor/page.tsx        # AI resume tailoring interface
│   ├── resumes/page.tsx       # Resume upload + management
│   └── stats/page.tsx         # Dashboard with charts
└── api/
    ├── auth/[...nextauth]/route.ts
    ├── applications/route.ts
    ├── applications/[id]/route.ts
    ├── applications/[id]/status/route.ts
    ├── applications/[id]/interviews/route.ts
    ├── resumes/route.ts
    ├── resumes/[id]/route.ts
    ├── ai/tailor/route.ts
    ├── ai/analyze-jd/route.ts
    └── dashboard/stats/route.ts
```

---

## BUILD PLAN — 6 PHASES

### PHASE 1: Project Setup + Database (Day 1)
- [ ] Initialize Next.js 15 project with TypeScript + Tailwind
- [ ] Set up Prisma + connect to Neon PostgreSQL
- [ ] Write Prisma schema (all 5 models)
- [ ] Run initial migration
- [ ] Set up shadcn/ui components
- [ ] Configure environment variables (.env.local)
- [ ] Create GitHub repo

DELIVERABLE: Project skeleton with database connection working.

### PHASE 2: Authentication (Day 2)
- [ ] Install NextAuth.js
- [ ] Configure Credentials provider
- [ ] Build register page + API
- [ ] Build login page + API
- [ ] Add auth middleware (protect /dashboard routes)
- [ ] Create session helper functions
- [ ] Test: register, login, logout, protected routes

DELIVERABLE: Working auth flow, protected routes.

### PHASE 3: Core CRUD — Applications + Kanban Board (Day 3-4)
- [ ] Create Application API routes (full CRUD)
- [ ] Build Kanban board UI with 4 columns
- [ ] Integrate @dnd-kit for drag-and-drop between columns
- [ ] Build "New Application" form (company, role, salary, JD, deadline)
- [ ] Build application detail page
- [ ] Add application card component (company, role, status badge, deadline)
- [ ] Implement status update on drag (PATCH /api/applications/:id/status)
- [ ] Add interview logging on application detail page
- [ ] Test: create, read, update, delete, drag between columns

DELIVERABLE: Fully functional Kanban board with CRUD.

### PHASE 4: Resume Upload + Parsing (Day 5)
- [ ] Set up Vercel Blob storage
- [ ] Build resume upload UI (drag-and-drop file zone)
- [ ] Implement PDF text extraction (pdf-parse, server-side)
- [ ] Save resume text to database
- [ ] Build resume management page (list, set active, delete)
- [ ] Test: upload PDF, verify text extraction works

DELIVERABLE: Working resume upload and text extraction.

### PHASE 5: AI Resume Tailoring (Day 6)
- [ ] Set up Gemini API client (server-side)
- [ ] Build /api/ai/analyze-jd endpoint (extract keywords from JD)
- [ ] Build /api/ai/tailor endpoint (compare resume vs JD)
- [ ] Design AI suggestion prompt for structured JSON output
- [ ] Build tailor UI page:
  - Select application + select resume
  - Display match score (circular gauge)
  - Keywords found vs missing (tag clouds)
  - Suggestions list
- [ ] Save suggestions to database for later review
- [ ] Test: paste real JD, upload real resume, verify suggestions are useful

DELIVERABLE: AI tailoring feature working end-to-end.

### PHASE 6: Dashboard + Polish + Deploy (Day 7)
- [ ] Build /api/dashboard/stats endpoint
- [ ] Build stats page:
  - Total applications counter
  - Status breakdown (pie chart)
  - Response rate (interviews / total)
  - Upcoming deadlines (list)
  - Applications over time (line chart)
- [ ] Add loading states + error handling across all pages
- [ ] Mobile responsive audit
- [ ] Add empty states (no applications yet, etc.)
- [ ] Deploy to Vercel
- [ ] Set up Neon production database
- [ ] Run Prisma migrate on production
- [ ] Final test on deployed URL
- [ ] Add project to portfolio

DELIVERABLE: Live deployed app, ready to add to portfolio.

---

## FILE STRUCTURE

```
huntboard/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── app/                    # (see page structure above)
│   ├── lib/
│   │   ├── prisma.ts           # Prisma client singleton
│   │   ├── auth.ts             # NextAuth config
│   │   ├── gemini.ts           # Gemini API client
│   │   ├── pdf.ts              # PDF parsing utility
│   │   └── utils.ts            # Helper functions
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── kanban/             # Board, Column, Card, Draggable
│   │   ├── forms/              # ApplicationForm, ResumeUpload
│   │   ├── ai/                 # TailorPanel, MatchScore, KeywordTags
│   │   ├── dashboard/          # Charts, StatsCards
│   │   └── layout/             # Sidebar, Header, AuthGuard
│   ├── types/
│   │   └── index.ts            # Shared TypeScript types
│   └── middleware.ts           # Auth route protection
├── .env.local                  # GEMINI_API_KEY, DATABASE_URL, etc.
├── package.json
├── tailwind.config.ts
└── next.config.js
```

---

## ENVIRONMENT VARIABLES NEEDED

```
DATABASE_URL=           # Neon PostgreSQL connection string
NEXTAUTH_SECRET=        # Random string for session signing
NEXTAUTH_URL=           # http://localhost:3000 (dev) or production URL
GEMINI_API_KEY=         # Google Gemini API key
BLOB_READ_WRITE_TOKEN=  # Vercel Blob storage token
```

---

## RISKS + MITIGATIONS

| Risk | Mitigation |
|------|-----------|
| Gemini API returns unstructured text | Use structured JSON prompt + Zod validation on response. Retry on parse failure. |
| PDF parsing fails on some resumes | Fallback: let user paste resume text manually if upload fails |
| Kanban drag performance on mobile | Use @dnd-kit touch sensors, limit cards per column |
| Neon free tier sleeps after inactivity | First request may be slow (cold start). Acceptable for portfolio project. |
| Gemini API rate limits | Cache suggestions in DB. Only re-run if JD or resume changes. |

---

## WHAT THIS PROJECT PROVES TO CLIENTS/EMPLOYERS

1. Fullstack capability — auth, database, API design, CRUD, file handling
2. AI integration — LLM in a real product context, structured output, prompt engineering
3. UI/UX — drag-and-drop, responsive design, clean dashboard
4. Deployment — live, accessible, production-ready
5. Practical thinking — solves a real problem, not a toy demo
