"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function requestPasswordReset(formData: FormData) {
  const email = String(formData.get("email") ?? "");

  const headerList = await headers();
  const origin =
    headerList.get("origin") ?? `https://${headerList.get("host")}`;

  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback`,
  });

  // Same message whether or not the email exists, so accounts can't be probed.
  redirect(
    `/login?message=${encodeURIComponent(
      "If an account exists for that email, a reset link is on its way.",
    )}`,
  );
}
