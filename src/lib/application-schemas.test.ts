import { describe, expect, it } from "vitest";
import { applicationSchema, applicationStatusSchema } from "@/lib/application-schemas";

describe("applicationSchema", () => {
  it("rejects a salary range whose minimum exceeds its maximum", () => {
    const result = applicationSchema.safeParse({
      company: "Acme",
      role: "Software Engineer",
      salaryMin: 90_000,
      salaryMax: 70_000,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(["salaryMax"]);
    }
  });

  it("normalizes blank optional values to null", () => {
    const result = applicationSchema.parse({
      company: "Acme",
      role: "Software Engineer",
      location: "  ",
      jobUrl: "",
      notes: " ",
    });

    expect(result.location).toBeNull();
    expect(result.jobUrl).toBeNull();
    expect(result.notes).toBeNull();
  });
});

describe("applicationStatusSchema", () => {
  it("only accepts board column statuses", () => {
    expect(applicationStatusSchema.safeParse({ status: "INTERVIEW" }).success).toBe(true);
    expect(applicationStatusSchema.safeParse({ status: "DRAFT" }).success).toBe(false);
  });
});
