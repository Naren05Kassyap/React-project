"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import SplitType from "split-type";

type Props<T extends keyof JSX.IntrinsicElements = "h1"> = {
  text: string;
  speedMsPerChar?: number;
  onComplete?: () => void;
  className?: string;                 // wrapper div styles
  headingClassName?: string;          // text element styles
  blinkAtEnd?: boolean;               // trailing blinking cursor?
  wrapperDisplay?: "block" | "inline-block";
  as?: T;
  cursorChar?: string;                // e.g. "_" or "|"
};

export default function Typing<T extends keyof JSX.IntrinsicElements = "h1">({
  text,
  speedMsPerChar = 90,
  onComplete,
  className,
  headingClassName,
  blinkAtEnd = true,
  wrapperDisplay = "inline-block",
  as,
  cursorChar = "_",
}: Props<T>) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const elRef = useRef<HTMLElement | null>(null);
  const cursorRef = useRef<HTMLSpanElement | null>(null);

  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const wrap = wrapRef.current;
    const el = elRef.current;
    const cursor = cursorRef.current;
    if (!wrap || !el || !cursor) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // START hidden via opacity to avoid first-paint flash
    // (visibility caused issues in some paint orders)
    gsap.set(el, { opacity: 0 });

    if (prefersReduced) {
      // Show full text immediately (no animation)
      gsap.set(el, { opacity: 1 });
      if (!blinkAtEnd) gsap.set(cursor, { opacity: 0 });
      onCompleteRef.current?.();
      return;
    }

    // Split text into characters
    const split = new SplitType(el, { types: "chars" });
    const chars = split.chars || [];

    // If SplitType failed or text is empty, just fade in safely
    if (!chars.length) {
      gsap.to(el, { opacity: 1, duration: 0.1 });
      onCompleteRef.current?.();
      return () => {
        split.revert();
      };
    }

    // Hide all chars BEFORE revealing the element (prevents flash)
    gsap.set(chars, { opacity: 0 });
    // Now reveal the container element itself
    gsap.set(el, { opacity: 1 });

    // Measure positions for cursor movement
    const firstRect = el.getBoundingClientRect();
    const charRightOffsets = chars.map(
      (c) => c.getBoundingClientRect().right - firstRect.left
    );

    // Baseline so cursor sits correctly
    const firstCharRect = chars[0]?.getBoundingClientRect();
    const cursorRect = cursor.getBoundingClientRect();
    let baselineY = 0;
    if (firstCharRect) {
      baselineY = (firstCharRect.bottom - firstRect.top) - cursorRect.height;
    }

    // Init wrapper + cursor
    gsap.set(wrap, { position: "relative", display: wrapperDisplay });
    gsap.set(cursor, { x: 0, y: baselineY, opacity: 1 });

    const tl = gsap.timeline({ defaults: { ease: "none" } });

    // Pre-type blink
    tl.to(cursor, { opacity: 1, duration: 0.2 })
      .to(cursor, { opacity: 0.3, duration: 0.2, repeat: 2, yoyo: true });

    // Typewriter effect
    const stepSec = Math.max(0.04, speedMsPerChar / 1000);
    chars.forEach((char, i) => {
      const moveTo = charRightOffsets[i];
      tl.to({}, { duration: stepSec });   // wait per-char
      tl.set(cursor, { x: moveTo });      // jump cursor
      tl.set(char, { opacity: 1 });       // reveal char
    });

    tl.eventCallback("onComplete", () => {
      if (blinkAtEnd) {
        gsap.to(cursor, { opacity: 0.2, duration: 0.4, repeat: -1, yoyo: true });
      } else {
        gsap.set(cursor, { opacity: 0 });
      }
      onCompleteRef.current?.();
    });

    return () => {
      tl.kill();
      split.revert();
    };
  }, [text, speedMsPerChar, blinkAtEnd, wrapperDisplay]);

  const Tag = (as || "h1") as keyof JSX.IntrinsicElements;

  return (
    <div ref={wrapRef} className={`relative ${className ?? ""}`}>
      <Tag
        ref={elRef as any}
        className={`font-mono leading-none whitespace-nowrap ${headingClassName ?? "text-6xl mb-8"}`}
        // Start hidden via opacity; we flip to 1 in the effect after splitting
        style={{ opacity: 0 }}
      >
        {text}
      </Tag>
      <span
        ref={cursorRef}
        className={`absolute left-0 top-0 font-mono leading-none select-none ${headingClassName ?? "text-6xl"}`}
        aria-hidden
      >
        {cursorChar}
      </span>
    </div>
  );
}
