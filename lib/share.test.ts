import { describe, expect, it } from "vitest";
import { evaluateGuess } from "@/lib/game";
import { buildShareText } from "@/lib/share";

const rows = [
  evaluateGuess("GRACE", "CRANE"),
  evaluateGuess("GRACE", "GRACE"),
];

describe("buildShareText", () => {
  it("renders a square grid with the attempt score", () => {
    expect(
      buildShareText({
        brand: "Bible Word Daily",
        dateUtc: "2026-08-03",
        maxAttempts: 6,
        status: "won",
        rows,
      }),
    ).toBe(
      ["Bible Word Daily 2026-08-03", "2/6", "", "🟨🟩🟩⬜🟩", "🟩🟩🟩🟩🟩"].join("\n"),
    );
  });

  it("scores a loss with X", () => {
    const text = buildShareText({
      brand: "字里经心",
      dateUtc: "2026-08-03",
      maxAttempts: 5,
      status: "lost",
      rows: [evaluateGuess("GRACE", "CRANE")],
    });
    expect(text.split("\n")[1]).toBe("X/5");
  });

  it("never leaks the answer", () => {
    const text = buildShareText({
      brand: "Bible Word Daily",
      dateUtc: "2026-08-03",
      maxAttempts: 6,
      status: "won",
      rows,
    });
    expect(text).not.toContain("GRACE");
    expect(text).not.toMatch(/[A-Z]{5}/u);
  });

  it("appends the origin when one is given", () => {
    const text = buildShareText({
      brand: "Bible Word Daily",
      dateUtc: "2026-08-03",
      maxAttempts: 6,
      status: "won",
      rows,
      origin: "https://example.com",
    });
    expect(text.endsWith("\n\nhttps://example.com")).toBe(true);
  });
});
