"use client";

import Link from "next/link";
import { useTheme, type Theme, THEMES } from "./ThemeProvider";

const links = [
  { id: "about", label: "About" },
  { id: "how", label: "How It Works" },
  { id: "pricing", label: "Pricing" },
];

const themeLabels: Record<Theme, string> = {
  light: "Light",
  yellow: "Sun",
  dark: "Night",
};

function scrollToId(id: string) {
  if (typeof document === "undefined") return;
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function Navbar() {
  const { theme, setTheme } = useTheme();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-(--bg)/70">
      <nav className="mx-auto flex max-w-[1400px] items-center justify-between px-6 sm:px-10 py-5">
        <button
          type="button"
          onClick={() => scrollToId("hero")}
          className="font-display text-2xl tracking-tight cursor-pointer"
          aria-label="HelpMeMan home"
        >
          HelpMeMan<span className="text-(--muted)">.</span>
        </button>

        <div className="hidden md:flex items-center gap-10 text-sm">
          {links.map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => scrollToId(l.id)}
              className="text-(--fg)/80 hover:text-(--fg) transition-colors cursor-pointer"
            >
              {l.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          <div
            role="radiogroup"
            aria-label="Theme"
            className="hidden sm:flex items-center gap-1 rounded-full bg-(--fg)/5 p-1"
          >
            {THEMES.map((t) => (
              <button
                key={t}
                type="button"
                role="radio"
                aria-checked={theme === t}
                onClick={() => setTheme(t)}
                className={`h-7 px-3 rounded-full text-xs transition-colors cursor-pointer ${
                  theme === t
                    ? "bg-(--accent) text-(--accent-fg)"
                    : "text-(--fg)/70 hover:text-(--fg)"
                }`}
              >
                {themeLabels[t]}
              </button>
            ))}
          </div>

          <Link
            href="/signin"
            className="text-sm text-(--fg)/80 hover:text-(--fg) transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="text-sm rounded-full bg-(--accent) text-(--accent-fg) px-5 py-2.5 hover:opacity-90 transition-opacity"
          >
            Sign up
          </Link>
        </div>
      </nav>
    </header>
  );
}
