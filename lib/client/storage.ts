import type { Language, Progress } from "@/lib/types";

const PROGRESS_PREFIX = "bwd-progress:";
const LANGUAGE_KEY = "bwd-language";
const PROGRESS_COOKIE = "bwd_progress";
const MIN_COOKIE_SECONDS = 60;

function progressKey(puzzleId: string) {
  return `${PROGRESS_PREFIX}${puzzleId}`;
}

function readLocal(key: string) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeLocal(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

function removeLocal(key: string) {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Storage is unavailable, so there is nothing to remove.
  }
}

function readCookie(name: string) {
  if (typeof document === "undefined") return null;
  try {
    const prefix = `${name}=`;
    for (const part of document.cookie.split(";")) {
      const entry = part.trim();
      if (entry.startsWith(prefix)) {
        return decodeURIComponent(entry.slice(prefix.length));
      }
    }
  } catch {
    // A blocked or malformed cookie jar is treated as empty.
  }
  return null;
}

function writeCookie(name: string, value: string, maxAgeSeconds: number) {
  if (typeof document === "undefined") return;
  try {
    const maxAge = Math.max(MIN_COOKIE_SECONDS, Math.floor(maxAgeSeconds));
    document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`;
  } catch {
    // Cookies are unavailable, so progress simply is not persisted.
  }
}

function parseProgress(raw: string, puzzleId: string) {
  const parsed = JSON.parse(raw) as Progress;
  if (parsed?.puzzleId !== puzzleId || !Array.isArray(parsed.guesses)) return [];
  return parsed.guesses.filter((guess) => typeof guess === "string");
}

/**
 * Reads saved guesses for a puzzle, preferring localStorage and falling back to
 * the cookie written when localStorage is unavailable. Never throws.
 */
export function loadProgress(puzzleId: string) {
  const local = readLocal(progressKey(puzzleId));
  if (local) {
    try {
      return parseProgress(local, puzzleId);
    } catch {
      removeLocal(progressKey(puzzleId));
    }
  }

  const cookie = readCookie(PROGRESS_COOKIE);
  if (cookie) {
    try {
      return parseProgress(cookie, puzzleId);
    } catch {
      // A corrupt cookie is ignored; the next save overwrites it.
    }
  }

  return [];
}

/**
 * Persists progress on a best-effort basis. Returns false when neither
 * localStorage nor a cookie could be written, and never throws, so a browser
 * with storage disabled degrades to an unsaved but fully playable board.
 */
export function saveProgress(progress: Progress, expiresAtMs: number) {
  const payload = JSON.stringify(progress);
  if (writeLocal(progressKey(progress.puzzleId), payload)) return true;

  writeCookie(
    PROGRESS_COOKIE,
    payload,
    (expiresAtMs - Date.now()) / 1000,
  );
  return readCookie(PROGRESS_COOKIE) !== null;
}

/** Drops saved boards from previous puzzles so storage does not grow forever. */
export function pruneProgress(currentPuzzleId: string) {
  const keep = progressKey(currentPuzzleId);
  try {
    const stale: string[] = [];
    for (let index = 0; index < window.localStorage.length; index += 1) {
      const key = window.localStorage.key(index);
      if (key?.startsWith(PROGRESS_PREFIX) && key !== keep) stale.push(key);
    }
    for (const key of stale) removeLocal(key);
  } catch {
    // Nothing to prune when storage cannot be enumerated.
  }
}

function loadLanguage(): Language {
  if (typeof window === "undefined") return "en";
  const saved = readLocal(LANGUAGE_KEY) ?? readCookie(LANGUAGE_KEY);
  if (saved === "en" || saved === "zh") return saved;
  try {
    return window.navigator.language.toLowerCase().startsWith("zh") ? "zh" : "en";
  } catch {
    return "en";
  }
}

/**
 * The language preference lives outside React so the component can read it with
 * useSyncExternalStore: the server always renders "en", and the stored or
 * browser-derived choice is applied on hydration without a state-setting effect.
 */
const languageListeners = new Set<() => void>();
let languageSnapshot: Language | null = null;

export function subscribeLanguage(listener: () => void) {
  languageListeners.add(listener);
  return () => {
    languageListeners.delete(listener);
  };
}

export function getLanguageSnapshot(): Language {
  languageSnapshot ??= loadLanguage();
  return languageSnapshot;
}

export function getServerLanguageSnapshot(): Language {
  return "en";
}

export function setLanguagePreference(language: Language) {
  languageSnapshot = language;
  if (!writeLocal(LANGUAGE_KEY, language)) {
    writeCookie(LANGUAGE_KEY, language, 365 * 24 * 60 * 60);
  }
  for (const listener of languageListeners) listener();
}
