"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  LayoutDashboard,
  CalendarCheck,
  DollarSign,
  Star,
  Clock,
  Settings,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

const NAV = [
  { href: "/mentor", label: "Overview", icon: LayoutDashboard },
  { href: "/mentor/bookings", label: "Sessions", icon: CalendarCheck },
  { href: "/mentor/availability", label: "Availability", icon: Clock },
  { href: "/mentor/earnings", label: "Earnings", icon: DollarSign },
  { href: "/mentor/reviews", label: "Reviews", icon: Star },
  { href: "/mentor/settings", label: "Profile", icon: Settings },
];

export default function MentorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, mentor, loading, logout, isMentor } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && (!user || !isMentor)) {
      router.replace("/signin");
    }
  }, [loading, user, isMentor, router]);

  if (loading || !user || !isMentor) {
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
          <p className="text-[10px] uppercase tracking-[0.22em] text-(--muted) mt-1">
            Mentor Panel
          </p>
        </div>

        <div className="px-6 pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500/10 text-amber-500 text-xs font-medium shrink-0">
              {user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium truncate">{user.name}</span>
              <span className="text-[11px] text-(--muted) truncate">
                {mentor?.approvalStatus === "APPROVED" ? "Verified" : mentor?.approvalStatus}
              </span>
            </div>
          </div>
        </div>

        <div aria-hidden className="mx-6 h-px" style={{ background: "var(--hairline)" }} />

        <nav className="flex-1 flex flex-col gap-1 px-3 py-4">
          {NAV.map((item) => {
            const active = pathname === item.href || (item.href !== "/mentor" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  active
                    ? "bg-(--fg)/8 text-(--fg)"
                    : "text-(--muted) hover:text-(--fg) hover:bg-(--fg)/4"
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
        <div className="max-w-5xl mx-auto px-8 py-8">{children}</div>
      </main>
    </div>
  );
}
