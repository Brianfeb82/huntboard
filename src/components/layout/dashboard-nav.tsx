import Link from "next/link";
import { BriefcaseBusiness, FileText, LayoutDashboard, Sparkles } from "lucide-react";

const links = [
  { href: "/board", label: "Board", icon: LayoutDashboard },
  { href: "/applications/new", label: "New application", icon: BriefcaseBusiness },
  { href: "/resumes", label: "Resumes", icon: FileText },
  { href: "/tailor", label: "AI Tailor", icon: Sparkles },
];

export function DashboardNav() {
  return (
    <nav aria-label="Dashboard" className="flex items-center gap-1 overflow-x-auto">
      {links.map(({ href, label, icon: Icon }) => (
        <Link key={href} href={href} className="inline-flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
          <Icon className="size-4" />{label}
        </Link>
      ))}
    </nav>
  );
}
