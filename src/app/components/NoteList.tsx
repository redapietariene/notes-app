"use client";

import { useRef, useState } from "react";
import type { Collection, Note, Tag } from "@/utils/db";

type NoteListProps = {
  notes: Note[];
  collections: Collection[];
  tags: Tag[];
  activeTagIds: Set<string>;
  onToggleTagFilter: (tagId: string) => void;
  onClearTagFilter: () => void;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onCreate: () => void;
  creating: boolean;
  onRenameNote: (id: string, title: string) => void;
  onMoveNote: (id: string, collectionId: string | null) => void;
  onCreateCollection: () => void;
  onRenameCollection: (id: string, currentName: string) => void;
  onDeleteCollection: (id: string, name: string) => void;
};

const UNCOLLECTED_KEY = "uncollected";

export default function NoteList({
  notes,
  collections,
  tags,
  activeTagIds,
  onToggleTagFilter,
  onClearTagFilter,
  selectedId,
  onSelect,
  onCreate,
  creating,
  onRenameNote,
  onMoveNote,
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

  const numberByNoteId = new Map(notes.map((n, i) => [n.id, i + 1]));

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
    <aside className="flex w-80 shrink-0 flex-col border-r border-line bg-paper">
      <div className="flex items-center justify-between border-b-2 border-brass px-4 py-4">
        <h1 className="font-display text-sm uppercase tracking-[0.25em] text-ink">
          Notes
        </h1>
        <button
          onClick={onCreate}
          disabled={creating}
          className="rounded-sm border border-brass px-3 py-1.5 text-sm font-medium text-brass transition-colors hover:bg-brass hover:text-card disabled:opacity-50"
        >
          {creating ? "Creating…" : "+ New note"}
        </button>
      </div>
      <div className="flex items-center justify-between border-b border-line px-4 py-2">
        <span className="font-display text-[11px] uppercase tracking-wider text-ink-soft">
          Collections
        </span>
        <button
          onClick={onCreateCollection}
          className="text-xs font-medium text-brass hover:underline"
        >
          + New collection
        </button>
      </div>
      {tags.length > 0 && (
        <div className="border-b border-line px-4 py-2.5">
          <div className="mb-1.5 font-display text-[11px] uppercase tracking-wider text-ink-soft">
            Tags
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={onClearTagFilter}
              className={`rounded-full border px-2 py-0.5 text-xs transition-colors ${
                activeTagIds.size === 0
                  ? "border-brass bg-brass text-card"
                  : "border-dashed border-line text-ink-soft hover:border-brass hover:text-brass"
              }`}
            >
              All
            </button>
            {tags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => onToggleTagFilter(tag.id)}
                aria-pressed={activeTagIds.has(tag.id)}
                className={`rounded-full border px-2 py-0.5 text-xs transition-colors ${
                  activeTagIds.has(tag.id)
                    ? "border-brass bg-brass text-card"
                    : "border-dashed border-line text-ink-soft hover:border-brass hover:text-brass"
                }`}
              >
                {tag.name}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="flex-1 overflow-y-auto">
        {notes.length === 0 && (
          <p className="p-4 text-sm text-ink-soft">No notes yet.</p>
        )}
        {groups.map((group) => {
          const isExpanded = !collapsed.has(group.key);
          const isCollection = group.key !== UNCOLLECTED_KEY;
          return (
            <div key={group.key}>
              <div className="flex items-center border-b border-line bg-card/40">
                <button
                  onClick={() => toggleGroup(group.key)}
                  className="flex flex-1 items-center gap-2 px-4 py-2 text-left font-display text-[11px] uppercase tracking-wider text-ink-soft hover:text-brass"
                >
                  <span
                    className={`inline-block text-[9px] transition-transform ${
                      isExpanded ? "rotate-90" : ""
                    }`}
                  >
                    &#9654;
                  </span>
                  <span className="truncate">{group.name}</span>
                  <span className="ml-auto font-mono text-[10px] normal-case text-ink-soft/60">
                    {group.notes.length}
                  </span>
                </button>
                {isCollection && (
                  <div className="flex items-center gap-2 pr-3 font-mono text-[11px]">
                    <button
                      onClick={() => onRenameCollection(group.key, group.name)}
                      title="Rename collection"
                      className="text-ink-soft hover:text-brass"
                    >
                      edit
                    </button>
                    <button
                      onClick={() => onDeleteCollection(group.key, group.name)}
                      title="Delete collection"
                      className="text-ink-soft hover:text-danger"
                    >
                      del
                    </button>
                  </div>
                )}
              </div>
              {isExpanded && (
                <ul className="space-y-2 px-3 py-2.5">
                  {group.notes.length === 0 && (
                    <li className="px-1 py-1 text-xs text-ink-soft/70">
                      No notes
                    </li>
                  )}
                  {group.notes.map((note) =>
                    editingNoteId === note.id ? (
                      <li
                        key={note.id}
                        className="rounded-lg border border-brass bg-card p-3"
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
                          className="w-full border-none bg-transparent text-sm font-medium text-ink outline-none placeholder:text-ink-soft"
                        />
                        <div className="mt-1 truncate font-mono text-[10px] text-ink-soft">
                          {new Date(note.updated_at).toLocaleString()}
                        </div>
                      </li>
                    ) : (
                      <li key={note.id} className="relative">
                        <span
                          aria-hidden
                          className="absolute -top-[7px] left-1/2 h-3 w-3 -translate-x-1/2 rounded-full border border-line bg-paper"
                        />
                        <div
                          className={`relative flex items-center overflow-hidden rounded-lg border bg-card transition-colors ${
                            note.id === selectedId
                              ? "border-brass"
                              : "border-line hover:border-ink-soft/40"
                          }`}
                        >
                          {note.id === selectedId && (
                            <span
                              aria-hidden
                              className="absolute inset-y-2 left-0 w-1 rounded-r bg-brass"
                            />
                          )}
                          <button
                            onClick={() => onSelect(note.id)}
                            className="flex-1 overflow-hidden px-4 py-3 pl-5 text-left"
                          >
                            <div className="flex items-baseline justify-between gap-2">
                              <div className="truncate text-sm font-semibold text-ink">
                                {note.title || "Untitled note"}
                              </div>
                              <div className="shrink-0 font-mono text-[10px] text-ink-soft/70">
                                №{String(numberByNoteId.get(note.id)).padStart(3, "0")}
                              </div>
                            </div>
                            <div className="mt-1 truncate font-mono text-[10px] text-ink-soft">
                              {new Date(note.updated_at).toLocaleString()}
                            </div>
                            {note.tags.length > 0 && (
                              <div className="mt-1.5 flex flex-wrap gap-1">
                                {note.tags.map((tag) => (
                                  <span
                                    key={tag.id}
                                    className="rounded-full border border-dashed border-line px-1.5 py-0.5 text-[10px] text-steel"
                                  >
                                    {tag.name}
                                  </span>
                                ))}
                              </div>
                            )}
                          </button>
                          <div className="flex flex-col items-center gap-1.5 pr-3">
                            <button
                              onClick={() => startRenaming(note)}
                              title="Rename note"
                              className="font-mono text-[10px] text-ink-soft hover:text-brass"
                            >
                              edit
                            </button>
                            <select
                              value={note.collection_id ?? ""}
                              onChange={(e) =>
                                onMoveNote(note.id, e.target.value || null)
                              }
                              title="Move to collection"
                              className="max-w-[64px] rounded border-none bg-transparent font-mono text-[9px] text-ink-soft/70 hover:text-brass"
                            >
                              <option value="">Uncollected</option>
                              {collections.map((collection) => (
                                <option key={collection.id} value={collection.id}>
                                  {collection.name}
                                </option>
                              ))}
                            </select>
                          </div>
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
