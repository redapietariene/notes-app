import Link from "next/link";
import { signup } from "./actions";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex flex-1 items-center justify-center bg-paper px-4">
      <div className="w-full max-w-sm rounded-xl border border-line bg-card p-10">
        <h1 className="text-xl font-semibold text-ink">Create an account</h1>
        <p className="mt-1.5 text-sm text-ink-soft">
          Start keeping your notes.
        </p>

        <form action={signup} className="mt-7 flex flex-col gap-5">
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
              minLength={6}
              autoComplete="new-password"
              className="rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink outline-none placeholder:text-ink-soft focus:border-brass"
            />
          </label>

          {error && <p className="text-sm text-danger">{error}</p>}

          <button
            type="submit"
            className="mt-2 rounded-lg bg-brass px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-brass/90"
          >
            Sign up
          </button>
        </form>

        <p className="mt-7 text-sm text-ink-soft">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-brass hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
