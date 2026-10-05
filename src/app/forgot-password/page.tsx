import Link from "next/link";
import { requestPasswordReset } from "./actions";

export default function ForgotPasswordPage() {
  return (
    <div className="flex flex-1 items-center justify-center bg-paper px-4">
      <div className="w-full max-w-sm rounded-xl border border-line bg-card p-10">
        <h1 className="text-xl font-semibold text-ink">Reset password</h1>
        <p className="mt-1.5 text-sm text-ink-soft">
          Enter your email and we&apos;ll send you a reset link.
        </p>

        <form action={requestPasswordReset} className="mt-7 flex flex-col gap-5">
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

          <button
            type="submit"
            className="mt-2 rounded-lg bg-brass px-3 py-2 text-sm font-medium text-brass-contrast transition-colors hover:bg-brass/90"
          >
            Send reset link
          </button>
        </form>

        <p className="mt-7 text-sm text-ink-soft">
          <Link href="/login" className="font-medium text-brass hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
