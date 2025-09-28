export type ExecResult =
  | { type: "output"; output: string }
  | { type: "clear" };

const HELP = [
  "Commands:",
  "  help       Show this help",
  "  clear      Clear the screen (or press Ctrl/⌘+L)",
  "",
  "Anything else will just echo back for now.",
].join("\n");

export function execCommand(input: string): ExecResult {
  const cmd = input.trim();

  if (cmd === "clear") return { type: "clear" };
  if (cmd === "help") return { type: "output", output: HELP };

  // Default: echo (your requirement)
  return { type: "output", output: cmd };
}
