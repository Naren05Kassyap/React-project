import React from 'react';
import Link from "next/link";

type Props = {
  // add props here, e.g. title?: string
};

const page: React.FC<Props> = ({}: Props) => {
  return (
    <main className="flex h-screen flex-col items-center justify-center bg-black text-white">
      {/* Big landing text */}
      <h1 className="text-6xl font-bold mb-8">RAGify</h1>

      {/* Button that links to /main */}
      <Link href="/main">
        <button className="px-6 py-3 text-lg font-medium bg-white text-black rounded-lg hover:bg-gray-200 transition">
          Enter
        </button>
      </Link>
    </main>
  );
};

export default page;