"use client";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "motion/react";
import {
  type CSSProperties,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { evaluateGuess, isLetterKey, keyboardStates } from "@/lib/game";
import type {
  DailyPuzzle,
  EvaluatedLetter,
  LetterState,
} from "@/lib/types";

type Language = "en" | "zh";
type GameStatus = "playing" | "won" | "lost";

type Progress = {
  puzzleId: string;
  guesses: string[];
};

const COPY = {
  en: {
    brand: "Bible Word Daily",
    subtitle: "A little word. A larger story.",
    loading: "Opening today's page…",
    loadError: "Today's word could not be loaded.",
    retry: "Try again",
    help: "How to play",
    language: "切换到中文",
    enter: "Enter",
    backspace: "Backspace",
    notEnough: "Not enough letters",
    notInList: "That word isn't in the list",
    won: "Beautifully done.",
    lost: "A new word for today.",
    resultEyebrow: "Today's Bible word",
    verse: "A verse to begin with · KJV",
    close: "Back to the board",
    review: "Read today's word",
    attempt: "attempts used",
    newPuzzle: "A new UTC-day puzzle is ready.",
    refresh: "Open new puzzle",
    helpTitle: "How to play",
    helpIntro:
      "Guess the Bible word in the number of tries shown. Every guess must be a valid word of the same length.",
    correct: "Correct letter, correct place",
    present: "Letter appears elsewhere",
    absent: "Letter is not in the word",
    daily:
      "Everyone receives the same word for the UTC day. Your board is saved on this device.",
    statusCorrect: "correct",
    statusPresent: "present elsewhere",
    statusAbsent: "not in the word",
    dismiss: "Close",
  },
  zh: {
    brand: "字里经心",
    subtitle: "一个小词，一段更大的故事。",
    loading: "正在翻开新的一页……",
    loadError: "暂时无法载入今天的词。",
    retry: "再试一次",
    help: "玩法说明",
    language: "Switch to English",
    enter: "提交",
    backspace: "删除",
    notEnough: "字母还没有填满",
    notInList: "词表中没有这个词",
    won: "猜对了，很棒。",
    lost: "今天也许认识了一个新词~",
    resultEyebrow: "今日圣经词语",
    verse: "从这节经文开始 · KJV",
    close: "返回棋盘",
    review: "阅读今天的词",
    attempt: "次尝试",
    newPuzzle: "新的 UTC 日期谜题已经准备好了。",
    refresh: "打开新谜题",
    helpTitle: "游玩方式",
    helpIntro:
      "在规定次数内猜出圣经词语。每次提交都必须是一个长度相同的有效英文单词。",
    correct: "字母和位置都正确",
    present: "答案包含字母，但位置不同",
    absent: "答案不包含这个字母",
    daily: "全球玩家在同一个 UTC 日期获得相同答案，您的进度将保存在此设备上。",
    statusCorrect: "位置正确",
    statusPresent: "存在但位置不同",
    statusAbsent: "答案中不存在",
    dismiss: "关闭",
  },
} as const;

const KEYBOARD_ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "BACKSPACE"],
];

const STATUS_SYMBOL: Record<LetterState, string> = {
  correct: "✓",
  present: "◇",
  absent: "×",
};

function getInitialLanguage(): Language {
  if (typeof window === "undefined") return "en";
  const saved = window.localStorage.getItem("bwd-language");
  if (saved === "en" || saved === "zh") return saved;
  return window.navigator.language.toLowerCase().startsWith("zh") ? "zh" : "en";
}

function progressKey(puzzleId: string) {
  return `bwd-progress:${puzzleId}`;
}

function deriveStatus(answer: string, guesses: string[], maxAttempts: number): GameStatus {
  if (guesses.includes(answer)) return "won";
  if (guesses.length >= maxAttempts) return "lost";
  return "playing";
}

function formatDate(dateUtc: string, language: Language) {
  return new Intl.DateTimeFormat(language === "zh" ? "zh-CN" : "en-US", {
    timeZone: "UTC",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${dateUtc}T12:00:00.000Z`));
}

export function BibleWordGame() {
  const reducedMotion = useReducedMotion();
  const [language, setLanguage] = useState<Language>("en");
  const [puzzle, setPuzzle] = useState<DailyPuzzle | null>(null);
  const [acceptableGuesses, setAcceptableGuesses] = useState<Set<string> | null>(null);
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [gameStatus, setGameStatus] = useState<GameStatus>("playing");
  const [loadError, setLoadError] = useState(false);
  const [loadNonce, setLoadNonce] = useState(0);
  const [message, setMessage] = useState("");
  const [shakeNonce, setShakeNonce] = useState(0);
  const [activeRevealRow, setActiveRevealRow] = useState<number | null>(null);
  const [celebratingRow, setCelebratingRow] = useState<number | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [newPuzzleAvailable, setNewPuzzleAvailable] = useState(false);
  const revealTimer = useRef<number | null>(null);
  const copy = COPY[language];

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const initialLanguage = getInitialLanguage();
      setLanguage(initialLanguage);
      document.documentElement.lang = initialLanguage === "zh" ? "zh-CN" : "en";
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        const puzzleResponse = await fetch("/api/daily", {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!puzzleResponse.ok) throw new Error("Puzzle request failed.");
        const nextPuzzle = (await puzzleResponse.json()) as DailyPuzzle;
        const wordsResponse = await fetch(nextPuzzle.guessListUrl, {
          signal: controller.signal,
        });
        if (!wordsResponse.ok) throw new Error("Guess list request failed.");
        const words = new Set(
          (await wordsResponse.text())
            .split(/\r?\n/u)
            .map((word) => word.trim().toUpperCase())
            .filter(Boolean),
        );
        if (!words.has(nextPuzzle.answer)) {
          throw new Error("Today's answer is missing from the guess list.");
        }

        let restored: string[] = [];
        try {
          const stored = window.localStorage.getItem(progressKey(nextPuzzle.puzzleId));
          if (stored) {
            const progress = JSON.parse(stored) as Progress;
            if (progress.puzzleId === nextPuzzle.puzzleId) {
              restored = progress.guesses
                .map((guess) => guess.toUpperCase())
                .filter(
                  (guess) =>
                    guess.length === nextPuzzle.length && words.has(guess),
                )
                .slice(0, nextPuzzle.maxAttempts);
            }
          }
        } catch {
          window.localStorage.removeItem(progressKey(nextPuzzle.puzzleId));
        }

        const restoredStatus = deriveStatus(
          nextPuzzle.answer,
          restored,
          nextPuzzle.maxAttempts,
        );
        setPuzzle(nextPuzzle);
        setAcceptableGuesses(words);
        setGuesses(restored);
        setGameStatus(restoredStatus);
        setShowResult(restoredStatus !== "playing");
      } catch (error) {
        if ((error as Error).name !== "AbortError") setLoadError(true);
      }
    }

    void load();
    return () => controller.abort();
  }, [loadNonce]);

  useEffect(() => {
    if (!puzzle) return;
    const delay = Math.max(0, Date.parse(puzzle.nextPuzzleAt) - Date.now());
    const timer = window.setTimeout(() => setNewPuzzleAvailable(true), delay);
    return () => window.clearTimeout(timer);
  }, [puzzle]);

  useEffect(() => {
    return () => {
      if (revealTimer.current !== null) window.clearTimeout(revealTimer.current);
    };
  }, []);

  const evaluatedRows = useMemo(
    () => (puzzle ? guesses.map((guess) => evaluateGuess(puzzle.answer, guess)) : []),
    [guesses, puzzle],
  );
  const keyStates = useMemo(() => keyboardStates(evaluatedRows), [evaluatedRows]);

  const announceError = useCallback((text: string) => {
    setMessage(text);
    setShakeNonce((value) => value + 1);
    window.setTimeout(() => setMessage(""), 1700);
  }, []);

  const submitGuess = useCallback(() => {
    if (
      !puzzle ||
      !acceptableGuesses ||
      gameStatus !== "playing" ||
      activeRevealRow !== null
    ) {
      return;
    }
    if (currentGuess.length !== puzzle.length) {
      announceError(copy.notEnough);
      return;
    }
    if (!acceptableGuesses.has(currentGuess)) {
      announceError(copy.notInList);
      return;
    }

    const nextGuesses = [...guesses, currentGuess];
    const rowIndex = guesses.length;
    const nextStatus = deriveStatus(
      puzzle.answer,
      nextGuesses,
      puzzle.maxAttempts,
    );
    setGuesses(nextGuesses);
    setCurrentGuess("");
    setGameStatus(nextStatus);
    setActiveRevealRow(rowIndex);
    window.localStorage.setItem(
      progressKey(puzzle.puzzleId),
      JSON.stringify({ puzzleId: puzzle.puzzleId, guesses: nextGuesses } satisfies Progress),
    );

    const revealDuration = reducedMotion ? 0 : 520 + (puzzle.length - 1) * 115;
    if (revealTimer.current !== null) window.clearTimeout(revealTimer.current);
    revealTimer.current = window.setTimeout(() => {
      setActiveRevealRow(null);
      if (nextStatus === "won") {
        setCelebratingRow(rowIndex);
        window.setTimeout(() => setCelebratingRow(null), reducedMotion ? 0 : 650);
      }
      if (nextStatus !== "playing") setShowResult(true);
    }, revealDuration);
  }, [
    acceptableGuesses,
    activeRevealRow,
    announceError,
    copy.notEnough,
    copy.notInList,
    currentGuess,
    gameStatus,
    guesses,
    puzzle,
    reducedMotion,
  ]);

  const handleInput = useCallback(
    (key: string) => {
      if (
        !puzzle ||
        showHelp ||
        showResult ||
        gameStatus !== "playing" ||
        activeRevealRow !== null
      ) {
        return;
      }
      if (key === "ENTER") {
        submitGuess();
      } else if (key === "BACKSPACE") {
        setCurrentGuess((guess) => guess.slice(0, -1));
      } else if (isLetterKey(key) && currentGuess.length < puzzle.length) {
        setCurrentGuess((guess) => `${guess}${key.toUpperCase()}`);
      }
    }, [
      activeRevealRow,
      currentGuess.length,
      gameStatus,
      puzzle,
      showHelp,
      showResult,
      submitGuess,
    ],
  );

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key === "Enter") handleInput("ENTER");
      else if (event.key === "Backspace") handleInput("BACKSPACE");
      else if (isLetterKey(event.key)) handleInput(event.key.toUpperCase());
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleInput]);

  const toggleLanguage = () => {
    const next = language === "en" ? "zh" : "en";
    setLanguage(next);
    window.localStorage.setItem("bwd-language", next);
    document.documentElement.lang = next === "zh" ? "zh-CN" : "en";
  };

  const retryLoad = () => {
    setLoadError(false);
    setPuzzle(null);
    setAcceptableGuesses(null);
    setGuesses([]);
    setCurrentGuess("");
    setShowResult(false);
    setLoadNonce((value) => value + 1);
  };

  if (loadError) {
    return (
      <main className="game-shell centered-state">
        <BrandMark />
        <h1>{copy.brand}</h1>
        <p>{copy.loadError}</p>
        <button className="primary-button" onClick={retryLoad}>
          {copy.retry}
        </button>
      </main>
    );
  }

  if (!puzzle || !acceptableGuesses) {
    return (
      <main className="game-shell centered-state" aria-busy="true">
        <motion.div
          animate={reducedMotion ? undefined : { rotate: [0, 2, -2, 0] }}
          transition={{ duration: 1.8, repeat: Infinity }}
        >
          <BrandMark />
        </motion.div>
        <h1>{copy.brand}</h1>
        <p>{copy.loading}</p>
      </main>
    );
  }

  const boardStyle = { "--word-length": puzzle.length } as CSSProperties;

  return (
    <main className="game-shell">
      <header className="topbar">
        <button className="icon-button" onClick={() => setShowHelp(true)} aria-label={copy.help}>
          <span aria-hidden="true">?</span>
        </button>
        <div className="brand-lockup">
          <BrandMark small />
          <div>
            <h1>{copy.brand}</h1>
            <p>{copy.subtitle}</p>
          </div>
        </div>
        <button className="language-button" onClick={toggleLanguage} aria-label={copy.language}>
          {language === "en" ? "中文" : "EN"}
        </button>
      </header>

      <div className="date-rule" aria-label={`${formatDate(puzzle.dateUtc, language)} UTC`}>
        <span />
        <time dateTime={puzzle.dateUtc}>{formatDate(puzzle.dateUtc, language)}</time>
        <span />
      </div>

      <AnimatePresence>
        {newPuzzleAvailable && (
          <motion.div
            className="new-puzzle-banner"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <span>{copy.newPuzzle}</span>
            <button onClick={() => window.location.reload()}>{copy.refresh}</button>
          </motion.div>
        )}
      </AnimatePresence>

      <section className="board-region" aria-label="Word board">
        <div className="attempt-caption">
          <span>{guesses.length}</span> / {puzzle.maxAttempts} {copy.attempt}
        </div>
        <div className="board" style={boardStyle}>
          {Array.from({ length: puzzle.maxAttempts }, (_, rowIndex) => {
            const evaluated = evaluatedRows[rowIndex];
            const isCurrent = rowIndex === guesses.length && gameStatus === "playing";
            return (
              <BoardRow
                key={rowIndex}
                rowIndex={rowIndex}
                length={puzzle.length}
                evaluated={evaluated}
                current={isCurrent ? currentGuess : ""}
                animateReveal={activeRevealRow === rowIndex}
                celebrate={celebratingRow === rowIndex}
                shake={isCurrent ? shakeNonce : 0}
                reducedMotion={Boolean(reducedMotion)}
                language={language}
              />
            );
          })}
        </div>
      </section>

      <div className="message-slot" aria-live="polite" aria-atomic="true">
        <AnimatePresence mode="wait">
          {message && (
            <motion.div
              key={message}
              className="toast"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
            >
              {message}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Keyboard
        states={keyStates}
        onKey={handleInput}
        language={language}
        disabled={gameStatus !== "playing" || activeRevealRow !== null}
      />

      {gameStatus !== "playing" && !showResult && (
        <button className="review-button" onClick={() => setShowResult(true)}>
          <span aria-hidden="true">✦</span> {copy.review}
        </button>
      )}

      <p className="footer-note">UTC · {puzzle.puzzleId}</p>

      <AnimatePresence>
        {showHelp && (
          <Modal onClose={() => setShowHelp(false)} closeLabel={copy.dismiss}>
            <HelpContent language={language} />
          </Modal>
        )}
        {showResult && (
          <Modal onClose={() => setShowResult(false)} closeLabel={copy.dismiss} wide>
            <ResultContent
              puzzle={puzzle}
              status={gameStatus}
              language={language}
              onClose={() => setShowResult(false)}
            />
          </Modal>
        )}
      </AnimatePresence>
    </main>
  );
}

function BrandMark({ small = false }: { small?: boolean }) {
  return (
    <span className={small ? "brand-mark small" : "brand-mark"} aria-hidden="true">
      <span>✦</span>
    </span>
  );
}

function BoardRow({
  rowIndex,
  length,
  evaluated,
  current,
  animateReveal,
  celebrate,
  shake,
  reducedMotion,
  language,
}: {
  rowIndex: number;
  length: number;
  evaluated?: EvaluatedLetter[];
  current: string;
  animateReveal: boolean;
  celebrate: boolean;
  shake: number;
  reducedMotion: boolean;
  language: Language;
}) {
  const copy = COPY[language];
  return (
    <motion.div
      className="board-row"
      key={`${rowIndex}-${shake}`}
      animate={
        shake && !reducedMotion
          ? { x: [0, -7, 7, -5, 5, 0] }
          : { x: 0 }
      }
      transition={{ duration: 0.34 }}
    >
      {Array.from({ length }, (_, columnIndex) => {
        const evaluatedTile = evaluated?.[columnIndex];
        const letter = evaluatedTile?.letter ?? current[columnIndex] ?? "";
        const label = evaluatedTile
          ? `${letter}, ${
              evaluatedTile.state === "correct"
                ? copy.statusCorrect
                : evaluatedTile.state === "present"
                  ? copy.statusPresent
                  : copy.statusAbsent
            }`
          : letter || "empty";

        return (
          <motion.div
            className="tile-scene"
            key={`${rowIndex}-${columnIndex}-${letter}`}
            aria-label={label}
            animate={
              celebrate && !reducedMotion
                ? { y: [0, -9, 0] }
                : { y: 0 }
            }
            transition={{
              duration: 0.42,
              delay: celebrate ? columnIndex * 0.07 : 0,
            }}
          >
            {evaluatedTile ? (
              <motion.div
                className="tile-card"
                initial={animateReveal && !reducedMotion ? { rotateX: 0 } : false}
                animate={{ rotateX: 180 }}
                transition={{
                  duration: reducedMotion ? 0 : 0.48,
                  delay: animateReveal && !reducedMotion ? columnIndex * 0.115 : 0,
                  ease: [0.42, 0, 0.2, 1],
                }}
              >
                <span className="tile-face tile-front">{letter}</span>
                <span className="tile-face tile-back" data-state={evaluatedTile.state}>
                  {letter}
                  <span className="state-symbol" aria-hidden="true">
                    {STATUS_SYMBOL[evaluatedTile.state]}
                  </span>
                </span>
              </motion.div>
            ) : (
              <motion.span
                className="tile-face tile-live"
                data-filled={Boolean(letter)}
                initial={letter && !reducedMotion ? { scale: 0.82 } : false}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 440, damping: 23 }}
              >
                {letter}
              </motion.span>
            )}
          </motion.div>
        );
      })}
    </motion.div>
  );
}

function Keyboard({
  states,
  onKey,
  language,
  disabled,
}: {
  states: Partial<Record<string, LetterState>>;
  onKey: (key: string) => void;
  language: Language;
  disabled: boolean;
}) {
  const copy = COPY[language];
  return (
    <section className="keyboard" aria-label="Keyboard">
      {KEYBOARD_ROWS.map((row, rowIndex) => (
        <div className={`keyboard-row row-${rowIndex + 1}`} key={row.join("")}>
          {row.map((key) => {
            const state = states[key];
            const isAction = key === "ENTER" || key === "BACKSPACE";
            const keyLabel =
              key === "ENTER" ? copy.enter : key === "BACKSPACE" ? copy.backspace : key;
            return (
              <button
                type="button"
                className={isAction ? "key action-key" : "key"}
                data-state={state}
                key={key}
                onClick={() => onKey(key)}
                disabled={disabled}
                aria-label={
                  state
                    ? `${keyLabel}, ${
                        state === "correct"
                          ? copy.statusCorrect
                          : state === "present"
                            ? copy.statusPresent
                            : copy.statusAbsent
                      }`
                    : keyLabel
                }
              >
                {key === "ENTER" ? "↵" : key === "BACKSPACE" ? "⌫" : key}
                {state && (
                  <span className="key-symbol" aria-hidden="true">
                    {STATUS_SYMBOL[state]}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      ))}
    </section>
  );
}

function Modal({
  children,
  onClose,
  closeLabel,
  wide = false,
}: {
  children: ReactNode;
  onClose: () => void;
  closeLabel: string;
  wide?: boolean;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    closeRef.current?.focus();
    function onEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, [onClose]);

  return (
    <motion.div
      className="modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) onClose();
      }}
    >
      <motion.section
        className={wide ? "modal-card result-card" : "modal-card"}
        role="dialog"
        aria-modal="true"
        initial={{ opacity: 0, y: 28, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 18, scale: 0.98 }}
        transition={{ type: "spring", stiffness: 310, damping: 29 }}
      >
        <button ref={closeRef} className="modal-close" onClick={onClose} aria-label={closeLabel}>
          ×
        </button>
        {children}
      </motion.section>
    </motion.div>
  );
}

function HelpContent({ language }: { language: Language }) {
  const copy = COPY[language];
  const examples: { state: LetterState; label: string; letter: string }[] = [
    { state: "correct", label: copy.correct, letter: "A" },
    { state: "present", label: copy.present, letter: "M" },
    { state: "absent", label: copy.absent, letter: "E" },
  ];
  return (
    <div className="help-content">
      <p className="modal-kicker">{copy.brand}</p>
      <h2>{copy.helpTitle}</h2>
      <p>{copy.helpIntro}</p>
      <div className="help-examples">
        {examples.map((example) => (
          <div className="help-example" key={example.state}>
            <span className="mini-tile" data-state={example.state}>
              {example.letter}
              <small aria-hidden="true">{STATUS_SYMBOL[example.state]}</small>
            </span>
            <span>{example.label}</span>
          </div>
        ))}
      </div>
      <p className="modal-note">{copy.daily}</p>
    </div>
  );
}

function ResultContent({
  puzzle,
  status,
  language,
  onClose,
}: {
  puzzle: DailyPuzzle;
  status: GameStatus;
  language: Language;
  onClose: () => void;
}) {
  const copy = COPY[language];
  return (
    <div className="result-content">
      <div className="result-ornament" aria-hidden="true">
        <span />✦<span />
      </div>
      <p className="modal-kicker">{copy.resultEyebrow}</p>
      <h2>{puzzle.answer}</h2>
      <p className="result-response">{status === "won" ? copy.won : copy.lost}</p>
      <p className="explanation">{puzzle.explanation[language]}</p>
      {puzzle.sampleVerse && (
        <blockquote>
          <p>“{puzzle.sampleVerse.text}”</p>
          <cite>
            {puzzle.sampleVerse.reference} · {copy.verse}
          </cite>
        </blockquote>
      )}
      <button className="primary-button" onClick={onClose}>
        {copy.close}
      </button>
    </div>
  );
}
