import { redirect } from "next/navigation";
import SignOutButton from "@/app/components/SignOutButton";
import ThemeToggle from "@/app/components/ThemeToggle";
import { createClient } from "@/utils/supabase/server";
import { getServerTheme } from "@/utils/theme-server";

export default async function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data) {
    redirect("/login");
  }

  const theme = await getServerTheme();

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <header className="flex items-center justify-between border-b border-line bg-card px-6 py-3.5">
        <span className="text-base font-semibold text-ink">Notes</span>
        <div className="flex items-center gap-4">
          <span className="text-sm text-ink-soft">{data.claims.email}</span>
          <ThemeToggle initialTheme={theme} />
          <SignOutButton />
        </div>
      </header>
      <div className="flex flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
