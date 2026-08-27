"use client";

import { useEffect, useRef, useState } from "react";
import type { Collection, Note } from "@/utils/db";

type NoteEditorProps = {
  note: Note;
  collections: Collection[];
  onSave: (id: string, fields: { title?: string; body?: string }) => Promise<void>;
  onDelete: (id: string) => void;
  onMove: (id: string, collectionId: string | null) => void;
  deleting: boolean;
};

type SaveStatus = "idle" | "saving" | "saved" | "error";

export default function NoteEditor({
  note,
  collections,
  onSave,
  onDelete,
  onMove,
  deleting,
}: NoteEditorProps) {
  const [title, setTitle] = useState(note.title);
  const [body, setBody] = useState(note.body ?? "");
  const [status, setStatus] = useState<SaveStatus>("idle");
  const isFirstRender = useRef(true);

  // This component is remounted (via `key={note.id}`) whenever the
  // selected note changes, so this effect only ever debounce-saves
  // edits to the currently open note.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setStatus("saving");
    const timeout = setTimeout(async () => {
      try {
        await onSave(note.id, { title, body });
        setStatus("saved");
      } catch {
        setStatus("error");
      }
    }, 600);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, body]);

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center justify-between border-b border-zinc-200 p-4 dark:border-zinc-800">
        <span className="text-xs text-zinc-500">
          {status === "saving" && "Saving…"}
          {status === "saved" && "Saved"}
          {status === "error" && "Failed to save"}
        </span>
        <div className="flex items-center gap-3">
          <select
            value={note.collection_id ?? ""}
            onChange={(e) => onMove(note.id, e.target.value || null)}
            className="rounded-md border border-zinc-200 bg-transparent px-2 py-1.5 text-sm dark:border-zinc-700"
          >
            <option value="">Uncollected</option>
            {collections.map((collection) => (
              <option key={collection.id} value={collection.id}>
                {collection.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => onDelete(note.id)}
            disabled={deleting}
            className="rounded-md border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
          >
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-6">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Untitled note"
          className="w-full border-none bg-transparent text-2xl font-semibold outline-none placeholder:text-zinc-400"
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Start writing…"
          className="w-full flex-1 resize-none border-none bg-transparent leading-7 outline-none placeholder:text-zinc-400"
        />
      </div>
    </div>
  );
}
