import { readFile, writeFile, mkdir } from "node:fs/promises";
import { parse } from "csv-parse/sync";
import { explanationFor } from "./explanations.mjs";

const SOURCE = new URL("../.doc/bible_word_candidates.csv", import.meta.url);
const OUTPUT = new URL("../data/answers.json", import.meta.url);

const source = await readFile(SOURCE, "utf8");
const rows = parse(source, {
  columns: true,
  skip_empty_lines: true,
  bom: true,
});

let existingByWord = new Map();
try {
  const existing = JSON.parse(await readFile(OUTPUT, "utf8"));
  existingByWord = new Map(existing.answers.map((answer) => [answer.word, answer]));
} catch {
  // The first import intentionally starts without an existing output file.
}

const answers = rows.map((row) => {
  const word = row.word.trim().toUpperCase();
  const existing = existingByWord.get(word);
  const hasVerse = row.sample_verse_ref?.trim() && row.sample_verse_text?.trim();

  return {
    word,
    length: Number(row.length),
    tier: row.tier,
    category: row.category,
    explanation: explanationFor({ ...row, word }, existing?.explanation),
    sampleVerse: hasVerse
      ? {
          reference: row.sample_verse_ref.trim(),
          text: row.sample_verse_text.trim(),
        }
      : null,
  };
});

await mkdir(new URL("../data/", import.meta.url), { recursive: true });
await writeFile(
  OUTPUT,
  `${JSON.stringify({ version: "v1", answers }, null, 2)}\n`,
  "utf8",
);

console.log(`Imported ${answers.length} answers to data/answers.json.`);
