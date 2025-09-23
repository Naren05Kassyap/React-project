import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "RAGify",
  description: "RAG-based SaaS landing page",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
