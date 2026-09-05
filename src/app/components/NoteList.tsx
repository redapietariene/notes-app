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
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isSearchActive: boolean;
  searching: boolean;
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
  searchQuery,
  onSearchChange,
  isSearchActive,
  searching,
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

  function renderNoteItem(note: Note) {
    if (editingNoteId === note.id) {
      return (
        <li
          key={note.id}
          className="rounded-lg border border-brass bg-card p-3.5"
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
          <div className="mt-1 truncate text-xs text-ink-soft">
            {new Date(note.updated_at).toLocaleString()}
          </div>
        </li>
      );
    }

    return (
      <li key={note.id}>
        <div
          className={`group flex items-center overflow-hidden rounded-lg border transition-colors ${
            note.id === selectedId
              ? "border-brass bg-brass-soft"
              : "border-transparent hover:bg-steel-soft"
          }`}
        >
          <button
            onClick={() => onSelect(note.id)}
            className="flex-1 overflow-hidden px-3.5 py-3 text-left"
          >
            <div className="truncate text-sm font-medium text-ink">
              {note.title || "Untitled note"}
            </div>
            <div className="mt-1 truncate text-xs text-ink-soft">
              {new Date(note.updated_at).toLocaleString()}
            </div>
            {note.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {note.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="rounded-full bg-steel-soft px-2 py-0.5 text-xs text-steel"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            )}
          </button>
          <div className="flex flex-col items-end gap-1.5 pr-3 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              onClick={() => startRenaming(note)}
              title="Rename note"
              className="text-xs text-ink-soft hover:text-brass"
            >
              Rename
            </button>
            <select
              value={note.collection_id ?? ""}
              onChange={(e) => onMoveNote(note.id, e.target.value || null)}
              title="Move to collection"
              className="max-w-[80px] rounded border-none bg-transparent text-xs text-ink-soft hover:text-brass"
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
    );
  }

  return (
    <aside className="flex w-80 shrink-0 flex-col border-r border-line bg-paper">
      <div className="px-5 py-5">
        <button
          onClick={onCreate}
          disabled={creating}
          className="w-full rounded-lg bg-brass px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-brass/90 disabled:opacity-50"
        >
          {creating ? "Creating…" : "+ New note"}
        </button>
      </div>
      <div className="px-5 pb-4">
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search notes…"
          className="w-full rounded-lg border border-line bg-card px-3 py-2 text-sm text-ink outline-none placeholder:text-ink-soft focus:border-brass"
        />
        {searching && (
          <div className="mt-1.5 text-xs text-ink-soft">Searching…</div>
        )}
      </div>
      {!isSearchActive && (
        <div className="flex items-center justify-between px-5 pb-2">
          <span className="text-xs font-medium uppercase tracking-wide text-ink-soft">
            Collections
          </span>
          <button
            onClick={onCreateCollection}
            className="text-xs font-medium text-brass hover:underline"
          >
            + New
          </button>
        </div>
      )}
      {tags.length > 0 && (
        <div className="px-5 pb-4">
          <div className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-soft">
            Tags
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={onClearTagFilter}
              className={`rounded-full px-2.5 py-1 text-xs transition-colors ${
                activeTagIds.size === 0
                  ? "bg-brass text-white"
                  : "bg-steel-soft text-ink-soft hover:text-ink"
              }`}
            >
              All
            </button>
            {tags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => onToggleTagFilter(tag.id)}
                aria-pressed={activeTagIds.has(tag.id)}
                className={`rounded-full px-2.5 py-1 text-xs transition-colors ${
                  activeTagIds.has(tag.id)
                    ? "bg-brass text-white"
                    : "bg-steel-soft text-ink-soft hover:text-ink"
                }`}
              >
                {tag.name}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="flex-1 overflow-y-auto border-t border-line">
        {isSearchActive ? (
          <>
            {notes.length === 0 && !searching && (
              <p className="p-5 text-sm text-ink-soft">
                No notes match “{searchQuery.trim()}”.
              </p>
            )}
            {notes.length > 0 && (
              <ul className="space-y-1 px-3 py-3">
                {notes.map(renderNoteItem)}
              </ul>
            )}
          </>
        ) : (
          <>
            {notes.length === 0 && (
              <p className="p-5 text-sm text-ink-soft">No notes yet.</p>
            )}
            {groups.map((group) => {
              const isExpanded = !collapsed.has(group.key);
              const isCollection = group.key !== UNCOLLECTED_KEY;
              return (
                <div key={group.key}>
                  <div className="group/header flex items-center">
                    <button
                      onClick={() => toggleGroup(group.key)}
                      className="flex flex-1 items-center gap-2 px-5 py-2 text-left text-xs font-medium uppercase tracking-wide text-ink-soft hover:text-ink"
                    >
                      <span
                        className={`inline-block text-[9px] transition-transform ${
                          isExpanded ? "rotate-90" : ""
                        }`}
                      >
                        &#9654;
                      </span>
                      <span className="truncate">{group.name}</span>
                      <span className="ml-auto normal-case text-ink-soft/70">
                        {group.notes.length}
                      </span>
                    </button>
                    {isCollection && (
                      <div className="flex items-center gap-2 pr-4 text-xs opacity-0 transition-opacity group-hover/header:opacity-100">
                        <button
                          onClick={() =>
                            onRenameCollection(group.key, group.name)
                          }
                          title="Rename collection"
                          className="text-ink-soft hover:text-brass"
                        >
                          Rename
                        </button>
                        <button
                          onClick={() =>
                            onDeleteCollection(group.key, group.name)
                          }
                          title="Delete collection"
                          className="text-ink-soft hover:text-danger"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                  {isExpanded && (
                    <ul className="space-y-1 px-3 pb-3">
                      {group.notes.length === 0 && (
                        <li className="px-2 py-1 text-xs text-ink-soft/70">
                          No notes
                        </li>
                      )}
                      {group.notes.map(renderNoteItem)}
                    </ul>
                  )}
                </div>
              );
            })}
          </>
        )}
      </div>
    </aside>
  );
}
