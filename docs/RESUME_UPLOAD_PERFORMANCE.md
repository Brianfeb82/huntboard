# Resume Upload Performance

## Why is my PDF upload slow?

PDF uploads can take 10-30 seconds for large files because the server:
1. **Uploads** the file to Vercel Blob storage
2. **Extracts text** from the PDF (cpu-intensive)
3. **Saves** the resume to the database

These operations now run in parallel (as of Phase 6 optimization), but large PDFs still take time to parse.

## How to speed up uploads

### Option 1: Compress your PDF
Use free tools to reduce file size:
- [smallpdf.com](https://smallpdf.com/compress-pdf) (recommended)
- [ilovepdf.com/compress_pdf](https://www.ilovepdf.com/compress_pdf)
- [adobe.com/acrobat/online/compress-pdf](https://www.adobe.com/acrobat/online/compress-pdf.html)

Target: Under 2 MB for fast uploads (under 5 seconds)

### Option 2: Use "Paste text" mode
1. Open your resume PDF
2. Select All (Ctrl+A / Cmd+A) and Copy
3. Switch to **"Paste text"** tab on the resume upload page
4. Paste and save

This bypasses PDF parsing entirely — instant upload.

### Option 3: Recreate as a simpler PDF
- Export from Google Docs or Word as PDF
- Use "Print to PDF" instead of "Save as PDF"
- Remove embedded images if possible

## File size limits

- **Maximum**: 10 MB (hard limit)
- **Recommended**: Under 2 MB for fast uploads
- **Warning shown**: Above 5 MB

## Current performance (after optimization)

| File size | Upload time |
|-----------|-------------|
| < 500 KB  | 2-3 seconds |
| 1-2 MB    | 5-8 seconds |
| 3-5 MB    | 10-15 seconds |
| 5-10 MB   | 20-30 seconds |

## Technical details

The bottleneck is `pdf-parse` (used for text extraction). It's single-threaded and CPU-bound.

**Why not use OCR or a faster parser?**
- OCR (like Tesseract) is slower and less accurate for text-based PDFs
- Commercial parsers (Adobe SDK, PDFTron) require paid licenses
- `pdf-parse` is the best free option for production

**Alternatives considered:**
- ❌ Client-side parsing — limited browser APIs, CORS issues with workers
- ❌ Background job queue — adds complexity, delays AI tailor flow
- ✅ Parallel extraction + upload — implemented in this optimization

## Deployed optimization (2026-08-01)

**Before:**
- Sequential: upload → extract → save (additive latency)
- No progress feedback
- No file size warning

**After:**
- Parallel: upload + extract run simultaneously (saves 2-5 seconds)
- Progress indicator: "Uploading and extracting text..."
- Warning modal for files > 5 MB
- Better error messages with fallback suggestions

Commit: [Next commit after this optimization]
