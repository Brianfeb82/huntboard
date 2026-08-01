import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";

// Dev-only: serves files stored by the local storage fallback (no Vercel
// Blob token configured). Production uploads live in Vercel Blob instead.
type Context = { params: Promise<{ name: string }> };

export async function GET(_: Request, { params }: Context) {
  const name = (await params).name;
  if (!/^[a-zA-Z0-9._-]+$/.test(name)) {
    return NextResponse.json({ error: "Invalid file name" }, { status: 400 });
  }

  try {
    const buffer = await readFile(path.join(".local-storage", name));
    return new NextResponse(buffer, {
      headers: { "Content-Type": "application/pdf" },
    });
  } catch {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}
