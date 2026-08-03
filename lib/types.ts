export const ANSWER_LENGTHS = [4, 5, 6, 7] as const;

export type AnswerLength = (typeof ANSWER_LENGTHS)[number];
export type Tier = "A" | "B" | "C";
export type Category =
  | "person"
  | "place"
  | "concept"
  | "person/place"
  | "name/other";

export type LocalizedText = {
  en: string;
  zh: string;
};

export type SampleVerse = {
  reference: string;
  text: string;
};

export type Answer = {
  word: string;
  length: AnswerLength;
  tier: Tier;
  category: Category;
  explanation: LocalizedText;
  sampleVerse: SampleVerse | null;
};

export type DailyPuzzle = {
  puzzleId: string;
  dateUtc: string;
  answer: string;
  length: AnswerLength;
  maxAttempts: 5 | 6 | 7;
  guessListUrl: string;
  explanation: LocalizedText;
  sampleVerse: SampleVerse | null;
  nextPuzzleAt: string;
};

export type LetterState = "correct" | "present" | "absent";

export type EvaluatedLetter = {
  letter: string;
  state: LetterState;
};

export type Language = "en" | "zh";

export type GameStatus = "playing" | "won" | "lost";

export type Progress = {
  puzzleId: string;
  guesses: string[];
};
