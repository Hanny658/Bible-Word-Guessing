import { readFile } from "node:fs/promises";

const data = JSON.parse(
  await readFile(new URL("../data/answers.json", import.meta.url), "utf8"),
);
const expectedCategories = new Set([
  "person",
  "place",
  "concept",
  "person/place",
  "name/other",
]);
const seen = new Set();

if (data.version !== "v1") throw new Error("Unexpected answer data version.");
if (data.answers.length !== 580) {
  throw new Error(`Expected 580 answers, received ${data.answers.length}.`);
}

for (const answer of data.answers) {
  if (!/^[A-Z]{4,7}$/u.test(answer.word)) {
    throw new Error(`Invalid answer spelling: ${answer.word}`);
  }
  if (answer.word.length !== answer.length) {
    throw new Error(`Length mismatch: ${answer.word}`);
  }
  if (seen.has(answer.word)) throw new Error(`Duplicate answer: ${answer.word}`);
  seen.add(answer.word);
  if (!expectedCategories.has(answer.category)) {
    throw new Error(`Invalid category for ${answer.word}: ${answer.category}`);
  }
  if (!answer.explanation?.en?.trim() || !answer.explanation?.zh?.trim()) {
    throw new Error(`Missing bilingual explanation: ${answer.word}`);
  }
  if (JSON.stringify(answer).includes("easton_draft")) {
    throw new Error(`Easton draft leaked into ${answer.word}.`);
  }
}

for (const length of [4, 5, 6, 7]) {
  const guesses = new Set(
    (await readFile(
      new URL(`../public/words/v1/guesses-${length}.txt`, import.meta.url),
      "utf8",
    ))
      .trim()
      .split(/\r?\n/u),
  );
  for (const answer of data.answers.filter((item) => item.length === length)) {
    if (!guesses.has(answer.word)) {
      throw new Error(`${answer.word} is missing from the ${length}-letter list.`);
    }
  }
}

console.log("Validated 580 answers and all four acceptable-guess lists.");
