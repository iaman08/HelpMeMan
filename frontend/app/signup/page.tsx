import Link from "next/link";

export default function SignUpPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-24">
      <div className="w-full max-w-md flex flex-col gap-10">
        <div>
          <Link
            href="/"
            className="text-xs uppercase tracking-[0.22em] text-(--muted) hover:text-(--fg)"
          >
            ← HelpMeMan
          </Link>
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-sm uppercase tracking-[0.22em] text-(--muted)">
            Create your account
          </p>
          <h1 className="font-display text-5xl leading-none">Sign up.</h1>
          <p className="text-(--muted) leading-relaxed">
            Three minutes to set up. Then meet your first mentor.
          </p>
        </div>

        <form className="flex flex-col gap-5">
          <label className="flex flex-col gap-2 text-sm">
            <span className="text-(--muted) text-xs uppercase tracking-[0.18em]">
              Full name
            </span>
            <input
              type="text"
              required
              placeholder="Aanya Sharma"
              className="bg-(--fg)/5 rounded-lg px-4 py-3 outline-none focus:bg-(--fg)/8 transition-colors"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span className="text-(--muted) text-xs uppercase tracking-[0.18em]">
              Email
            </span>
            <input
              type="email"
              required
              placeholder="you@domain.com"
              className="bg-(--fg)/5 rounded-lg px-4 py-3 outline-none focus:bg-(--fg)/8 transition-colors"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span className="text-(--muted) text-xs uppercase tracking-[0.18em]">
              Password
            </span>
            <input
              type="password"
              required
              placeholder="At least 8 characters"
              className="bg-(--fg)/5 rounded-lg px-4 py-3 outline-none focus:bg-(--fg)/8 transition-colors"
            />
          </label>
          <button
            type="submit"
            className="mt-2 self-start rounded-full bg-(--accent) text-(--accent-fg) px-7 py-3.5 text-sm hover:opacity-90 transition-opacity cursor-pointer"
          >
            Create account
          </button>
        </form>

        <p className="text-sm text-(--muted)">
          Already on "HelpMeMan"?{" "}
          <Link href="/signin" className="text-(--fg) underline-offset-4 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
