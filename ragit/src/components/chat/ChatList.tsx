"use client";

import { useChats } from "@/lib/useChats";
import ChatListItem from "./ChatListItem";

export default function ChatList({ collapsed }: { collapsed: boolean }) {
  const { chats, activeChatId } = useChats();

  if (!chats.length) {
    return (
      <div className="text-xs text-zinc-500 px-2 py-2">
        No chats yet. Click <span className="text-zinc-300 font-medium">+</span> to create one.
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-1">
      {chats.map((chat) => (
        <ChatListItem
          key={chat.id}
          chat={chat}
          isActive={chat.id === activeChatId}
          collapsed={collapsed}
        />
      ))}
    </ul>
  );
}
