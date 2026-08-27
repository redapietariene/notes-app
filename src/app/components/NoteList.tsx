"use client";

import { useState } from "react";
import type { Collection, Note } from "@/utils/db";

type NoteListProps = {
  notes: Note[];
  collections: Collection[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onCreate: () => void;
  creating: boolean;
};

const UNCOLLECTED_KEY = "uncollected";

export default function NoteList({
  notes,
  collections,
  selectedId,
  onSelect,
  onCreate,
  creating,
}: NoteListProps) {
  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set([UNCOLLECTED_KEY, ...collections.map((c) => c.id)]),
  );

  function toggleGroup(key: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  const notesByCollection = new Map<string, Note[]>();
  const uncollectedNotes: Note[] = [];
  for (const note of notes) {
    if (note.collection_id) {
      const group = notesByCollection.get(note.collection_id);
      if (group) {
        group.push(note);
      } else {
        notesByCollection.set(note.collection_id, [note]);
      }
    } else {
      uncollectedNotes.push(note);
    }
  }

  const groups = [
    ...collections.map((collection) => ({
      key: collection.id,
      name: collection.name,
      notes: notesByCollection.get(collection.id) ?? [],
    })),
    { key: UNCOLLECTED_KEY, name: "Uncollected", notes: uncollectedNotes },
  ];

  return (
    <aside className="flex w-72 shrink-0 flex-col border-r border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center justify-between border-b border-zinc-200 p-4 dark:border-zinc-800">
        <h1 className="text-lg font-semibold">Notes</h1>
        <button
          onClick={onCreate}
          disabled={creating}
          className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900"
        >
          {creating ? "Creating…" : "New note"}
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {notes.length === 0 && (
          <p className="p-4 text-sm text-zinc-500">No notes yet.</p>
        )}
        {groups.map((group) => {
          const isExpanded = expanded.has(group.key);
          return (
            <div key={group.key}>
              <button
                onClick={() => toggleGroup(group.key)}
                className="flex w-full items-center gap-2 border-b border-zinc-100 px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500 hover:text-zinc-700 dark:border-zinc-900 dark:hover:text-zinc-300"
              >
                <span
                  className={`inline-block text-[10px] transition-transform ${
                    isExpanded ? "rotate-90" : ""
                  }`}
                >
                  ▶
                </span>
                <span className="truncate">{group.name}</span>
                <span className="ml-auto font-normal normal-case text-zinc-400">
                  {group.notes.length}
                </span>
              </button>
              {isExpanded && (
                <ul>
                  {group.notes.length === 0 && (
                    <li className="border-b border-zinc-100 px-4 py-2 text-xs text-zinc-400 dark:border-zinc-900">
                      No notes
                    </li>
                  )}
                  {group.notes.map((note) => (
                    <li key={note.id}>
                      <button
                        onClick={() => onSelect(note.id)}
                        className={`block w-full border-b border-zinc-100 px-4 py-3 pl-8 text-left dark:border-zinc-900 ${
                          note.id === selectedId
                            ? "bg-zinc-100 dark:bg-zinc-800"
                            : "hover:bg-zinc-50 dark:hover:bg-zinc-900"
                        }`}
                      >
                        <div className="truncate text-sm font-medium">
                          {note.title || "Untitled note"}
                        </div>
                        <div className="mt-1 truncate text-xs text-zinc-500">
                          {new Date(note.updated_at).toLocaleString()}
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
