"use client";

import { useRef, useState } from "react";
import type { Collection, Note } from "@/utils/db";

type NoteListProps = {
  notes: Note[];
  collections: Collection[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onCreate: () => void;
  creating: boolean;
  onRenameNote: (id: string, title: string) => void;
  onCreateCollection: () => void;
  onRenameCollection: (id: string, currentName: string) => void;
  onDeleteCollection: (id: string, name: string) => void;
};

const UNCOLLECTED_KEY = "uncollected";

export default function NoteList({
  notes,
  collections,
  selectedId,
  onSelect,
  onCreate,
  creating,
  onRenameNote,
  onCreateCollection,
  onRenameCollection,
  onDeleteCollection,
}: NoteListProps) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState("");
  const skipBlurRef = useRef(false);

  function toggleGroup(key: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  function startRenaming(note: Note) {
    setEditingNoteId(note.id);
    setDraftTitle(note.title);
  }

  function commitRename(note: Note) {
    const title = draftTitle.trim();
    setEditingNoteId(null);
    if (title !== note.title) {
      onRenameNote(note.id, title);
    }
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
      <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-2 dark:border-zinc-800">
        <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          Collections
        </span>
        <button
          onClick={onCreateCollection}
          className="text-xs font-medium text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
        >
          + New collection
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {notes.length === 0 && (
          <p className="p-4 text-sm text-zinc-500">No notes yet.</p>
        )}
        {groups.map((group) => {
          const isExpanded = !collapsed.has(group.key);
          const isCollection = group.key !== UNCOLLECTED_KEY;
          return (
            <div key={group.key}>
              <div className="flex items-center border-b border-zinc-100 dark:border-zinc-900">
                <button
                  onClick={() => toggleGroup(group.key)}
                  className="flex flex-1 items-center gap-2 px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
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
                {isCollection && (
                  <div className="flex items-center gap-1 pr-3">
                    <button
                      onClick={() => onRenameCollection(group.key, group.name)}
                      title="Rename collection"
                      className="rounded px-1 text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
                    >
                      ✎
                    </button>
                    <button
                      onClick={() => onDeleteCollection(group.key, group.name)}
                      title="Delete collection"
                      className="rounded px-1 text-xs text-zinc-400 hover:text-red-600 dark:hover:text-red-400"
                    >
                      🗑
                    </button>
                  </div>
                )}
              </div>
              {isExpanded && (
                <ul>
                  {group.notes.length === 0 && (
                    <li className="border-b border-zinc-100 px-4 py-2 text-xs text-zinc-400 dark:border-zinc-900">
                      No notes
                    </li>
                  )}
                  {group.notes.map((note) =>
                    editingNoteId === note.id ? (
                      <li
                        key={note.id}
                        className="border-b border-zinc-100 px-4 py-3 pl-8 dark:border-zinc-900"
                      >
                        <input
                          autoFocus
                          value={draftTitle}
                          onChange={(e) => setDraftTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.currentTarget.blur();
                            } else if (e.key === "Escape") {
                              skipBlurRef.current = true;
                              setEditingNoteId(null);
                            }
                          }}
                          onBlur={() => {
                            if (skipBlurRef.current) {
                              skipBlurRef.current = false;
                              return;
                            }
                            commitRename(note);
                          }}
                          placeholder="Untitled note"
                          className="w-full border-none bg-transparent text-sm font-medium outline-none placeholder:text-zinc-400"
                        />
                        <div className="mt-1 truncate text-xs text-zinc-500">
                          {new Date(note.updated_at).toLocaleString()}
                        </div>
                      </li>
                    ) : (
                      <li key={note.id}>
                        <div
                          className={`flex items-center border-b border-zinc-100 dark:border-zinc-900 ${
                            note.id === selectedId
                              ? "bg-zinc-100 dark:bg-zinc-800"
                              : "hover:bg-zinc-50 dark:hover:bg-zinc-900"
                          }`}
                        >
                          <button
                            onClick={() => onSelect(note.id)}
                            className="flex-1 overflow-hidden px-4 py-3 pl-8 text-left"
                          >
                            <div className="truncate text-sm font-medium">
                              {note.title || "Untitled note"}
                            </div>
                            <div className="mt-1 truncate text-xs text-zinc-500">
                              {new Date(note.updated_at).toLocaleString()}
                            </div>
                          </button>
                          <button
                            onClick={() => startRenaming(note)}
                            title="Rename note"
                            className="rounded px-2 text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
                          >
                            ✎
                          </button>
                        </div>
                      </li>
                    ),
                  )}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
