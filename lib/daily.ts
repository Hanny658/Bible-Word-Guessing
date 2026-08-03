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

export function answerForDate(answers: Answer[], date: Date) {
  if (answers.length === 0) throw new Error("The answer set is empty.");

  const dateKey = utcDateKey(date);
  const dateStart = Date.parse(`${dateKey}T00:00:00.000Z`);
  const epochStart = Date.parse(`${DAILY_EPOCH_UTC}T00:00:00.000Z`);
  const dayOffset = Math.floor((dateStart - epochStart) / DAY_MS);
  const cycle = Math.floor(dayOffset / answers.length);
  const dayInCycle = modulo(dayOffset, answers.length);
  const ordered = answers
    .map((answer) => ({ answer, rank: rankForAnswer(answer, cycle) }))
    .sort((left, right) =>
      left.rank === right.rank
        ? left.answer.word.localeCompare(right.answer.word)
        : left.rank.localeCompare(right.rank),
    );

  return ordered[dayInCycle].answer;
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
