"use client";

import { useChats } from "@/lib/useChats";

export default function NewChatButton({ compact }: { compact?: boolean }) {
  const { createChat, setActiveChat } = useChats();

  const onNew = () => {
    const id = createChat("Untitled");
    setActiveChat(id); // _editing=true → inline rename opens automatically
  };

  return (
    <button
      onClick={onNew}
      title="New chat"
      className="flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-100"
      aria-label="Create new chat"
    >
      {compact ? "+" : "＋"}
    </button>
  );
}
