"use client";

import { useMemo, useState } from "react";
import NoteEditor from "@/app/components/NoteEditor";
import NoteList from "@/app/components/NoteList";
import {
  createCollection,
  createNote,
  deleteCollection,
  deleteNote,
  renameCollection,
  updateNote,
  type Collection,
  type Note,
} from "@/utils/db";

type NotesAppProps = {
  initialNotes: Note[];
  initialCollections: Collection[];
};

function deriveTitleFromBody(body: string): string {
  const firstLine = body.trim().split("\n")[0]?.trim() ?? "";
  if (!firstLine) return "Untitled note";
  return firstLine.length > 60
    ? `${firstLine.slice(0, 60).trimEnd()}…`
    : firstLine;
}

export default function NotesApp({
  initialNotes,
  initialCollections,
}: NotesAppProps) {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [collections, setCollections] =
    useState<Collection[]>(initialCollections);
  const [selectedId, setSelectedId] = useState<string | null>(
    initialNotes[0]?.id ?? null,
  );
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const selectedNote = useMemo(
    () => notes.find((n) => n.id === selectedId) ?? null,
    [notes, selectedId],
  );

  function upsertNote(updated: Note) {
    setNotes((prev) =>
      prev
        .map((n) => (n.id === updated.id ? updated : n))
        .sort(
          (a, b) =>
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
        ),
    );
  }

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
    const title = fields.title?.trim()
      ? fields.title
      : deriveTitleFromBody(fields.body ?? "");
    const updated = await updateNote(id, { ...fields, title });
    upsertNote(updated);
  }

  async function handleRenameNote(id: string, title: string) {
    const note = notes.find((n) => n.id === id);
    const effectiveTitle = title.trim() || deriveTitleFromBody(note?.body ?? "");
    const updated = await updateNote(id, { title: effectiveTitle });
    upsertNote(updated);
  }

  async function handleMoveNote(id: string, collectionId: string | null) {
    const updated = await updateNote(id, { collection_id: collectionId });
    upsertNote(updated);
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

  async function handleCreateCollection() {
    const name = window.prompt("Collection name")?.trim();
    if (!name) return;
    const collection = await createCollection(name);
    setCollections((prev) =>
      [...prev, collection].sort((a, b) => a.name.localeCompare(b.name)),
    );
  }

  async function handleRenameCollection(id: string, currentName: string) {
    const name = window.prompt("Rename collection", currentName)?.trim();
    if (!name || name === currentName) return;
    const updated = await renameCollection(id, name);
    setCollections((prev) =>
      prev
        .map((c) => (c.id === id ? updated : c))
        .sort((a, b) => a.name.localeCompare(b.name)),
    );
  }

  async function handleDeleteCollection(id: string, name: string) {
    if (
      !confirm(`Delete "${name}"? Its notes will become uncollected.`)
    )
      return;
    await deleteCollection(id);
    setCollections((prev) => prev.filter((c) => c.id !== id));
    setNotes((prev) =>
      prev.map((n) => (n.collection_id === id ? { ...n, collection_id: null } : n)),
    );
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
        onRenameNote={handleRenameNote}
        onMoveNote={handleMoveNote}
        onCreateCollection={handleCreateCollection}
        onRenameCollection={handleRenameCollection}
        onDeleteCollection={handleDeleteCollection}
      />
      {selectedNote ? (
        <NoteEditor
          key={selectedNote.id}
          note={selectedNote}
          collections={collections}
          onSave={handleSave}
          onDelete={handleDelete}
          onMove={handleMoveNote}
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
