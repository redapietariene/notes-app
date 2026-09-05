import { redirect } from "next/navigation";
import SignOutButton from "@/app/components/SignOutButton";
import { createClient } from "@/utils/supabase/server";

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

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-line bg-paper px-4 py-2">
        <span className="font-mono text-xs text-ink-soft">
          {data.claims.email}
        </span>
        <SignOutButton />
      </div>
      <div className="flex flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
