import { describe, expect, it } from "vitest";
import answerData from "@/data/answers.json";
import {
  answerForDate,
  buildDailyPuzzle,
  maxAttemptsForLength,
  utcDateKey,
} from "@/lib/daily";
import type { Answer } from "@/lib/types";

const answers = answerData.answers as Answer[];

describe("daily puzzle selection", () => {
  it("uses a UTC date boundary", () => {
    expect(utcDateKey(new Date("2026-08-03T23:59:59.999Z"))).toBe("2026-08-03");
    expect(utcDateKey(new Date("2026-08-04T00:00:00.000Z"))).toBe("2026-08-04");
  });

  it("returns the same answer throughout a UTC day", () => {
    const morning = answerForDate(answers, new Date("2026-08-03T00:01:00Z"));
    const evening = answerForDate(answers, new Date("2026-08-03T23:59:00Z"));
    expect(morning.word).toBe(evening.word);
  });

  it("does not repeat within one complete answer cycle", () => {
    const words = new Set<string>();
    for (let day = 0; day < answers.length; day += 1) {
      const date = new Date(Date.UTC(2026, 0, 1 + day));
      words.add(answerForDate(answers, date).word);
    }
    expect(words.size).toBe(answers.length);
  });

  it("reshuffles without repeating in the next cycle", () => {
    const dayOf = (offset: number) =>
      answerForDate(answers, new Date(Date.UTC(2026, 0, 1 + offset))).word;

    const secondCycle = new Set<string>();
    for (let day = 0; day < answers.length; day += 1) {
      secondCycle.add(dayOf(answers.length + day));
    }
    expect(secondCycle.size).toBe(answers.length);
    expect(dayOf(answers.length)).not.toBe(dayOf(0));
  });

  it("handles dates before the epoch", () => {
    const beforeEpoch = answerForDate(answers, new Date("2025-12-31T12:00:00Z"));
    expect(beforeEpoch.word).toMatch(/^[A-Z]{4,7}$/u);
    expect(answerForDate(answers, new Date("2025-12-31T00:00:00Z")).word).toBe(
      beforeEpoch.word,
    );
  });

  it("is stable across repeated calls for the same day", () => {
    const date = new Date("2026-08-03T12:00:00Z");
    const first = answerForDate(answers, date).word;
    for (let attempt = 0; attempt < 5; attempt += 1) {
      expect(answerForDate(answers, date).word).toBe(first);
    }
  });

  it("returns the right attempt budget and API metadata", () => {
    expect(maxAttemptsForLength(4)).toBe(5);
    expect(maxAttemptsForLength(5)).toBe(6);
    expect(maxAttemptsForLength(6)).toBe(6);
    expect(maxAttemptsForLength(7)).toBe(7);

    const puzzle = buildDailyPuzzle(answers, new Date("2026-08-03T12:00:00Z"));
    expect(puzzle.puzzleId).toBe("v1:2026-08-03");
    expect(puzzle.answer).toHaveLength(puzzle.length);
    expect(puzzle.nextPuzzleAt).toBe("2026-08-04T00:00:00.000Z");
  });
});
