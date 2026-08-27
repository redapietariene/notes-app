"use client";

import { useMemo, useState } from "react";
import NoteEditor from "@/app/components/NoteEditor";
import NoteList from "@/app/components/NoteList";
import {
  createNote,
  deleteNote,
  updateNote,
  type Collection,
  type Note,
} from "@/utils/db";

type NotesAppProps = {
  initialNotes: Note[];
  initialCollections: Collection[];
};

export default function NotesApp({
  initialNotes,
  initialCollections,
}: NotesAppProps) {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [collections] = useState<Collection[]>(initialCollections);
  const [selectedId, setSelectedId] = useState<string | null>(
    initialNotes[0]?.id ?? null,
  );
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const selectedNote = useMemo(
    () => notes.find((n) => n.id === selectedId) ?? null,
    [notes, selectedId],
  );

  async function handleCreate() {
    setCreating(true);
    try {
      const note = await createNote();
      setNotes((prev) => [note, ...prev]);
      setSelectedId(note.id);
    } finally {
      setCreating(false);
    }
  }

  async function handleSave(
    id: string,
    fields: { title?: string; body?: string },
  ) {
    const updated = await updateNote(id, fields);
    setNotes((prev) =>
      prev
        .map((n) => (n.id === id ? updated : n))
        .sort(
          (a, b) =>
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
        ),
    );
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this note? This can't be undone.")) return;
    setDeletingId(id);
    try {
      await deleteNote(id);
      setNotes((prev) => prev.filter((n) => n.id !== id));
      setSelectedId((current) => (current === id ? null : current));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="flex flex-1 overflow-hidden">
      <NoteList
        notes={notes}
        collections={collections}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onCreate={handleCreate}
        creating={creating}
      />
      {selectedNote ? (
        <NoteEditor
          key={selectedNote.id}
          note={selectedNote}
          onSave={handleSave}
          onDelete={handleDelete}
          deleting={deletingId === selectedNote.id}
        />
      ) : (
        <div className="flex flex-1 items-center justify-center text-zinc-400">
          Select a note or create a new one.
        </div>
      )}
    </div>
  );
}
