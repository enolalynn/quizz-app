import { DeleteResult, InsertResult, Repository, UpdateResult } from "typeorm";
import { Question } from "../model/question";
import { AppError } from "../error-codes/app.error";

export enum QuestionType {
  BOOLEAN = "boolean",
  BLANK = "blank",
  CHOICES = "choices",
}
export type CorrectAnswer = string | boolean | string[];

export interface QuestionPayload {
  title: string;
  questionType: QuestionType;
  correctAnswer: CorrectAnswer;
  score: number;
  rank: number;
}
export interface IQestionService {
  createQuestion: (payload: QuestionPayload) => Promise<Question | Question[]>;
  updateQuestion: (id: number, payload: QuestionPayload) => Promise<Question>;
  getAllQuestions: () => Promise<Question[]>;
  getQuestionsById: (id: number) => Promise<Question>;
  deleteQuestion: (id: number) => Promise<DeleteResult>;
}
export class QuestionService implements IQestionService {
  constructor(private questionRepository: Repository<Question>) {}

  async createQuestion(payload: QuestionPayload) {
    if (
      payload.correctAnswer === undefined ||
      payload.questionType === undefined ||
      payload.rank === undefined ||
      payload.score === undefined ||
      payload.title === undefined
    ) {
      throw new AppError("Need to fill required fields. ", "ERROR_ONE", 400);
    }
    const find = await this.questionRepository.findOneBy({
      rank: payload.rank,
    });

    if (find) {
      throw new AppError("Rank no. already exists! ", "DUPLICATE", 409);
    }

    switch (payload.questionType) {
      case "boolean":
        if (typeof payload.correctAnswer !== typeof true) {
          throw new AppError(
            "Answer must be a boolean for BOOLEAN type",
            "UNMATCH_WITH_QUESTIONTYPE",
            400
          );
        }
        break;
      case "choices":
        if (
          !Array.isArray(payload.correctAnswer) ||
          !payload.correctAnswer.every(
            (ans) => typeof ans === "string" || typeof ans === "number"
          )
        ) {
          throw new AppError(
            "Answer must be an array for CHOICES type",
            "UNMATCH_WITH_QUESTIONTYPE",
            400
          );
        }
        break;
      case "blank":
        if (typeof payload.correctAnswer !== "string") {
          throw new AppError(
            "Answer must be a string for BLANK type",
            "UNMATCH_WITH_QUESTIONTYPE",
            400
          );
        }
        break;
      default:
        throw new AppError("Invalid answer type", "ERROR_ONE", 400);
    }
    const question = this.questionRepository.create(payload);

    return await this.questionRepository.save(question);
  }

  async updateQuestion(rank: number, payload: QuestionPayload) {
    const updated = await this.questionRepository.findOneBy({
      rank: rank,
    });
    console.log(updated);
    if (!updated) {
      throw new AppError("Question is not found", "INVALID_QUESTION_ID", 404);
    }

    if (payload.questionType !== undefined) {
      if (payload.correctAnswer === undefined) {
        throw new AppError(
          "Require correctAnswer for changing question!",
          "UNMATCH_WITH_QUESTIONTYPE",
          404
        );
      } else {
        switch (payload.questionType) {
          case "boolean":
            if (typeof payload.correctAnswer !== typeof true) {
              throw new AppError(
                "Answer must be a boolean for BOOLEAN type",
                "UNMATCH_WITH_QUESTIONTYPE",
                400
              );
            }
            break;
          case "choices":
            if (
              !Array.isArray(payload.correctAnswer) ||
              !payload.correctAnswer.every(
                (ans) => typeof ans === "string" || typeof ans === "number"
              )
            ) {
              throw new AppError(
                "Answer must be an array for CHOICES type",
                "UNMATCH_WITH_QUESTIONTYPE",
                400
              );
            }
            break;
          case "blank":
            if (typeof payload.correctAnswer !== "string") {
              throw new AppError(
                "Answer must be a string for BLANK type",
                "UNMATCH_WITH_QUESTIONTYPE",
                400
              );
            }
            break;
          default:
            throw new AppError("Invalid answer type", "ERROR_ONE", 400);
        }
      }
    }
    const correctAnswer =
      payload.correctAnswer !== undefined
        ? payload.correctAnswer
        : updated.correctAnswer;

    const finalQuestionType = payload.questionType ?? updated.questionType;

    switch (finalQuestionType) {
      case "boolean":
        if (typeof correctAnswer !== typeof true) {
          throw new AppError(
            "Answer must be a boolean for BOOLEAN type",
            "UNMATCH_WITH_QUESTIONTYPE",
            400
          );
        }
        break;
      case "choices":
        if (
          !Array.isArray(correctAnswer) ||
          !correctAnswer.every(
            (ans) => typeof ans === "string" || typeof ans === "number"
          )
        ) {
          throw new AppError(
            "Answer must be an array for CHOICES type",
            "UNMATCH_WITH_QUESTIONTYPE",
            400
          );
        }
        break;
      case "blank":
        if (typeof correctAnswer !== "string") {
          throw new AppError(
            "Answer must be a string for BLANK type",
            "UNMATCH_WITH_QUESTIONTYPE",
            400
          );
        }
        break;
      default:
        throw new AppError("Invalid answer type", "ERROR_ONE", 400);
    }

    updated.title = payload.title || updated.title;
    updated.questionType = payload.questionType || updated.questionType;
    updated.correctAnswer = payload.correctAnswer || updated.correctAnswer;
    updated.score = payload.score || updated.score;

    return await this.questionRepository.save(updated);
  }

  async getAllQuestions() {
    return await this.questionRepository.find();
  }

  async getSingleAnswerByRank(rank: number) {
    return this.questionRepository.findOne({ where: { rank } });
  }

  async getQuestionsById(id: number) {
    const question = await this.questionRepository.findOneBy({ id: id });
    console.log(question);
    if (!question) {
      throw new AppError("ID not found", "INVALID_QUESTION_ID", 404);
    }
    return question;
  }

  async deleteQuestion(rank: number) {
    const findQuestion = await this.questionRepository.findBy({ rank });
    const a = findQuestion.filter((value) => value.rank === rank);
    if (a.length === 0) {
      throw new AppError(
        "Question ID is not found!",
        "INVALID_QUESTION_ID",
        404
      );
    }
    return await this.questionRepository.delete({ rank: rank });
  }
}
