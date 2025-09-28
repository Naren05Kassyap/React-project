"use client";

import { useEffect, useRef, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Typing from "@/components/Typing";

type TermMsg = { id: string; role: "user" | "assistant"; text: string };

export default function MainPage() {
  const [messages, setMessages] = useState<TermMsg[]>([]);
  const [current, setCurrent] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  // Focus the hidden input on mount and on click
  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  const focusTerminal = () => inputRef.current?.focus();

  // Scroll to bottom when messages update
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const trimmed = current.trim();
      if (!trimmed) return;
      const user: TermMsg = { id: crypto.randomUUID(), role: "user", text: trimmed };
      const asst: TermMsg = { id: crypto.randomUUID(), role: "assistant", text: trimmed }; // echo for now
      setMessages((prev) => [...prev, user, asst]);
      setCurrent("");
      e.preventDefault();
      return;
    }
    if (e.key === "Escape") {
      setCurrent("");
      e.preventDefault();
    }
  };

  return (
    <main className="h-screen bg-black text-white flex">
      <Sidebar />
      <section className="flex-1 min-w-0 flex flex-col" onClick={focusTerminal}>
        {/* Terminal header (subtle) */}
        <div className="h-12 border-b border-zinc-800 flex items-center px-4">
          <span className="text-xs tracking-widest text-zinc-500 uppercase">
            Terminal
          </span>
        </div>

        {/* Terminal body */}
        <div className="flex-1 overflow-y-auto px-4 py-6" onClick={focusTerminal}>
          {/* History */}
          <div className="space-y-3 font-mono">
            {messages.map((m) =>
              m.role === "user" ? (
                <div key={m.id} className="whitespace-pre-wrap">
                  <span className="text-emerald-400">{"> "}</span>
                  <span className="text-zinc-200">{m.text}</span>
                </div>
              ) : (
                <div key={m.id} className="whitespace-pre-wrap" aria-live="polite">
                  {/* Assistant response with Typing animation */}
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

        {/* Prompt line */}
        <div
          className="border-t border-zinc-800 px-4 py-3 bg-black font-mono"
          onClick={focusTerminal}
        >
          <div className="flex items-center">
            <span className="text-emerald-400 mr-2">{">"}</span>

            {/* Render the live input text (no visible input caret) */}
            <span className="text-zinc-200 whitespace-pre-wrap break-words">
              {current}
            </span>

            {/* Blinking underscore caret */}
            <span className="ml-0.5 text-zinc-400 blink">_</span>

            {/* Hidden input captures real typing */}
            <input
              ref={inputRef}
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              onKeyDown={handleKeyDown}
              className="absolute opacity-0 -z-10 pointer-events-none"
              spellCheck={false}
              autoCorrect="off"
              autoCapitalize="off"
              aria-hidden="true"
            />
          </div>

          {/* Tiny hint the first time (optional) */}
          {messages.length === 0 && !current && (
            <div className="mt-2 text-xs text-zinc-600">
              Type and press <kbd className="px-1 py-0.5 bg-zinc-900 rounded border border-zinc-700">Enter</kbd>
            </div>
          )}
        </div>
      </section>

      {/* Local keyframes for blinking underscore */}
      <style jsx>{`
        @keyframes blink {
          0%, 60% { opacity: 1; }
          61%, 100% { opacity: 0; }
        }
        .blink {
          animation: blink 1s step-end infinite;
        }
      `}</style>
    </main>
  );
}
