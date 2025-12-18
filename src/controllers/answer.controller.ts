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
import { DeleteResult, Repository } from "typeorm";
import { Question } from "../model/question";

export interface IAnswerController {
  createAnswerForQuizz: (
    req: Request,
    res: Response
  ) => Promise<Response<ApiResponse<Answer>>>;

  getQuizzForAnswer: (
    req: Request,
    res: Response
  ) => Promise<Response<ApiResponse<Question>>>;

  getAllAnswers: (
    req: Request,
    res: Response
  ) => Promise<Response<ApiResponse<Answer[]>>>;

  getAllAnswersByUserId: (
    req: Request,
    res: Response
  ) => Promise<Response<ApiResponse<Answer[] | null>>>;

  getResultByUserId: (
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

  createAnswerForQuizz = async (req: Request, res: Response) => {
    const userId = req.user?.id!;
    const payload: AnswerPayload = req.body;
    const answer = await this.answerService.createAnswerForQuizz(
      userId,
      payload
    );
    console.log(answer);
    return res.status(200).json({
      message: `Create answer for question id: ${answer.question.id} !`,
      data: answer,
    });
  };

  getQuizzForAnswer = async (req: Request, res: Response) => {
    const userId = req.user?.id!;

    const showQuestion = await this.answerService.getQuizzForAnswer(userId);
    return res.status(200).json({
      message: "Next question....",
      data: showQuestion,
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

    const answers = await this.answerService.getAllAnswersByUserId(userId);

    if (answers?.length === 0) {
      return res.status(200).json({
        message: `No answer from user id: ${userId}!`,
        data: answers,
      });
    }
    return res.status(200).json({
      message: `User id: ${userId} has completed ${answers?.length} ${
        answers?.length === 1 ? "question" : "questions"
      }!`,
      data: answers,
    });
  };

  getResultByUserId = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const result = await this.answerService.getResultByUserId(userId!);
    if (result?.user[0].length === 0) {
      return res.status(200).json({
        message: `User id: ${userId} hasn't completed any questions yet!`,
        data: null,
      });
    }

    const user = result?.user[0];
    const MaximumMarks = result?.user[1];
    const score = result?.result;

    let achieve: number = 0;
    if (MaximumMarks && score !== undefined) {
      achieve = (score ? score / MaximumMarks : 0) * 100;
    }

    return res.status(200).json({
      message: `User id: ${userId} has completed ${user?.length} ${
        user?.length === 1 ? "question" : "questions"
      }!`,
      data: {
        maximumMarks: MaximumMarks,
        score: score,
        achievement: `${achieve} %`,
        answered: user,
      },
    });
  };

  updateAnswer = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const ansId = +req.params.id;
    const payload: AnswerPayload = req.body;
    console.log("user : ", userId, "ansId: ", ansId, "pl : ", payload);

    if (payload.questionId === undefined) {
      return res.status(404).json({
        message: `Missing question Id!`,
        data: null,
      });
    }
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
