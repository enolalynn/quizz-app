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
    const question = this.questionRepository.create(payload);
    return await this.questionRepository.save(question);
  }

  async updateQuestion(id: number, payload: QuestionPayload) {
    const findId = await this.questionRepository.findOneBy({ id: id });
    console.log(findId);
    if (!findId) {
      throw new AppError("ID not found", "INVALID_QUESTION_ID", 404);
    }
    const updQuestion = await this.questionRepository.findOneOrFail({
      where: { id: id },
    });
    (updQuestion.title = payload.title || updQuestion.title),
      (updQuestion.questionType =
        payload.questionType || updQuestion.questionType),
      (updQuestion.correctAnswer =
        payload.correctAnswer || updQuestion.correctAnswer),
      (updQuestion.score = payload.score || updQuestion.score);
    return await this.questionRepository.save(updQuestion);
  }

  async getAllQuestions() {
    return await this.questionRepository.find();
  }

  async getQuestionsById(id: number) {
    const findId = await this.questionRepository.findOneBy({ id: id });
    console.log(findId);
    if (!findId) {
      throw new AppError("ID not found", "INVALID_QUESTION_ID", 404);
    }
    return findId;
  }

  async deleteQuestion(id: number) {
    return await this.questionRepository.delete({ id: id });
  }
}
