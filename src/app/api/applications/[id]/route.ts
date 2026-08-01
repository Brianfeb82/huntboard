import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { applicationUpdateSchema, validationError } from "@/lib/application-schemas";

type Context = { params: Promise<{ id: string }> };

async function findOwnedApplication(id: string, userId: string) {
  return prisma.application.findFirst({
    where: { id, userId },
    include: { interviews: { orderBy: { date: "asc" } } },
  });
}

export async function GET(_: Request, { params }: Context) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const application = await findOwnedApplication((await params).id, user.id);
  if (!application) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }

  return NextResponse.json({ application });
}

export async function PATCH(req: Request, { params }: Context) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const parsed = applicationUpdateSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(validationError(parsed.error.issues), { status: 400 });
    }
    if (Object.keys(parsed.data).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const { id } = await params;
    const owned = await findOwnedApplication(id, user.id);
    if (!owned) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const application = await prisma.application.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json({ application });
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
}

export async function DELETE(_: Request, { params }: Context) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const owned = await findOwnedApplication(id, user.id);
  if (!owned) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }

  await prisma.application.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
