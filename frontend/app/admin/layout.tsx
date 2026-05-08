"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  LayoutDashboard,
  UserCheck,
  Users,
  CalendarCheck,
  FolderTree,
  DollarSign,
  Star,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/approvals", label: "Approvals", icon: UserCheck },
  { href: "/admin/mentors", label: "All Mentors", icon: Users },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/bookings", label: "Bookings", icon: CalendarCheck },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/earnings", label: "Earnings", icon: DollarSign },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout, isAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.replace("/signin");
    }
  }, [loading, user, isAdmin, router]);

  if (loading || !user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-6 w-6 rounded-full border-2 border-(--fg)/20 border-t-(--fg) animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-(--fg)/[0.02] border-r border-(--hairline)">
        <div className="px-6 py-6">
          <Link href="/" className="font-display text-xl tracking-tight">
            HelpMeMan<span className="text-(--muted)">.</span>
          </Link>
          <p className="text-[10px] uppercase tracking-[0.22em] text-red-500 mt-1">
            Admin Panel
          </p>
        </div>

        <div className="px-6 pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-500/10 text-red-500 text-xs font-medium shrink-0">
              A
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium truncate">{user.name}</span>
              <span className="text-[11px] text-(--muted)">Administrator</span>
            </div>
          </div>
        </div>

        <div aria-hidden className="mx-6 h-px" style={{ background: "var(--hairline)" }} />

        <nav className="flex-1 flex flex-col gap-1 px-3 py-4 overflow-y-auto">
          {NAV.map((item) => {
            const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  active ? "bg-(--fg)/8 text-(--fg)" : "text-(--muted) hover:text-(--fg) hover:bg-(--fg)/4"
                }`}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 pb-6">
          <button
            type="button"
            onClick={async () => { await logout(); router.replace("/signin"); }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-(--muted) hover:text-red-500 hover:bg-red-500/5 transition-colors cursor-pointer"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Sign out
          </button>
        </div>
      </aside>

      <main className="ml-64 flex-1 min-h-screen">
        <div className="max-w-6xl mx-auto px-8 py-8">{children}</div>
      </main>
    </div>
  );
}
