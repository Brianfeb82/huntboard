import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { interviewSchema, validationError } from "@/lib/application-schemas";

type Context = { params: Promise<{ id: string }> };

async function findOwnedInterview(id: string, userId: string) {
  return prisma.interview.findFirst({
    where: { id, application: { userId } },
  });
}

export async function PATCH(req: Request, { params }: Context) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const parsed = interviewSchema.partial().safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(validationError(parsed.error.issues), { status: 400 });
    }
    if (Object.keys(parsed.data).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const { id } = await params;
    if (!(await findOwnedInterview(id, user.id))) {
      return NextResponse.json({ error: "Interview not found" }, { status: 404 });
    }

    const interview = await prisma.interview.update({ where: { id }, data: parsed.data });
    return NextResponse.json({ interview });
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
}

export async function DELETE(_: Request, { params }: Context) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!(await findOwnedInterview(id, user.id))) {
    return NextResponse.json({ error: "Interview not found" }, { status: 404 });
  }

  await prisma.interview.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
