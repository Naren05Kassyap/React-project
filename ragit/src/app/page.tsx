"use client";

import { useState } from "react";
import Link from "next/link";
import Typing from "@/components/Typing";

export default function Home() {
  const [showSubtitle, setShowSubtitle] = useState(false);
  const [showButton, setShowButton] = useState(false);

  return (
    <main className="bg-black font-mono text-white h-screen flex items-center justify-center">
      <div className="text-center">
        {/* Title */}
        <Typing
          text="RAGit"
          as="h1"
          wrapperDisplay="block"
          speedMsPerChar={200}
          blinkAtEnd={false}
          headingClassName="text-6xl mb-4"
          onComplete={() => setShowSubtitle(true)}
        />

        {/* Subtitle */}
        {showSubtitle && (
          <Typing
            text="RAGify your data"
            as="h2"
            wrapperDisplay="block"
            speedMsPerChar={80}
            blinkAtEnd={false}
            headingClassName="text-xl text-gray-400 mb-10"
            onComplete={() => setShowButton(true)}
          />
        )}

        {/* Button */}
        <div
          className={`transition-opacity duration-300 ${
            showButton ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <Link href="/main">
            <button>
              <Typing
                text="Enter →"
                wrapperDisplay="block"
                speedMsPerChar={80}
                blinkAtEnd={false}
                headingClassName="text-xl text-gray-400 mb-10"
              />
              
            </button>
          </Link>
        </div>
      </div>
    </main>
  );
}
