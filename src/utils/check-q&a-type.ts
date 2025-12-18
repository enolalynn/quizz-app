import { answerType } from "../model/answer";
import { correctAnswer, QuestionType } from "../model/question";
import { AppError } from "../error-codes/app.error";

export function checkQAType(
  type: QuestionType | answerType,
  answer: correctAnswer
) {
  switch (type) {
    case "boolean":
      if (typeof answer !== typeof true) {
        throw new AppError(
          "Answer must be a boolean for BOOLEAN type",
          "UNMATCH",
          400
        );
      }
      break;
    case "choices":
      if (
        !Array.isArray(answer) ||
        !answer.every(
          (ans) => typeof ans === "string" || typeof ans === "number"
        )
      ) {
        throw new AppError(
          "Answer must be an array for CHOICES type",
          "UNMATCH",
          400
        );
      }
      break;
    case "blank":
      if (typeof answer !== "string") {
        throw new AppError(
          "Answer must be a string for BLANK type",
          "UNMATCH",
          400
        );
      }
      break;
    default:
      throw new AppError("Invalid", "ERROR_ONE", 400);
  }
}
