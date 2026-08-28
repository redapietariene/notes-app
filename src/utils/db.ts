"use server";

import { createClient } from "@/utils/supabase/server";

export type Tag = {
  id: string;
  name: string;
};

export type Note = {
  id: string;
  title: string;
  body: string | null;
  collection_id: string | null;
  created_at: string;
  updated_at: string;
  tags: Tag[];
};

export type Collection = {
  id: string;
  name: string;
};

type NoteRow = {
  id: string;
  title: string;
  body: string | null;
  collection_id: string | null;
  created_at: string;
  updated_at: string;
  note_tags: { tags: Tag }[];
};

const NOTE_COLUMNS =
  "id, title, body, collection_id, created_at, updated_at, note_tags(tags(id, name))";

function mapNote(row: NoteRow): Note {
  const { note_tags, ...note } = row;
  return { ...note, tags: note_tags.map((nt) => nt.tags) };
}

export async function getNotes(): Promise<Note[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notes")
    .select(NOTE_COLUMNS)
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return (data as unknown as NoteRow[]).map(mapNote);
}

export async function searchNotes(query: string): Promise<Note[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .rpc("search_notes", { search_query: query })
    .select(NOTE_COLUMNS);

  if (error) throw error;
  return (data as unknown as NoteRow[]).map(mapNote);
}

export async function createNote(): Promise<Note> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notes")
    .insert({ title: "Untitled note", body: "" })
    .select(NOTE_COLUMNS)
    .single();

  if (error) throw error;
  return mapNote(data as unknown as NoteRow);
}

export async function updateNote(
  id: string,
  fields: { title?: string; body?: string; collection_id?: string | null },
): Promise<Note> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notes")
    .update(fields)
    .eq("id", id)
    .select(NOTE_COLUMNS)
    .single();

  if (error) throw error;
  return mapNote(data as unknown as NoteRow);
}

export async function deleteNote(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("notes").delete().eq("id", id);

  if (error) throw error;
}

export async function getCollections(): Promise<Collection[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("collections")
    .select("id, name")
    .order("name", { ascending: true });

  if (error) throw error;
  return data;
}

export async function createCollection(name: string): Promise<Collection> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("collections")
    .insert({ name })
    .select("id, name")
    .single();

  if (error) throw error;
  return data;
}

export async function renameCollection(
  id: string,
  name: string,
): Promise<Collection> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("collections")
    .update({ name })
    .eq("id", id)
    .select("id, name")
    .single();

  if (error) throw error;
  return data;
}

export async function deleteCollection(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("collections").delete().eq("id", id);

  if (error) throw error;
}

export async function getTags(): Promise<Tag[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tags")
    .select("id, name")
    .order("name", { ascending: true });

  if (error) throw error;
  return data;
}

export async function addTagToNote(
  noteId: string,
  tagName: string,
): Promise<Tag> {
  const supabase = await createClient();
  const name = tagName.trim();

  const { data: inserted, error: insertError } = await supabase
    .from("tags")
    .insert({ name })
    .select("id, name")
    .single();

  let tag: Tag;
  if (insertError) {
    if (insertError.code !== "23505") throw insertError;
    const { data: existing, error: fetchError } = await supabase
      .from("tags")
      .select("id, name")
      .eq("name", name)
      .single();
    if (fetchError) throw fetchError;
    tag = existing;
  } else {
    tag = inserted;
  }

  const { error: linkError } = await supabase
    .from("note_tags")
    .insert({ note_id: noteId, tag_id: tag.id });
  if (linkError) throw linkError;

  return tag;
}

export async function removeTagFromNote(
  noteId: string,
  tagId: string,
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("note_tags")
    .delete()
    .eq("note_id", noteId)
    .eq("tag_id", tagId);

  if (error) throw error;
}
