import { describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";
import { extractPdfText } from "@/lib/resume";

describe("extractPdfText", () => {
  it("extracts known text from a text-based PDF", async () => {
    const buffer = await readFile("tests/fixtures/sample-resume.pdf");
    const text = await extractPdfText(buffer);

    expect(text).toContain("Nedri Febrianto");
    expect(text).toContain("Python");
    expect(text).toContain("ETL");
  });
});
