import type { EvaluatedLetter, GameStatus, LetterState } from "@/lib/types";

const SHARE_SQUARE: Record<LetterState, string> = {
  correct: "🟩",
  present: "🟨",
  absent: "⬜",
};

export type ShareInput = {
  brand: string;
  dateUtc: string;
  maxAttempts: number;
  status: GameStatus;
  rows: EvaluatedLetter[][];
  origin?: string;
};

/**
 * Builds the shareable result grid. Only tile states are included, so the text
 * never reveals the answer to someone who has not played yet.
 */
export function buildShareText({
  brand,
  dateUtc,
  maxAttempts,
  status,
  rows,
  origin,
}: ShareInput) {
  const score = status === "won" ? `${rows.length}/${maxAttempts}` : `X/${maxAttempts}`;
  const grid = rows
    .map((row) => row.map((tile) => SHARE_SQUARE[tile.state]).join(""))
    .join("\n");

  const lines = [`${brand} ${dateUtc}`, score, "", grid];
  if (origin) lines.push("", origin);

  return lines.join("\n");
}
