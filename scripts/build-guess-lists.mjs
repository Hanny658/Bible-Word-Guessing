import { readFile, writeFile, mkdir } from "node:fs/promises";
import wordListPath from "word-list";

const answerData = JSON.parse(
  await readFile(new URL("../data/answers.json", import.meta.url), "utf8"),
);
const ordinaryWords = (await readFile(wordListPath, "utf8"))
  .split(/\r?\n/u)
  .map((word) => word.trim().toUpperCase())
  .filter((word) => /^[A-Z]{4,7}$/u.test(word));

const outputDir = new URL("../public/words/v1/", import.meta.url);
await mkdir(outputDir, { recursive: true });

for (const length of [4, 5, 6, 7]) {
  const words = new Set(
    ordinaryWords.filter((word) => word.length === length),
  );
  for (const answer of answerData.answers) {
    if (answer.length === length) words.add(answer.word);
  }
  const sorted = [...words].sort();
  await writeFile(
    new URL(`guesses-${length}.txt`, outputDir),
    `${sorted.join("\n")}\n`,
    "utf8",
  );
  console.log(`Generated ${sorted.length} acceptable ${length}-letter guesses.`);
}
