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
      <div className="w-full max-w-sm rounded-xl border border-line bg-card p-10">
        <h1 className="text-xl font-semibold text-ink">Sign in</h1>
        <p className="mt-1.5 text-sm text-ink-soft">
          Welcome back to your notes.
        </p>

        {message && (
          <p className="mt-5 rounded-lg bg-brass-soft px-3.5 py-2.5 text-sm text-ink">
            {message}
          </p>
        )}

        <form action={login} className="mt-7 flex flex-col gap-5">
          <label className="flex flex-col gap-1.5 text-sm text-ink">
            Email
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              className="rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink outline-none placeholder:text-ink-soft focus:border-brass"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm text-ink">
            Password
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink outline-none placeholder:text-ink-soft focus:border-brass"
            />
          </label>

          {error && <p className="text-sm text-danger">{error}</p>}

          <button
            type="submit"
            className="mt-2 rounded-lg bg-brass px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-brass/90"
          >
            Sign in
          </button>
        </form>

        <p className="mt-7 text-sm text-ink-soft">
          New here?{" "}
          <Link href="/signup" className="font-medium text-brass hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
