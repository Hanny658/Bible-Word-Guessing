import "server-only";

import { buildDailyPuzzle } from "@/lib/daily";
import { answers } from "@/lib/server/answers";

export function getDailyPuzzle(date = new Date()) {
  return buildDailyPuzzle(answers, date);
}
