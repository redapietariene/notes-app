"use client";

import { useEffect, useRef, useState } from "react";
import type { Collection, Note } from "@/utils/db";

type NoteEditorProps = {
  note: Note;
  collections: Collection[];
  onSave: (id: string, fields: { title?: string; body?: string }) => Promise<void>;
  onDelete: (id: string) => void;
  onMove: (id: string, collectionId: string | null) => void;
  onAddTag: (id: string, tagName: string) => void;
  onRemoveTag: (id: string, tagId: string) => void;
  deleting: boolean;
};

type SaveStatus = "idle" | "saving" | "saved" | "error";

const STATUS_LABEL: Record<Exclude<SaveStatus, "idle">, string> = {
  saving: "Saving…",
  saved: "Saved",
  error: "Failed to save",
};

const STATUS_COLOR: Record<Exclude<SaveStatus, "idle">, string> = {
  saving: "text-ink-soft",
  saved: "text-steel",
  error: "text-danger",
};

export default function NoteEditor({
  note,
  collections,
  onSave,
  onDelete,
  onMove,
  onAddTag,
  onRemoveTag,
  deleting,
}: NoteEditorProps) {
  const [title, setTitle] = useState(note.title);
  const [body, setBody] = useState(note.body ?? "");
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [tagInput, setTagInput] = useState("");
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

  function submitTag() {
    const name = tagInput.trim();
    if (!name) return;
    onAddTag(note.id, name);
    setTagInput("");
  }

  return (
    <div className="m-5 flex flex-1 flex-col overflow-hidden rounded-xl border border-line bg-card">
      <div className="flex items-center justify-between border-b border-line px-7 py-4">
        <span className={`text-sm ${status === "idle" ? "text-transparent" : STATUS_COLOR[status]}`}>
          {status === "idle" ? " " : STATUS_LABEL[status]}
        </span>
        <div className="flex items-center gap-3">
          <select
            value={note.collection_id ?? ""}
            onChange={(e) => onMove(note.id, e.target.value || null)}
            className="rounded-md border border-line bg-transparent px-2 py-1.5 text-sm text-ink-soft"
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
            className="rounded-md px-3 py-1.5 text-sm font-medium text-danger transition-colors hover:bg-danger-soft disabled:opacity-50"
          >
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 border-b border-line px-7 py-3.5">
        {note.tags.map((tag) => (
          <span
            key={tag.id}
            className="flex items-center gap-1.5 rounded-full bg-steel-soft px-2.5 py-1 text-xs text-steel"
          >
            {tag.name}
            <button
              onClick={() => onRemoveTag(note.id, tag.id)}
              title="Remove tag"
              className="text-steel/60 hover:text-danger"
            >
              ×
            </button>
          </span>
        ))}
        <input
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              submitTag();
            }
          }}
          onBlur={submitTag}
          placeholder="Add tag…"
          className="w-24 border-none bg-transparent text-xs text-ink outline-none placeholder:text-ink-soft"
        />
      </div>
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-9 py-7">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Untitled note"
          className="w-full border-none bg-transparent text-2xl font-semibold text-ink outline-none placeholder:text-ink-soft"
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Start writing…"
          className="w-full flex-1 resize-none border-none bg-transparent leading-7 text-ink outline-none placeholder:text-ink-soft"
        />
      </div>
    </div>
  );
}
