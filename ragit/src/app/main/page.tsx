"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Typing from "@/components/Typing";
import { useChats } from "@/lib/useChats";
import { execCommand } from "@/lib/terminal";

type TermMsg = { id: string; role: "user" | "assistant"; text: string };

const STORAGE_KEY = (chatId: string) => `ragify:chat:${chatId}:messages`;

export default function MainPage() {
  const { activeChatId, chats } = useChats();
  const active = useMemo(
    () => chats.find((c) => c.id === activeChatId) ?? null,
    [chats, activeChatId]
  );

  // Per-chat messages
  const [messages, setMessages] = useState<TermMsg[]>([]);
  const [current, setCurrent] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  // Command history (per chat, persisted alongside messages)
  const historyRef = useRef<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState<number>(-1); // -1 means not navigating

  // Focus hidden input on mount & on click
  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  const focusTerminal = () => inputRef.current?.focus();

  // Load messages when chat changes
  useEffect(() => {
    if (!active) return;
    const raw = localStorage.getItem(STORAGE_KEY(active.id));
    if (raw) {
      const saved = JSON.parse(raw) as { messages: TermMsg[]; history: string[] };
      setMessages(saved.messages ?? []);
      historyRef.current = saved.history ?? [];
      setHistoryIdx(-1);
      setCurrent("");
    } else {
      setMessages([]);
      historyRef.current = [];
      setHistoryIdx(-1);
      setCurrent("");
    }
    // Ensure focus follows chat switch
    inputRef.current?.focus();
  }, [active?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Persist on change
  useEffect(() => {
    if (!active) return;
    const payload = JSON.stringify({ messages, history: historyRef.current });
    localStorage.setItem(STORAGE_KEY(active.id), payload);
  }, [messages, active?.id]);

  // Auto-scroll on new messages
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  const submit = (text: string) => {
    if (!text.trim() || !active) return;

    const user: TermMsg = { id: crypto.randomUUID(), role: "user", text };
    setMessages((prev) => [...prev, user]);

    // Echo behavior by default; execCommand handles 'clear' etc.
    const result = execCommand(text);

    if (result.type === "clear") {
      // clear only the assistant output? In a real terminal this clears the screen.
      setMessages([]);
      // keep history; do not push "clear" output
      return;
    }

    // assistant response (Typing animation)
    const asst: TermMsg = {
      id: crypto.randomUUID(),
      role: "assistant",
      text: result.output, // usually echoes input for now
    };
    setMessages((prev) => [...prev, asst]);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Submit
    if (e.key === "Enter") {
      e.preventDefault();
      const val = current;
      if (!val.trim()) return;

      // push into history (dedupe consecutive duplicates)
      const h = historyRef.current;
      if (h[h.length - 1] !== val) h.push(val);
      setHistoryIdx(-1);

      submit(val);
      setCurrent("");
      return;
    }

    // History navigation
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      const h = historyRef.current;
      if (h.length === 0) return;
      if (e.key === "ArrowUp") {
        const nextIdx = historyIdx < 0 ? h.length - 1 : Math.max(0, historyIdx - 1);
        setHistoryIdx(nextIdx);
        setCurrent(h[nextIdx] ?? "");
      } else {
        // ArrowDown
        if (historyIdx < 0) return; // nothing to go down to
        const nextIdx = historyIdx + 1;
        if (nextIdx >= h.length) {
          setHistoryIdx(-1);
          setCurrent("");
        } else {
          setHistoryIdx(nextIdx);
          setCurrent(h[nextIdx] ?? "");
        }
      }
      return;
    }

    // Clear screen (Ctrl+L)
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "l") {
      e.preventDefault();
      setMessages([]);
      return;
    }

    // Cancel current input
    if (e.key === "Escape") {
      e.preventDefault();
      setCurrent("");
      setHistoryIdx(-1);
      return;
    }
  };

  return (
    <main className="h-screen bg-black text-white flex" onClick={focusTerminal}>
      <Sidebar />

      <section className="flex-1 min-w-0 flex flex-col">
        {/* Header */}
        <div className="h-12 border-b border-zinc-800 flex items-center px-4">
          <span className="text-xs tracking-widest text-zinc-500 uppercase">
            Terminal
          </span>
          {active && (
            <span className="ml-3 text-xs text-zinc-600 truncate">
              {active.title}
            </span>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="space-y-3 font-mono">
            {messages.map((m) =>
              m.role === "user" ? (
                <div key={m.id} className="whitespace-pre-wrap">
                  <span className="text-emerald-400">{"> "}</span>
                  <span className="text-zinc-200">{m.text}</span>
                </div>
              ) : (
                <div key={m.id} className="whitespace-pre-wrap" aria-live="polite">
                  <Typing
                    as="span"
                    wrapperDisplay="block"
                    text={m.text}
                    speedMsPerChar={24}
                    blinkAtEnd={true}
                    headingClassName="text-zinc-300"
                  />
                </div>
              )
            )}
            <div ref={endRef} />
          </div>
        </div>

        {/* Prompt */}
        <div className="border-t border-zinc-800 px-4 py-3 bg-black font-mono">
          <div className="flex items-center">
            <span className="text-emerald-400 mr-2">{">"}</span>
            <span className="text-zinc-200 whitespace-pre-wrap break-words">{current}</span>
            <span className="ml-0.5 text-zinc-400 blink">_</span>

            {/* Hidden input */}
            <input
              ref={inputRef}
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              onKeyDown={onKeyDown}
              className="absolute opacity-0 -z-10 pointer-events-none"
              spellCheck={false}
              autoCorrect="off"
              autoCapitalize="off"
              aria-hidden="true"
            />
          </div>

          {messages.length === 0 && !current && (
            <div className="mt-2 text-xs text-zinc-600">
              Type and press <kbd className="px-1 py-0.5 bg-zinc-900 rounded border border-zinc-700">Enter</kbd>. Clear with <kbd className="px-1 py-0.5 bg-zinc-900 rounded border border-zinc-700">Ctrl/⌘ + L</kbd>.
            </div>
          )}
        </div>
      </section>

      <style jsx>{`
        @keyframes blink {
          0%, 60% { opacity: 1; }
          61%, 100% { opacity: 0; }
        }
        .blink { animation: blink 1s step-end infinite; }
      `}</style>
    </main>
  );
}
