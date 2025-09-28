"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ChatSummary {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  _editing?: boolean; // transient UI flag
}

interface ChatsState {
  chats: ChatSummary[];
  activeChatId?: string;
  isSidebarCollapsed: boolean;
}

interface ChatsActions {
  createChat: (title?: string) => string;
  renameChat: (id: string, title: string) => void;
  deleteChat: (id: string) => void;
  setActiveChat: (id: string) => void;
  toggleSidebar: () => void;
  startEditing: (id: string) => void;
  stopEditing: (id: string, commit?: boolean, nextTitle?: string) => void;
}

type Store = ChatsState & ChatsActions;
const nowISO = () => new Date().toISOString();

export const useChats = create<Store>()(
  persist(
    (set, get) => ({
      chats: [
        { id: crypto.randomUUID(), title: "Welcome chat", createdAt: nowISO(), updatedAt: nowISO() },
      ],
      activeChatId: undefined,
      isSidebarCollapsed: false,

      createChat: (title = "Untitled") => {
        const id = crypto.randomUUID();
        const stamp = nowISO();
        const chat: ChatSummary = { id, title, createdAt: stamp, updatedAt: stamp, _editing: true };
        set((s) => ({ chats: [chat, ...s.chats], activeChatId: id }));
        return id;
      },

      renameChat: (id, title) => {
        const t = title.trim() || "Untitled";
        set((s) => ({
          chats: s.chats.map((c) => (c.id === id ? { ...c, title: t, updatedAt: nowISO() } : c)),
        }));
      },

      deleteChat: (id) => {
        set((s) => {
          const remaining = s.chats.filter((c) => c.id !== id);
          const nextActive = s.activeChatId === id ? remaining[0]?.id : s.activeChatId;
          return { chats: remaining, activeChatId: nextActive };
        });
      },

      setActiveChat: (id) => set({ activeChatId: id }),
      toggleSidebar: () => set((s) => ({ isSidebarCollapsed: !s.isSidebarCollapsed })),
      startEditing: (id) =>
        set((s) => ({ chats: s.chats.map((c) => (c.id === id ? { ...c, _editing: true } : c)) })),
      stopEditing: (id, commit = false, nextTitle) =>
        set((s) => ({
          chats: s.chats.map((c) => {
            if (c.id !== id) return c;
            const title = commit && typeof nextTitle === "string"
              ? (nextTitle.trim() || "Untitled")
              : c.title;
            return { ...c, title, _editing: false, updatedAt: commit ? nowISO() : c.updatedAt };
          }),
        })),
    }),
    {
      name: "ragify-chats",
      partialize: (state) => ({
        chats: state.chats.map(({ _editing, ...rest }) => rest),
        activeChatId: state.activeChatId,
        isSidebarCollapsed: state.isSidebarCollapsed,
      }),
    }
  )
);
