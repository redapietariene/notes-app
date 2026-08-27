import NotesApp from "@/app/components/NotesApp";
import { getCollections, getNotes, getTags } from "@/utils/db";

export default async function Home() {
  const [notes, collections, tags] = await Promise.all([
    getNotes(),
    getCollections(),
    getTags(),
  ]);
  return (
    <NotesApp
      initialNotes={notes}
      initialCollections={collections}
      initialTags={tags}
    />
  );
}
