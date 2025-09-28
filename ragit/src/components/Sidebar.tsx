"use client";

import { useChats } from "@/lib/useChats";
import ChatList from "./chat/ChatList";
import NewChatButton from "./chat/NewChatButton";

export default function Sidebar() {
  const { isSidebarCollapsed, toggleSidebar } = useChats();

  return (
    <aside
      id="chat-sidebar"
      aria-label="Chats"
      // NOTE: add `relative` so the floating handle can anchor to this element
      className={`relative h-screen border-r border-zinc-800 bg-black/40 transition-[width] duration-300 ease-in-out
      ${isSidebarCollapsed ? "w-14" : "w-72"} flex flex-col`}
    >
      {/* Floating collapse/expand handle - always visible */}
      <button
        onClick={toggleSidebar}
        aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        title={isSidebarCollapsed ? "Expand" : "Collapse"}
        className="absolute -right-3 top-2 z-20 w-6 h-6 rounded-full bg-zinc-800 text-zinc-200 shadow ring-1 ring-zinc-700 hover:bg-zinc-700"
      >
        {isSidebarCollapsed ? "›" : "‹"}
      </button>

      {/* Header */}
      <div className="relative flex items-center h-12 px-2">
        {/* Optional label visible only when expanded */}
        {!isSidebarCollapsed && (
          <div className="text-xs uppercase tracking-wider text-zinc-500">Chats</div>
        )}

        {/* Plus button at top-right (visible in both states) */}
        <div className="absolute right-2 top-1.5">
          <NewChatButton compact={isSidebarCollapsed} />
        </div>
      </div>

      {/* Chats */}
      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
        <ChatList collapsed={isSidebarCollapsed} />
      </div>
    </aside>
  );
}
