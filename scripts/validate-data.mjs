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
const seenEnglish = new Set();
const seenChinese = new Set();
const fallbackPattern =
  /the cited verse|a starting point|wider (?:biblical )?(?:context|setting)|所附经文可作为起点|更完整的圣经上下文|进一步认识它的背景/iu;
const denominationalLabelPattern =
  /seventh-day adventist|基督复临安息日会|sda (?:teaching|doctrine|belief)/iu;

if (data.version !== "v1") throw new Error("Unexpected answer data version.");
if (!Array.isArray(data.answers) || data.answers.length !== 580) {
  throw new Error(`Expected exactly 580 answers, received ${data.answers?.length}.`);
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
  if (answer.explanation.en.length < 70 || answer.explanation.zh.length < 35) {
    throw new Error(`Explanation is too brief to be useful: ${answer.word}`);
  }
  if (fallbackPattern.test(`${answer.explanation.en} ${answer.explanation.zh}`)) {
    throw new Error(`Fallback or generic explanation remains: ${answer.word}`);
  }
  if (
    denominationalLabelPattern.test(
      `${answer.explanation.en} ${answer.explanation.zh}`,
    )
  ) {
    throw new Error(`Denominational label leaked into player copy: ${answer.word}`);
  }
  if (seenEnglish.has(answer.explanation.en)) {
    throw new Error(`Duplicate English explanation: ${answer.word}`);
  }
  if (seenChinese.has(answer.explanation.zh)) {
    throw new Error(`Duplicate Chinese explanation: ${answer.word}`);
  }
  seenEnglish.add(answer.explanation.en);
  seenChinese.add(answer.explanation.zh);
  if (
    !answer.sampleVerse?.reference?.trim() ||
    !answer.sampleVerse?.text?.trim()
  ) {
    throw new Error(`Missing reviewed sample verse: ${answer.word}`);
  }
  if (/^#\s|\[[^\]]+\]/u.test(answer.sampleVerse.text)) {
    throw new Error(`Unclean KJV source markers in ${answer.word}.`);
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

console.log(
  `Validated ${data.answers.length} answers and all four acceptable-guess lists.`,
);
