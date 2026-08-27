"use server";

import { createClient } from "@/utils/supabase/server";

export type Note = {
  id: string;
  title: string;
  body: string | null;
  collection_id: string | null;
  created_at: string;
  updated_at: string;
};

export type Collection = {
  id: string;
  name: string;
};

const NOTE_COLUMNS = "id, title, body, collection_id, created_at, updated_at";

export async function getNotes(): Promise<Note[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notes")
    .select(NOTE_COLUMNS)
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return data;
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

export async function createNote(): Promise<Note> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notes")
    .insert({ title: "Untitled note", body: "" })
    .select(NOTE_COLUMNS)
    .single();

  if (error) throw error;
  return data;
}

export async function updateNote(
  id: string,
  fields: { title?: string; body?: string },
): Promise<Note> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notes")
    .update(fields)
    .eq("id", id)
    .select(NOTE_COLUMNS)
    .single();

  if (error) throw error;
  return data;
}

export async function deleteNote(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("notes").delete().eq("id", id);

  if (error) throw error;
}
