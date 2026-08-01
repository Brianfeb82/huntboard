import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { interviewSchema, validationError } from "@/lib/application-schemas";

type Context = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Context) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const parsed = interviewSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(validationError(parsed.error.issues), { status: 400 });
    }

    const { id: applicationId } = await params;
    const owned = await prisma.application.findFirst({
      where: { id: applicationId, userId: user.id },
      select: { id: true },
    });
    if (!owned) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const interview = await prisma.interview.create({
      data: { ...parsed.data, applicationId },
    });

    return NextResponse.json({ interview }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
}
