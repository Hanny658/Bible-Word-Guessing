import type {
  EvaluatedLetter,
  LetterState,
} from "@/lib/types";

const STATE_PRIORITY: Record<LetterState, number> = {
  absent: 1,
  present: 2,
  correct: 3,
};

export function evaluateGuess(answer: string, rawGuess: string) {
  const normalizedAnswer = answer.toUpperCase();
  const guess = rawGuess.toUpperCase();
  if (guess.length !== normalizedAnswer.length) {
    throw new Error("Guess and answer lengths must match.");
  }

  const result: EvaluatedLetter[] = [...guess].map((letter) => ({
    letter,
    state: "absent",
  }));
  const remaining = new Map<string, number>();

  for (let index = 0; index < normalizedAnswer.length; index += 1) {
    if (guess[index] === normalizedAnswer[index]) {
      result[index].state = "correct";
    } else {
      remaining.set(
        normalizedAnswer[index],
        (remaining.get(normalizedAnswer[index]) ?? 0) + 1,
      );
    }
  }

  for (let index = 0; index < guess.length; index += 1) {
    if (result[index].state === "correct") continue;
    const count = remaining.get(guess[index]) ?? 0;
    if (count > 0) {
      result[index].state = "present";
      remaining.set(guess[index], count - 1);
    }
  }

  return result;
}

export function keyboardStates(rows: EvaluatedLetter[][]) {
  const states: Partial<Record<string, LetterState>> = {};

  for (const row of rows) {
    for (const tile of row) {
      const previous = states[tile.letter];
      if (!previous || STATE_PRIORITY[tile.state] > STATE_PRIORITY[previous]) {
        states[tile.letter] = tile.state;
      }
    }
  }

  return states;
}

export function isLetterKey(key: string) {
  return /^[a-z]$/iu.test(key);
}
