"use client";

import { memo, useEffect, useRef, useState } from "react";
import { ChatSummary, useChats } from "@/lib/useChats";
import Typing from "@/components/Typing";

type Props = { chat: ChatSummary; isActive: boolean; collapsed: boolean };

function Item({ chat, isActive, collapsed }: Props) {
  const { setActiveChat, renameChat, startEditing, stopEditing } = useChats();
  const [value, setValue] = useState(chat.title);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!chat._editing) setValue(chat.title);
  }, [chat.title, chat._editing]);

  useEffect(() => {
    if (chat._editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [chat._editing]);

  const commit = () => {
    stopEditing(chat.id, true, value);
    if (value.trim() !== chat.title.trim()) renameChat(chat.id, value);
  };
  const cancel = () => stopEditing(chat.id, false);

  return (
    <li className={`group rounded-lg ${isActive ? "bg-zinc-900" : "hover:bg-zinc-900"}`}>
      <div
        className="flex items-center gap-2 px-2 py-1.5 cursor-pointer"
        onClick={() => setActiveChat(chat.id)}
        onDoubleClick={() => startEditing(chat.id)}
        title={chat.title}
        aria-current={isActive ? "page" : undefined}
      >
        <div className="w-2 h-2 rounded-full bg-zinc-600 shrink-0" />

        <div className="min-w-0 flex-1">
          {chat._editing ? (
            <input
              ref={inputRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onBlur={commit}
              onKeyDown={(e) => {
                if (e.key === "Enter") commit();
                else if (e.key === "Escape") cancel();
              }}
              aria-label="Rename chat"
              className="w-full bg-transparent outline-none text-sm text-zinc-100 px-1 py-0.5 rounded ring-1 ring-zinc-700"
            />
          ) : !collapsed ? (
            // Typing animation for each chat title
            <Typing
              as="span"
              wrapperDisplay="inline-block"
              text={chat.title}
              speedMsPerChar={25}
              blinkAtEnd={true}
              headingClassName="text-sm text-zinc-200"
            />
          ) : (
            // Collapsed: show initial
            <span className="text-sm text-zinc-300">{chat.title.at(0)}</span>
          )}
        </div>
      </div>
    </li>
  );
}

export default memo(Item);
