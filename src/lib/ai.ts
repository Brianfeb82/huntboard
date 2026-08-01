import { z } from "zod";

export const tailorResultSchema = z.object({
  matchScore: z.number().int().min(0).max(100),
  keywords: z.array(z.string()).max(60),
  missing: z.array(z.string()).max(60),
  suggestions: z.array(z.string()).max(30),
});

export const analyzeJdResultSchema = z.object({
  keywords: z.array(z.string()).max(60),
  requirements: z.array(z.string()).max(30),
  seniority: z.string().max(60),
});

export type TailorResult = z.infer<typeof tailorResultSchema>;
export type AnalyzeJdResult = z.infer<typeof analyzeJdResultSchema>;

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-2.0-flash";
const AI_BASE_URL = process.env.AI_BASE_URL;
const AI_MODEL = process.env.AI_MODEL;
const AI_API_KEY = process.env.AI_API_KEY ?? "local";

export function isAiConfigured() {
  return Boolean(GEMINI_API_KEY || (AI_BASE_URL && AI_MODEL));
}

export function missingAiConfig() {
  if (GEMINI_API_KEY) return null;
  if (AI_BASE_URL && AI_MODEL) return null;
  return "AI is not configured. Set GEMINI_API_KEY (or AI_BASE_URL + AI_MODEL for local dev).";
}

const SYSTEM_PROMPT =
  "You are an expert resume reviewer. You analyze how well a candidate's resume matches a job description and return ONLY valid JSON. Never include markdown code fences or prose outside the JSON.";

export function tailorPrompt(jobDescription: string, resumeText: string) {
  return [
    "Job Description:",
    jobDescription,
    "",
    "Resume:",
    resumeText,
    "",
    "Analyze the gap between this resume and the job description. ",
    'Return JSON exactly in this shape: {"matchScore": 0-100 integer, "keywords": [strings - important keywords found in the JD], "missing": [strings - keywords in the JD that are absent or weak in the resume], "suggestions": [strings - 3 to 6 specific, actionable changes to tailor the resume for this role]}.',
  ].join("\n");
}

export function analyzeJdPrompt(jobDescription: string) {
  return [
    "Job Description:",
    jobDescription,
    "",
    "Extract the key information from this job description. ",
    'Return JSON exactly in this shape: {"keywords": [strings - important skills and technologies mentioned], "requirements": [strings - must-have qualifications and experience], "seniority": "one phrase describing the level, e.g. intern, junior, mid, senior"}.',
  ].join("\n");
}

export function parseAiResponse<S extends z.ZodTypeAny>(
  text: string,
  schema: S
): z.infer<S> {
  const cleaned = text
    .replace(/```(?:json)?/g, "")
    .trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("AI response contained no JSON object");
  }
  return schema.parse(JSON.parse(cleaned.slice(start, end + 1))) as z.infer<S>;
}

async function callGemini<S extends z.ZodTypeAny>(prompt: string, schema: S) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.3,
          maxOutputTokens: 4096,
        },
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini API error ${response.status}: ${await response.text()}`);
  }

  const data = await response.json();
  const text =
    data?.candidates?.[0]?.content?.parts
      ?.map((part: { text?: string }) => part.text ?? "")
      .join("") ?? "";

  if (!text) throw new Error("Gemini returned an empty response");
  return parseAiResponse(text, schema);
}

async function callOpenAiCompat<S extends z.ZodTypeAny>(prompt: string, schema: S) {
  const response = await fetch(`${AI_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${AI_API_KEY}`,
    },
    body: JSON.stringify({
      model: AI_MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
      stream: false,
    }),
  });

  if (!response.ok) {
    throw new Error(`AI API error ${response.status}: ${await response.text()}`);
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content ?? "";
  if (!text) throw new Error("AI returned an empty response");
  return parseAiResponse(text, schema);
}

async function runAi<S extends z.ZodTypeAny>(prompt: string, schema: S) {
  if (GEMINI_API_KEY) return callGemini(prompt, schema);
  if (AI_BASE_URL && AI_MODEL) return callOpenAiCompat(prompt, schema);
  throw new Error("AI is not configured");
}

export async function tailorResume(
  jobDescription: string,
  resumeText: string
): Promise<TailorResult> {
  return runAi(tailorPrompt(jobDescription, resumeText), tailorResultSchema);
}

export async function analyzeJobDescription(
  jobDescription: string
): Promise<AnalyzeJdResult> {
  return runAi(analyzeJdPrompt(jobDescription), analyzeJdResultSchema);
}
