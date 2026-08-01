import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { SignOutButton } from "@/components/layout/sign-out-button";
import { DashboardNav } from "@/components/layout/dashboard-nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background">
        <div className="mx-auto flex min-h-14 max-w-7xl flex-wrap items-center gap-x-5 gap-y-2 px-4 py-2 sm:px-6">
          <Link href="/board" className="font-semibold tracking-tight">HuntBoard</Link>
          <DashboardNav />
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground sm:inline">{user?.name ?? user?.email}</span>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}
