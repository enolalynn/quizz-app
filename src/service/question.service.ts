import { DeleteResult, InsertResult, Repository, UpdateResult } from "typeorm";
import { Question } from "../model/question";
import { AppError } from "../error-codes/app.error";
import { checkQAType } from "../utils/check-q&a-type";

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
    checkQAType(payload.questionType, payload.correctAnswer);

    const question = this.questionRepository.create(payload);

    return await this.questionRepository.save(question);
  }

  async updateQuestion(rank: number, payload: QuestionPayload) {
    const updated = await this.questionRepository.findOneBy({
      rank: rank,
    });
    console.log(updated);
    if (!updated) {
      throw new AppError("Question is not found", "NOT_FOUND", 404);
    }

    if (payload.questionType !== undefined) {
      if (payload.correctAnswer === undefined) {
        throw new AppError(
          "Require correctAnswer for changing question!",
          "UNMATCH",
          404
        );
      } else {
        checkQAType(payload.questionType, payload.correctAnswer);
      }
    }

    const correctAnswer =
      payload.correctAnswer !== undefined
        ? payload.correctAnswer
        : updated.correctAnswer;

    const finalQuestionType = payload.questionType ?? updated.questionType;
    checkQAType(finalQuestionType, correctAnswer);

    updated.title = payload.title || updated.title;
    updated.questionType = payload.questionType || updated.questionType;
    updated.correctAnswer = payload.correctAnswer || updated.correctAnswer;
    updated.score = payload.score || updated.score;
    updated.rank = payload.rank || updated.rank;

    return await this.questionRepository.save(updated);
  }

  async getAllQuestions() {
    return await this.questionRepository.find({
      order: {
        rank: "ASC",
      },
    });
  }

  async getSingleAnswerByRank(rank: number) {
    return this.questionRepository.findOne({ where: { rank } });
  }

  async getQuestionsById(id: number) {
    const question = await this.questionRepository.findOneBy({ id: id });
    console.log(question);
    if (!question) {
      throw new AppError("ID not found", "NOT_FOUND", 404);
    }
    return question;
  }

  async deleteQuestion(rank: number) {
    const findQuestion = await this.questionRepository.findBy({ rank });
    const a = findQuestion.filter((value) => value.rank === rank);
    if (a.length === 0) {
      throw new AppError("Question ID is not found!", "NOT_FOUND", 404);
    }
    return await this.questionRepository.delete({ rank: rank });
  }
}
