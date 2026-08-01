# HuntBoard

A fullstack Next.js job application tracker with AI-powered resume tailoring. Built with Next.js 16, Prisma, PostgreSQL, and Google Gemini.

![HuntBoard Dashboard](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma)
![License](https://img.shields.io/badge/license-MIT-green)

## Features

- 🎯 **Kanban Board** — Drag and drop applications between stages (Applied, Interview, Offer, Rejected)
- 🤖 **AI Resume Tailoring** — Match your resume against job descriptions, get keyword gaps and tailored suggestions
- 📊 **Dashboard Analytics** — Track application stats, response rates, and upcoming deadlines
- 📄 **Resume Management** — Upload PDFs, automatic text extraction
- 🔐 **Secure Auth** — NextAuth.js with credentials provider
- 📱 **Mobile Responsive** — Works seamlessly on all devices
- 🎨 **Modern UI** — Built with shadcn/ui + Tailwind CSS

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router), TypeScript, Tailwind CSS v4 |
| UI Components | shadcn/ui (Radix + Nova preset) |
| Backend | Next.js API Routes, Server Components |
| Database | PostgreSQL (Neon) |
| ORM | Prisma 7 |
| Auth | NextAuth.js v4 |
| AI | Google Gemini 2.0 Flash API |
| File Storage | Vercel Blob (with local fallback) |
| PDF Parsing | pdf-parse |
| Drag & Drop | @dnd-kit/core |
| Charts | Recharts |
| Deployment | Vercel |

## Getting Started

### Prerequisites

- Node.js 22+ and npm
- PostgreSQL database (Neon free tier works)
- Google Gemini API key (free tier: 15 RPM)

### Installation

```bash
# Clone the repository
git clone https://github.com/Brianfeb82/huntboard.git
cd huntboard

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

```bash
# Database
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_SECRET="[openssl rand -base64 32]"
NEXTAUTH_URL="http://localhost:3000"

# AI Provider
GEMINI_API_KEY="your-key"
GEMINI_MODEL="gemini-2.0-flash"  # optional

# Vercel Blob (optional, uses local storage if unset)
BLOB_READ_WRITE_TOKEN="your-token"
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for production setup.

## Project Structure

```
huntboard/
├── prisma/
│   ├── schema.prisma          # Database schema (5 models)
│   └── migrations/            # SQL migrations
├── src/
│   ├── app/
│   │   ├── (auth)/            # Login, register
│   │   ├── (dashboard)/       # Board, applications, resumes, tailor, stats
│   │   └── api/               # API routes (auth, CRUD, AI)
│   ├── components/
│   │   ├── ui/                # shadcn/ui components
│   │   ├── kanban/            # Board, Column, Card
│   │   ├── forms/             # ApplicationForm, ResumeUpload
│   │   ├── ai/                # TailorPanel, MatchScore
│   │   └── dashboard/         # Charts, StatsCards
│   ├── lib/
│   │   ├── prisma.ts          # Database client
│   │   ├── auth.ts            # NextAuth config
│   │   ├── ai.ts              # Gemini API client
│   │   └── resume.ts          # PDF parsing
│   └── types/                 # TypeScript types
├── tests/
│   └── fixtures/              # Test PDFs
└── scripts/
    └── make-test-pdf.py       # Test data generator
```

## Database Schema

5 main models:
- **User** — Auth and profile
- **Application** — Job applications (company, role, status, JD, deadline)
- **Interview** — Interview logs (date, type, notes)
- **Resume** — Uploaded resumes (filename, URL, extracted text)
- **AiSuggestion** — AI tailoring results (match score, keywords, suggestions)

## API Routes

### Auth
- `POST /api/auth/register` — Create account
- `POST /api/auth/callback/credentials` — Login
- `GET /api/auth/session` — Current user

### Applications
- `GET /api/applications` — List all
- `POST /api/applications` — Create
- `PATCH /api/applications/:id` — Update
- `DELETE /api/applications/:id` — Delete
- `PATCH /api/applications/:id/status` — Kanban drag

### Resumes
- `POST /api/resumes` — Upload PDF
- `GET /api/resumes/:id` — Get resume
- `DELETE /api/resumes/:id` — Delete

### AI
- `POST /api/ai/tailor` — Match resume vs JD
- `POST /api/ai/analyze-jd` — Extract keywords from JD

### Dashboard
- `GET /api/dashboard/stats` — Aggregated stats

## Development

```bash
# Run tests
npm test

# Lint
npm run lint

# Build
npm run build

# Database commands
npx prisma studio              # Open Prisma Studio
npx prisma migrate dev         # Create migration
npx prisma generate            # Regenerate client
```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

Quick deploy to Vercel:

```bash
npm install -g vercel
vercel
vercel --prod
```

## Screenshots

### Kanban Board
Drag and drop applications between stages. Empty state shown when no applications exist.

### AI Tailor
Match score gauge, keyword analysis, and actionable suggestions.

### Dashboard
Stats cards, pie chart status breakdown, timeline chart, and upcoming deadlines.

## Contributing

This is a portfolio project. Feel free to fork and adapt for your own use.

## License

MIT License - see [LICENSE](./LICENSE) for details.

## Author

**Nedri Febrianto (Brian)**  
Data Science & Cloud Engineering Student at Universitas Gunadarma

- Portfolio: [brianfeb82.github.io](https://brianfeb82.github.io)
- GitHub: [@Brianfeb82](https://github.com/Brianfeb82)

## Acknowledgments

- Built as a fullstack portfolio project to demonstrate:
  - Next.js 16 App Router + Server Components
  - Prisma ORM + PostgreSQL
  - NextAuth.js authentication
  - AI integration (LLM in production context)
  - Drag-and-drop UI with @dnd-kit
  - Responsive design with Tailwind CSS
  - File upload and parsing
  - Dashboard analytics with Recharts

---

**Live Demo**: [huntboard.vercel.app](https://huntboard.vercel.app) _(post-deployment)_
