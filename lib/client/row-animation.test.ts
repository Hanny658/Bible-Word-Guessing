import { describe, expect, it } from "vitest";
import { getRowShakeNonce } from "./row-animation";

describe("getRowShakeNonce", () => {
  it("keeps a validation shake scoped to the row that requested it", () => {
    const request = { rowIndex: 0, nonce: 1 };

    expect(getRowShakeNonce(request, 0, true)).toBe(1);
    expect(getRowShakeNonce(request, 1, true)).toBe(0);
    expect(getRowShakeNonce(request, 0, false)).toBe(0);
  });

  it("does not shake without a pending request", () => {
    expect(getRowShakeNonce(null, 0, true)).toBe(0);
  });
});
