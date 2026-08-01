"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Mode = "file" | "text";

export function ResumeUpload() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<Mode>("file");
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStage, setUploadStage] = useState<string | null>(null);

  async function uploadFile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) return;

    // Warn about large files
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > 5) {
      const proceed = confirm(
        `This PDF is ${sizeMB.toFixed(1)} MB. Large files may take 10-30 seconds to process.\n\n` +
        `For faster uploads:\n` +
        `• Compress the PDF (use a tool like smallpdf.com)\n` +
        `• Or use "Paste text" mode instead\n\n` +
        `Continue with upload?`
      );
      if (!proceed) return;
    }

    setUploading(true);
    setError(null);
    setUploadStage("Uploading and extracting text...");
    
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/resumes", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Upload failed");
        return;
      }
      event.currentTarget.reset();
      setFileName("");
      router.refresh();
    } catch (error) {
      setError("Network error. Check your connection and try again.");
    } finally {
      setUploading(false);
      setUploadStage(null);
    }
  }

  async function saveText(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const contentText = form.get("contentText")?.toString().trim() ?? "";
    const filename = form.get("filename")?.toString().trim() || "Pasted resume";

    if (!contentText) {
      setError("Paste your resume text first");
      return;
    }

    setUploading(true);
    setError(null);
    const response = await fetch("/api/resumes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename, contentText }),
    });
    const data = await response.json();
    setUploading(false);

    if (!response.ok) {
      setError(data.error ?? "Could not save resume");
      return;
    }
    event.currentTarget.reset();
    router.refresh();
  }

  return (
    <div>
      <div className="mb-4 inline-flex rounded-lg border p-1" role="tablist" aria-label="Resume input method">
        <button
          type="button"
          role="tab"
          aria-selected={mode === "file"}
          onClick={() => setMode("file")}
          className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm ${mode === "file" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
        >
          <FileText className="size-4" /> Upload PDF
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "text"}
          onClick={() => setMode("text")}
          className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm ${mode === "text" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
        >
          <Type className="size-4" /> Paste text
        </button>
      </div>

      {mode === "file" ? (
        <form onSubmit={uploadFile} className="space-y-4">
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors hover:bg-muted/50">
            <FileText className="size-8 text-muted-foreground" />
            <span className="font-medium">{fileName || "Choose a PDF resume"}</span>
            <span className="text-sm text-muted-foreground">
              PDF, up to 10 MB · Smaller files upload faster
            </span>
            <Input
              ref={fileRef}
              type="file"
              accept="application/pdf,.pdf"
              className="sr-only"
              onChange={(event) => setFileName(event.target.files?.[0]?.name ?? "")}
            />
          </label>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          {uploadStage && <p className="text-sm text-muted-foreground">{uploadStage}</p>}
          <Button type="submit" disabled={uploading || !fileName}>
            {uploading ? uploadStage || "Processing..." : "Upload resume"}
          </Button>
        </form>
      ) : (
        <form onSubmit={saveText} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="filename">Name</Label>
            <Input id="filename" name="filename" placeholder="My resume (fallback)" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contentText">Resume text</Label>
            <Textarea id="contentText" name="contentText" className="min-h-48" placeholder="Paste the full text of your resume here." />
          </div>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <Button type="submit" disabled={uploading}>
            {uploading ? "Saving..." : "Save resume"}
          </Button>
        </form>
      )}
    </div>
  );
}
