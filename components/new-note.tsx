"use client";

import { useCallback, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { Icons } from "./icons";
import SessionId from "./session-id";
import { createNote } from "@/lib/create-note";
import { SessionNotesContext } from "@/app/session-notes";

export default function NewNote({
  addNewPinnedNote,
  clearSearch,
}: {
  addNewPinnedNote: (slug: string) => void;
  clearSearch: () => void;
}) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const router = useRouter();

  const { refreshSessionNotes } = useContext(SessionNotesContext);

  const handleCreateNote = useCallback(() => {
    clearSearch();
    createNote(sessionId, router, addNewPinnedNote, refreshSessionNotes);
  }, [sessionId, router, addNewPinnedNote, clearSearch, refreshSessionNotes]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const isTyping =
        target.isContentEditable ||
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT";

      if (event.key === "n" && !event.metaKey && !isTyping) {
        event.preventDefault();
        handleCreateNote();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleCreateNote]);

  return (
    <div className="flex flex-col items-center justify-center">
      <SessionId setSessionId={setSessionId} />
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger
            onClick={handleCreateNote}
            aria-label="Create new note"
          >
            <Icons.new />
          </TooltipTrigger>
          <TooltipContent className="bg-[#1c1c1c] text-gray-400 border-none">
            Create a note
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
