import { Status } from "@/generated/prisma/enums";
import { z } from "zod";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((value) => (value === undefined ? undefined : value || null));

const optionalNonNegativeInt = z
  .number()
  .int()
  .nonnegative()
  .nullable()
  .optional()
  .transform((value) => (value === undefined ? undefined : value ?? null));

const optionalDate = z
  .string()
  .datetime({ offset: true })
  .optional()
  .transform((value) =>
    value === undefined ? undefined : value ? new Date(value) : null
  );

const applicationFields = {
  company: z.string().trim().min(1, "Company is required").max(120),
  role: z.string().trim().min(1, "Role is required").max(160),
  salaryMin: optionalNonNegativeInt,
  salaryMax: optionalNonNegativeInt,
  status: z.nativeEnum(Status).optional(),
  jobDescription: z
    .string()
    .trim()
    .max(30_000)
    .optional()
    .transform((value) => (value === undefined ? undefined : value || "")),
  location: optionalText(160),
  jobUrl: z
    .string()
    .trim()
    .url("Enter a valid URL")
    .max(2_048)
    .optional()
    .or(z.literal(""))
    .transform((value) => value || null),
  deadline: optionalDate,
  notes: optionalText(10_000),
};

const addSalaryRangeValidation = (
  data: { salaryMin?: number | null; salaryMax?: number | null },
  ctx: z.RefinementCtx
) => {
  if (
    data.salaryMin !== undefined &&
    data.salaryMax !== undefined &&
    data.salaryMin !== null &&
    data.salaryMax !== null &&
    data.salaryMin > data.salaryMax
  ) {
    ctx.addIssue({
      code: "custom",
      path: ["salaryMax"],
      message: "Maximum salary must be at least the minimum salary",
    });
  }
};

export const applicationSchema = z
  .object(applicationFields)
  .superRefine(addSalaryRangeValidation);

export const applicationUpdateSchema = z
  .object(applicationFields)
  .partial()
  .superRefine(addSalaryRangeValidation);

export const applicationStatusSchema = z.object({
  status: z.nativeEnum(Status),
});

export const interviewSchema = z.object({
  date: z.string().datetime({ offset: true }).transform((value) => new Date(value)),
  type: z.enum(["PHONE", "TECHNICAL", "BEHAVIORAL", "ONSITE"]),
  notes: optionalText(10_000),
  outcome: optionalText(1_000),
});

export function validationError(issues: z.core.$ZodIssue[]) {
  return { error: "Validation failed", issues };
}
