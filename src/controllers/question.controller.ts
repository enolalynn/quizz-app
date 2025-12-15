import { questionRepository } from "../repositories/user.repository";
import { Request, Response } from "express";
import { Question } from "../model/question";
import {
  QuestionService,
  IQestionService,
  QuestionPayload,
  QuestionType,
} from "../service/question.service";
import { AppError } from "../error-codes/app.error";
import { ApiResponse } from "../types/auth.type";
import { isArrayBuffer } from "util/types";
import { DeleteResult } from "typeorm";
export interface IQuestionController {
  createQuestion: (
    req: Request,
    res: Response
  ) => Promise<Response<ApiResponse<Question>>>;

  getAllQuestions: (
    req: Request,
    res: Response
  ) => Promise<Response<ApiResponse<Question[]>>>;
  getQuestionById: (
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
    console.log(payload);
    switch (payload.questionType) {
      case "boolean":
        if (typeof payload.correctAnswer !== typeof true) {
          return res.json({
            messsage: "correctAnswer must be a boolean for BOOLEAN type",
          });
        }
        break;
      case "choices":
        if (
          !Array.isArray(payload.correctAnswer) ||
          !payload.correctAnswer.every(
            (ans) => typeof ans === "string" || typeof ans === "number"
          )
        ) {
          return res.json({
            messsage: "correctAnswer must be an array for CHOICES type",
          });
        }
        break;
      default:
        res.json({
          messsage: "correctAnswer must be a string for BLANK type",
        });
    }

    const question = await this.questionService.createQuestion(payload);
    return res.status(200).json({
      message: "Create success!",
      data: question,
    });
  };

  getAllQuestions = async (req: Request, res: Response) => {
    const questions = await this.questionService.getAllQuestions();
    return res.status(200).json({
      message: "Here..!",
      data: questions,
    });
  };

  getQuestionById = async (req: Request, res: Response) => {
    const qid = req.params.id;
    const questionById = await this.questionService.getQuestionsById(+qid);
    return res.status(200).json({
      message: "Here is your Question",
      data: questionById,
    });
  };

  updateQuestion = async (req: Request, res: Response) => {
    const id = req.params.id;
    const payload: QuestionPayload = req.body;

    const update = await this.questionService.updateQuestion(+id, payload);

    switch (update.questionType) {
      case "boolean":
        if (typeof update.correctAnswer !== typeof true) {
          return res.json({
            messsage: "correctAnswer must be a boolean for BOOLEAN type",
          });
        }
        break;
      case "choices":
        if (
          !Array.isArray(update.correctAnswer) ||
          !update.correctAnswer.every(
            (ans) => typeof ans === "string" || typeof ans === "number"
          )
        ) {
          return res.json({
            messsage: "correctAnswer must be an array for CHOICES type",
          });
        }
        break;
      default:
        res.json({
          messsage: "correctAnswer must be a string for BLANK type",
        });
    }

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
