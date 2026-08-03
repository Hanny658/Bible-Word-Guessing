import { describe, expect, it } from "vitest";
import { evaluateGuess, keyboardStates } from "@/lib/game";

describe("evaluateGuess", () => {
  it("marks exact, present, and absent letters", () => {
    expect(evaluateGuess("GRACE", "CRANE").map((tile) => tile.state)).toEqual([
      "present",
      "correct",
      "correct",
      "absent",
      "correct",
    ]);
  });

  it("does not over-allocate repeated letters", () => {
    expect(evaluateGuess("SHEEP", "EERIE").map((tile) => tile.state)).toEqual([
      "present",
      "present",
      "absent",
      "absent",
      "absent",
    ]);
  });

  it("reserves exact matches before present matches", () => {
    expect(evaluateGuess("AARON", "BANAL").map((tile) => tile.state)).toEqual([
      "absent",
      "correct",
      "present",
      "present",
      "absent",
    ]);
  });
});

describe("keyboardStates", () => {
  it("keeps the strongest known state", () => {
    const rows = [
      evaluateGuess("GRACE", "GHOST"),
      evaluateGuess("GRACE", "GRASS"),
    ];
    expect(keyboardStates(rows).G).toBe("correct");
    expect(keyboardStates(rows).R).toBe("correct");
    expect(keyboardStates(rows).S).toBe("absent");
  });
});
