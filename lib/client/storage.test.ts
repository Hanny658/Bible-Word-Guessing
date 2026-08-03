import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  loadProgress,
  pruneProgress,
  saveProgress,
} from "@/lib/client/storage";

function createStorage(failOnWrite = false) {
  const map = new Map<string, string>();
  return {
    map,
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => {
      if (failOnWrite) throw new DOMException("QuotaExceededError");
      map.set(key, value);
    },
    removeItem: (key: string) => void map.delete(key),
    key: (index: number) => [...map.keys()][index] ?? null,
    get length() {
      return map.size;
    },
  };
}

function createCookieJar(blocked = false) {
  const jar = new Map<string, string>();
  return {
    jar,
    install() {
      Object.defineProperty(globalThis, "document", {
        configurable: true,
        value: {
          get cookie() {
            return [...jar].map(([name, value]) => `${name}=${value}`).join("; ");
          },
          set cookie(raw: string) {
            if (blocked) return;
            const [pair] = raw.split(";");
            const index = pair.indexOf("=");
            jar.set(pair.slice(0, index).trim(), pair.slice(index + 1));
          },
        },
      });
    },
  };
}

const tomorrow = () => Date.now() + 86400000;

afterEach(() => {
  vi.unstubAllGlobals();
  Reflect.deleteProperty(globalThis, "document");
});

describe("progress storage", () => {
  beforeEach(() => {
    createCookieJar().install();
  });

  it("round-trips guesses through localStorage", () => {
    vi.stubGlobal("window", { localStorage: createStorage() });

    expect(
      saveProgress({ puzzleId: "v1:2026-08-03", guesses: ["GRACE"] }, tomorrow()),
    ).toBe(true);
    expect(loadProgress("v1:2026-08-03")).toEqual(["GRACE"]);
  });

  it("does not throw and falls back to a cookie when localStorage is blocked", () => {
    vi.stubGlobal("window", { localStorage: createStorage(true) });

    expect(() =>
      saveProgress({ puzzleId: "v1:2026-08-03", guesses: ["GRACE"] }, tomorrow()),
    ).not.toThrow();
    expect(
      saveProgress({ puzzleId: "v1:2026-08-03", guesses: ["GRACE"] }, tomorrow()),
    ).toBe(true);
    expect(loadProgress("v1:2026-08-03")).toEqual(["GRACE"]);
  });

  it("reports failure when neither storage nor cookies are writable", () => {
    vi.stubGlobal("window", { localStorage: createStorage(true) });
    createCookieJar(true).install();

    expect(
      saveProgress({ puzzleId: "v1:2026-08-03", guesses: ["GRACE"] }, tomorrow()),
    ).toBe(false);
    expect(loadProgress("v1:2026-08-03")).toEqual([]);
  });

  it("ignores saved progress from another puzzle", () => {
    const storage = createStorage();
    vi.stubGlobal("window", { localStorage: storage });

    saveProgress({ puzzleId: "v1:2026-08-02", guesses: ["GRACE"] }, tomorrow());
    expect(loadProgress("v1:2026-08-03")).toEqual([]);
  });

  it("survives corrupt stored data", () => {
    const storage = createStorage();
    storage.map.set("bwd-progress:v1:2026-08-03", "{not json");
    vi.stubGlobal("window", { localStorage: storage });

    expect(loadProgress("v1:2026-08-03")).toEqual([]);
    expect(storage.map.has("bwd-progress:v1:2026-08-03")).toBe(false);
  });

  it("prunes boards from previous days but keeps today's", () => {
    const storage = createStorage();
    storage.map.set("bwd-progress:v1:2026-08-01", "{}");
    storage.map.set("bwd-progress:v1:2026-08-02", "{}");
    storage.map.set("bwd-progress:v1:2026-08-03", "{}");
    storage.map.set("bwd-language", "en");
    vi.stubGlobal("window", { localStorage: storage });

    pruneProgress("v1:2026-08-03");

    expect([...storage.map.keys()]).toEqual([
      "bwd-progress:v1:2026-08-03",
      "bwd-language",
    ]);
  });
});
