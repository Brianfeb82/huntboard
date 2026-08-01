import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { applicationSchema, validationError } from "@/lib/application-schemas";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const applications = await prisma.application.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    include: {
      interviews: { orderBy: { date: "asc" } },
    },
  });

  return NextResponse.json({ applications });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const parsed = applicationSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(validationError(parsed.error.issues), { status: 400 });
    }

    const application = await prisma.application.create({
      data: { ...parsed.data, jobDescription: parsed.data.jobDescription ?? "", userId: user.id },
    });

    return NextResponse.json({ application }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
}
