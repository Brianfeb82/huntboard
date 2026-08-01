import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { computeStats } from "@/lib/stats";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const stats = await computeStats(user.id);
  return NextResponse.json(stats);
}
