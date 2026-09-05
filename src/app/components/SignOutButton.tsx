import { signOut } from "@/app/workspace/actions";

export default function SignOutButton() {
  return (
    <form action={signOut}>
      <button
        type="submit"
        className="rounded-md px-3 py-1.5 text-sm text-ink-soft transition-colors hover:bg-steel-soft hover:text-ink"
      >
        Sign out
      </button>
    </form>
  );
}
