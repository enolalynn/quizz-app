import { Answer } from "../model/answer";
import { Request, Response } from "express";
import { ApiResponse } from "../types/auth.type";
import {
  AnswerPayload,
  AnswerService,
  IAnswerService,
} from "../service/answer.service";
import {
  answerRepository,
  questionRepository,
} from "../repositories/user.repository";
import { DeleteResult } from "typeorm";

export interface IAnswerController {
  createAnswer: (
    req: Request,
    res: Response
  ) => Promise<Response<ApiResponse<Answer>>>;

  getAllAnswers: (
    req: Request,
    res: Response
  ) => Promise<Response<ApiResponse<Answer[]>>>;

  getAllAnswersByUserId: (
    req: Request,
    res: Response
  ) => Promise<Response<ApiResponse<Answer[] | null>>>;

  updateAnswer: (
    req: Request,
    res: Response
  ) => Promise<Response<ApiResponse<Answer>>>;

  deleteAnswer: (
    req: Request,
    res: Response
  ) => Promise<Response<ApiResponse<DeleteResult>>>;
}
export class AnswerController implements IAnswerController {
  private answerService: IAnswerService;
  constructor() {
    this.answerService = new AnswerService(
      questionRepository,
      answerRepository
    );
  }

  createAnswer = async (req: Request, res: Response) => {
    const userId = req.user?.id!;
    const payload: AnswerPayload = req.body;
    const answer = await this.answerService.createAnswer(userId, payload);
    return res.status(200).json({
      message: "Create answer successfully!",
      data: answer,
    });
  };

  getAllAnswers = async (req: Request, res: Response) => {
    const answers = await this.answerService.getAllAnswers();
    return res.status(200).json({
      message: "All answers!",
      data: answers,
    });
  };

  getAllAnswersByUserId = async (req: Request, res: Response) => {
    const userId = +req.params.id;
    console.log("userId: ", userId);
    const answers = await this.answerService.getAllAnswersByUserId(userId);
    return res.status(200).json({
      message: `All answers by user!`,
      data: answers,
    });
  };
  updateAnswer = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const ansId = +req.params.id;
    const payload: AnswerPayload = req.body;
    const updateAns = await this.answerService.updateAnswer(
      userId!,
      ansId,
      payload
    );
    return res.status(200).json({
      message: `Answer updated successfully !`,
      data: updateAns,
    });
  };

  deleteAnswer = async (req: Request, res: Response) => {
    const ansId = +req.params.id;
    const userId = req.user?.id;
    const deleteAns = await this.answerService.deleteAnswer(userId!, ansId);
    return res.status(200).json({
      message: `Deleted !`,
      data: deleteAns,
    });
  };
}
