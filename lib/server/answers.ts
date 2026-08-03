import "server-only";

import answerData from "@/data/answers.json";
import type { Answer } from "@/lib/types";

type AnswerData = {
  version: string;
  answers: Answer[];
};

const data = answerData as AnswerData;

if (data.version !== "v1" || data.answers.length !== 580) {
  throw new Error("The server answer data is invalid or out of date.");
}

export const answers = data.answers;
