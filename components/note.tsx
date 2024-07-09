"use client";

import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import NoteHeader from "./note-header";
import NoteContent from "./note-content";
import SessionId from "./session-id";
import { useState, useCallback, useRef, useContext } from "react";
import { SessionNotesContext } from "@/app/session-notes";

export default function Note({ note: initialNote }: { note: any }) {
  const supabase = createClient();
  const router = useRouter();
  const [note, setNote] = useState(initialNote);
  const [sessionId, setSessionId] = useState("");
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { refreshSessionNotes } = useContext(SessionNotesContext);

  const saveNote = useCallback(
    async (updates: Partial<typeof note>) => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      const updatedNote = { ...note, ...updates };
      setNote(updatedNote);

      saveTimeoutRef.current = setTimeout(async () => {
        try {
          const { error } = await supabase
            .from("notes")
            .update(updatedNote)
            .match({ id: note.id });

          if (error) throw error;

          await fetch("/revalidate", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ slug: note.slug }),
          });
          router.refresh();
          refreshSessionNotes();
        } catch (error) {
          console.error("Save failed:", error);
        }
      }, 500);
    },
    [note, supabase, router, refreshSessionNotes]
  );

  const canEdit = sessionId === note.session_id;

  return (
    <div className="h-full overflow-y-auto">
      <SessionId setSessionId={setSessionId} />
      <NoteHeader note={note} saveNote={saveNote} canEdit={canEdit} />
      <NoteContent note={note} saveNote={saveNote} canEdit={canEdit} />
    </div>
  );
}
