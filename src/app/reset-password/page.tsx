import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { resetPassword } from "./actions";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login");

  const { error } = await searchParams;

  return (
    <div className="flex flex-1 items-center justify-center bg-paper px-4">
      <div className="w-full max-w-sm rounded-xl border border-line bg-card p-10">
        <h1 className="text-xl font-semibold text-ink">Choose a new password</h1>

        <form action={resetPassword} className="mt-7 flex flex-col gap-5">
          <label className="flex flex-col gap-1.5 text-sm text-ink">
            New password
            <input
              name="password"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              className="rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink outline-none placeholder:text-ink-soft focus:border-brass"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm text-ink">
            Confirm new password
            <input
              name="confirm"
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
            className="mt-2 rounded-lg bg-brass px-3 py-2 text-sm font-medium text-brass-contrast transition-colors hover:bg-brass/90"
          >
            Update password
          </button>
        </form>
      </div>
    </div>
  );
}
