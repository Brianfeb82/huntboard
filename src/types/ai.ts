export type AiSuggestionView = {
  id: string;
  applicationId: string;
  resumeId: string;
  matchScore: number;
  keywords: string[];
  missing: string[];
  suggestions: string[];
  createdAt: string;
};

export function splitSuggestions(text: string) {
  return text
    .split(/\n+/)
    .map((line) => line.replace(/^\s*[-*•]\s*/, "").trim())
    .filter(Boolean);
}
