import { signOut } from "@/app/workspace/actions";

export default function SignOutButton() {
  return (
    <form action={signOut}>
      <button
        type="submit"
        className="rounded-sm border border-line px-3 py-1.5 text-sm text-ink-soft transition-colors hover:border-brass hover:text-brass"
      >
        Sign out
      </button>
    </form>
  );
}
