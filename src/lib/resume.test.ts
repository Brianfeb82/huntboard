import { describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";
import { extractPdfText } from "@/lib/resume";

describe("extractPdfText", () => {
  it("extracts known text from the fixture PDF", async () => {
    const buffer = await readFile("tests/fixtures/sample-resume.pdf");
    const text = await extractPdfText(buffer);

    expect(text).toContain("Nedri Febrianto");
    expect(text).toContain("Data Engineer Intern");
    expect(text).toContain("Python");
  });

  it("works on a cold Node runtime without preloaded DOMMatrix", async () => {
    const globals = globalThis as unknown as Record<string, unknown>;
    delete globals.DOMMatrix;
    delete globals.Path2D;
    delete globals.ImageData;

    const buffer = await readFile("tests/fixtures/sample-resume.pdf");
    const text = await extractPdfText(buffer);

    expect(text).toContain("Nedri Febrianto");
  });
});
