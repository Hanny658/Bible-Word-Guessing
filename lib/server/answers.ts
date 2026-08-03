import "server-only";

import answerData from "@/data/answers.json";
import type { Answer } from "@/lib/types";
import { DATASET_VERSION } from "@/lib/daily";

type AnswerData = {
  version: string;
  answers: Answer[];
};

const data = answerData as AnswerData;

if (data.version !== DATASET_VERSION) {
  throw new Error(
    `Expected answer data version ${DATASET_VERSION}, received ${data.version}.`,
  );
}
if (!Array.isArray(data.answers) || data.answers.length === 0) {
  throw new Error("The server answer data is empty.");
}

/**
 * Optional deployment guard. Set BWD_EXPECTED_ANSWER_COUNT to pin the size of
 * the answer set in CI or production; leaving it unset accepts whatever the
 * committed data contains.
 */
const expectedCount = process.env.BWD_EXPECTED_ANSWER_COUNT;
if (expectedCount && data.answers.length !== Number(expectedCount)) {
  throw new Error(
    `Expected ${expectedCount} answers, received ${data.answers.length}.`,
  );
}

export const answers = data.answers;
export const answerCount = answers.length;
