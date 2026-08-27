import NotesApp from "@/app/components/NotesApp";
import { getCollections, getNotes } from "@/utils/db";

export default async function Home() {
  const [notes, collections] = await Promise.all([
    getNotes(),
    getCollections(),
  ]);
  return <NotesApp initialNotes={notes} initialCollections={collections} />;
}
