import { put } from "@vercel/blob";

export type StoredResumeFile = {
  fileUrl: string;
  storage: "blob" | "local";
};

export const BLOB_READ_WRITE_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

export function isBlobConfigured() {
  return Boolean(BLOB_READ_WRITE_TOKEN);
}

export async function extractPdfText(buffer: Buffer) {
  // pdfjs needs DOMMatrix/ImageData/Path2D in Node/Vercel. Load the worker
  // shim before importing PDFParse so serverless cold starts do not crash.
  await import("pdf-parse/worker");
  const { PDFParse } = await import("pdf-parse");

  const parser = new PDFParse({ data: buffer });
  try {
    const result = await parser.getText();
    const text = result.text?.trim() ?? "";
    if (!text) {
      throw new Error("No text could be extracted from this PDF");
    }
    return text;
  } finally {
    await parser.destroy();
  }
}

export async function storeResumeFile(
  filename: string,
  buffer: Buffer
): Promise<StoredResumeFile> {
  if (!isBlobConfigured()) {
    // Local dev fallback: save to .local-storage so the flow works without
    // a Vercel Blob token. Replaced by Blob in production automatically.
    const name = `${crypto.randomUUID()}-${filename.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const fs = await import("node:fs/promises");
    await fs.mkdir(".local-storage", { recursive: true });
    await fs.writeFile(`.local-storage/${name}`, buffer);
    return { fileUrl: `/local-resume/${name}`, storage: "local" };
  }

  const blob = await put(filename, buffer, { access: "public" });
  return { fileUrl: blob.url, storage: "blob" };
}

export async function deleteStoredResumeFile(fileUrl: string) {
  if (fileUrl.startsWith("/local-resume/")) {
    const fs = await import("node:fs/promises");
    const name = fileUrl.replace("/local-resume/", "");
    await fs.unlink(`.local-storage/${name}`).catch(() => {});
    return;
  }
  const { del } = await import("@vercel/blob");
  await del(fileUrl).catch(() => {});
}
