import { createHash } from "node:crypto";
import type { Answer, AnswerLength, DailyPuzzle } from "@/lib/types";

export const DATASET_VERSION = "v1";
export const DAILY_EPOCH_UTC = "2026-01-01";
const DAY_MS = 24 * 60 * 60 * 1000;

function modulo(value: number, divisor: number) {
  return ((value % divisor) + divisor) % divisor;
}

export function utcDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function maxAttemptsForLength(
  length: AnswerLength,
): 5 | 6 | 7 {
  if (length === 4) return 5;
  if (length === 7) return 7;
  return 6;
}

function rankForAnswer(answer: Answer, cycle: number) {
  return createHash("sha256")
    .update(`${DATASET_VERSION}:${cycle}:${answer.word}`)
    .digest("hex");
}

type Ranked = { answer: Answer; rank: string };

/**
 * Compares by raw code unit rather than `localeCompare`, so the ordering cannot
 * drift between servers running different locales or ICU builds. Every player
 * must resolve the same word for a given UTC day.
 */
function compareRanked(left: Ranked, right: Ranked) {
  if (left.rank !== right.rank) return left.rank < right.rank ? -1 : 1;
  if (left.answer.word === right.answer.word) return 0;
  return left.answer.word < right.answer.word ? -1 : 1;
}

/**
 * One cycle spans the whole answer set, so the shuffled ordering only changes
 * every `answers.length` days. Caching it keeps the per-request cost of a
 * daily puzzle at a single array index instead of a full hash-and-sort pass.
 */
const orderingCache = new WeakMap<Answer[], { cycle: number; ordered: Answer[] }>();

function orderingForCycle(answers: Answer[], cycle: number) {
  const cached = orderingCache.get(answers);
  if (cached?.cycle === cycle) return cached.ordered;

  const ordered = answers
    .map((answer) => ({ answer, rank: rankForAnswer(answer, cycle) }))
    .sort(compareRanked)
    .map((entry) => entry.answer);

  orderingCache.set(answers, { cycle, ordered });
  return ordered;
}

export function answerForDate(answers: Answer[], date: Date) {
  if (answers.length === 0) throw new Error("The answer set is empty.");

  const dateKey = utcDateKey(date);
  const dateStart = Date.parse(`${dateKey}T00:00:00.000Z`);
  const epochStart = Date.parse(`${DAILY_EPOCH_UTC}T00:00:00.000Z`);
  const dayOffset = Math.floor((dateStart - epochStart) / DAY_MS);
  const cycle = Math.floor(dayOffset / answers.length);
  const dayInCycle = modulo(dayOffset, answers.length);

  return orderingForCycle(answers, cycle)[dayInCycle];
}

export function buildDailyPuzzle(
  answers: Answer[],
  date = new Date(),
): DailyPuzzle {
  const dateUtc = utcDateKey(date);
  const answer = answerForDate(answers, date);
  const nextPuzzleAt = new Date(
    Date.parse(`${dateUtc}T00:00:00.000Z`) + DAY_MS,
  ).toISOString();

  return {
    puzzleId: `${DATASET_VERSION}:${dateUtc}`,
    dateUtc,
    answer: answer.word,
    length: answer.length,
    maxAttempts: maxAttemptsForLength(answer.length),
    guessListUrl: `/words/${DATASET_VERSION}/guesses-${answer.length}.txt`,
    explanation: answer.explanation,
    sampleVerse: answer.sampleVerse,
    nextPuzzleAt,
  };
}
