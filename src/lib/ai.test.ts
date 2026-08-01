import { describe, expect, it } from "vitest";
import {
  analyzeJdPrompt,
  parseAiResponse,
  tailorPrompt,
  tailorResultSchema,
} from "@/lib/ai";

describe("tailorPrompt", () => {
  it("includes both the job description and the resume", () => {
    const prompt = tailorPrompt("Senior React role", "Nedri knows React");
    expect(prompt).toContain("Job Description:");
    expect(prompt).toContain("Senior React role");
    expect(prompt).toContain("Resume:");
    expect(prompt).toContain("Nedri knows React");
  });
});

describe("analyzeJdPrompt", () => {
  it("asks for structured fields", () => {
    const prompt = analyzeJdPrompt("Some JD");
    expect(prompt).toContain("keywords");
    expect(prompt).toContain("requirements");
    expect(prompt).toContain("seniority");
  });
});

describe("parseAiResponse", () => {
  it("parses plain JSON", () => {
    const result = parseAiResponse(
      JSON.stringify({ matchScore: 72, keywords: ["React"], missing: ["Docker"], suggestions: ["Add Docker"] }),
      tailorResultSchema
    );
    expect(result.matchScore).toBe(72);
    expect(result.keywords).toEqual(["React"]);
  });

  it("strips markdown code fences", () => {
    const text = "```json\n{\"matchScore\": 40, \"keywords\": [], \"missing\": [\"SQL\"], \"suggestions\": [\"Add SQL\"]}\n```";
    const result = parseAiResponse(text, tailorResultSchema);
    expect(result.matchScore).toBe(40);
    expect(result.missing).toEqual(["SQL"]);
  });

  it("rejects a response with an out-of-range match score", () => {
    expect(() =>
      parseAiResponse(
        JSON.stringify({ matchScore: 150, keywords: [], missing: [], suggestions: [] }),
        tailorResultSchema
      )
    ).toThrow();
  });

  it("rejects a response missing required fields", () => {
    expect(() =>
      parseAiResponse(JSON.stringify({ matchScore: 50 }), tailorResultSchema)
    ).toThrow();
  });

  it("throws when the response is not JSON", () => {
    expect(() => parseAiResponse("sorry, no JSON here", tailorResultSchema)).toThrow();
  });
});
