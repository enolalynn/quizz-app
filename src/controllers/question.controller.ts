import { questionRepository } from "../repositories/user.repository";
import { Request, Response } from "express";
import { Question } from "../model/question";
import {
  QuestionService,
  IQestionService,
  QuestionPayload,
  QuestionType,
} from "../service/question.service";
import { ApiResponse } from "../types/auth.type";
import { DeleteResult } from "typeorm";
import { AppError } from "../error-codes/app.error";

export interface IQuestionController {
  createQuestion: (
    req: Request,
    res: Response
  ) => Promise<Response<ApiResponse<Question>>>;

  getAllQuestions: (
    req: Request,
    res: Response
  ) => Promise<Response<ApiResponse<Question[]>>>;
  getQuestionsById: (
    req: Request,
    res: Response
  ) => Promise<Response<ApiResponse<Question[]>>>;

  updateQuestion: (
    req: Request,
    res: Response
  ) => Promise<Response<ApiResponse<Question>>>;

  deleteQuestion: (
    req: Request,
    res: Response
  ) => Promise<Response<ApiResponse<DeleteResult>>>;
}
export class QuestionController implements IQuestionController {
  private questionService: IQestionService;
  constructor() {
    this.questionService = new QuestionService(questionRepository);
  }

  createQuestion = async (req: Request, res: Response) => {
    const payload: QuestionPayload = req.body;

    const question = await this.questionService.createQuestion(payload);
    return res.status(200).json({
      message: "Create success!",
      data: question,
    });
  };

  getAllQuestions = async (req: Request, res: Response) => {
    const questions = await this.questionService.getAllQuestions();
    return res.status(200).json({
      message: `All Questions (Total - ${questions.length})`,
      data: questions,
    });
  };

  getQuestionsById = async (req: Request, res: Response) => {
    const id = req.params.id;
    const questionById = await this.questionService.getQuestionsById(+id);
    return res.status(200).json({
      message: `Get Question Rank ${questionById.rank} by question ID`,
      data: questionById,
    });
  };

  updateQuestion = async (req: Request, res: Response) => {
    const rank = req.params.id;
    const payload: QuestionPayload = req.body;

    const update = await this.questionService.updateQuestion(+rank, payload);
    return res.status(200).json({
      message: "Update success!",
      data: update,
    });
  };

  deleteQuestion = async (req: Request, res: Response) => {
    const id = +req.params.id;
    const remove = await this.questionService.deleteQuestion(id);
    return res.status(200).json({
      message: "Delete success!",
      data: remove,
    });
  };
}
