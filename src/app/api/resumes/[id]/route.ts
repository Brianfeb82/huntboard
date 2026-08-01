import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { deleteStoredResumeFile } from "@/lib/resume";

type Context = { params: Promise<{ id: string }> };

async function findOwnedResume(id: string, userId: string) {
  return prisma.resume.findFirst({ where: { id, userId } });
}

export async function PATCH(req: Request, { params }: Context) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { isActive?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (typeof body.isActive !== "boolean") {
    return NextResponse.json({ error: "isActive must be a boolean" }, { status: 400 });
  }

  const { id } = await params;
  const owned = await findOwnedResume(id, user.id);
  if (!owned) return NextResponse.json({ error: "Resume not found" }, { status: 404 });

  const resume = await prisma.$transaction(async (tx) => {
    if (body.isActive) {
      await tx.resume.updateMany({
        where: { userId: user.id },
        data: { isActive: false },
      });
    }
    return tx.resume.update({
      where: { id },
      data: { isActive: body.isActive },
    });
  });

  return NextResponse.json({ resume });
}

export async function DELETE(_: Request, { params }: Context) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const owned = await findOwnedResume(id, user.id);
  if (!owned) return NextResponse.json({ error: "Resume not found" }, { status: 404 });

  await deleteStoredResumeFile(owned.fileUrl);
  await prisma.resume.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
