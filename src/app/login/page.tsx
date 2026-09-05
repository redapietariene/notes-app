import Link from "next/link";
import { login } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;

  return (
    <div className="flex flex-1 items-center justify-center bg-paper px-4">
      <div className="w-full max-w-sm rounded-xl border border-line bg-card p-8 shadow-sm">
        <h1 className="font-display text-sm uppercase tracking-[0.25em] text-ink">
          Sign in
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          Welcome back to your library.
        </p>

        {message && (
          <p className="mt-4 rounded-sm border border-steel bg-steel-soft px-3 py-2 text-sm text-ink">
            {message}
          </p>
        )}

        <form action={login} className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm text-ink">
            Email
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              className="rounded-sm border border-line bg-paper px-3 py-1.5 text-sm text-ink outline-none placeholder:text-ink-soft focus:border-brass"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-ink">
            Password
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="rounded-sm border border-line bg-paper px-3 py-1.5 text-sm text-ink outline-none placeholder:text-ink-soft focus:border-brass"
            />
          </label>

          {error && <p className="text-sm text-danger">{error}</p>}

          <button
            type="submit"
            className="mt-2 rounded-sm border border-brass px-3 py-1.5 text-sm font-medium text-brass transition-colors hover:bg-brass hover:text-card"
          >
            Sign in
          </button>
        </form>

        <p className="mt-6 text-sm text-ink-soft">
          New here?{" "}
          <Link href="/signup" className="font-medium text-brass hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
