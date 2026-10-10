# Notes Test Plan

## Application Overview

Signed-in users manage notes in `/workspace`: a notes list on the left and an editor (title, body, Delete) for the selected note. Changes autosave ("Saved" status). Deleting a note asks for confirmation with a browser `confirm()` dialog.

## Test Scenarios

### 1. Notes

**Seed:** `tests/seed.spec.ts`

All scenarios sign in first (see `tests/notes/fixtures.ts`) and need `E2E_EMAIL` and `E2E_PASSWORD` in `.env.local`; they are skipped otherwise. Each scenario creates its own uniquely titled note.

#### 1.1. creates-note-and-lists-it

**File:** `tests/notes/creates-note-and-lists-it.spec.ts`

**Steps:**
  1. Click "+ New note"
    - expect: the editor shows a note titled "Untitled note"
  2. Type a unique title into the title field
    - expect: the status shows "Saved"
    - expect: the note appears in the notes list under that title

#### 1.2. edits-note-body-and-keeps-it-after-refresh

**File:** `tests/notes/edits-note-body-and-keeps-it-after-refresh.spec.ts`

**Steps:**
  1. Create a note with a unique title
  2. Type text into the body ("Start writing…")
    - expect: the status shows "Saved"
  3. Reload the page
    - expect: the note is still listed
  4. Open the note from the list (the editor opens the newest note, which may be another one)
    - expect: the body still contains the edited text

#### 1.3. deletes-note-and-it-stays-gone-after-refresh

**File:** `tests/notes/deletes-note-and-it-stays-gone-after-refresh.spec.ts`

**Steps:**
  1. Create a note with a unique title
    - expect: the note appears in the list
  2. Click the editor's "Delete" button and accept the confirmation dialog
    - expect: the note disappears from the list
  3. Reload the page
    - expect: the note is not in the list
