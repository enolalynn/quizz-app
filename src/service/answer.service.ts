import { DeleteResult, Repository } from "typeorm";
import { Answer, answerType } from "../model/answer";
import { CorrectAnswer, QuestionService } from "./question.service";
import { Question } from "../model/question";
import { AppError } from "../error-codes/app.error";
import { checkQAType } from "../utils/check-q&a-type";

export interface AnswerPayload {
  answerType: answerType;
  answer: CorrectAnswer;
  questionId: number;
}

export interface IAnswerService {
  createAnswerForQuizz: (
    userId: number,
    payload: AnswerPayload
  ) => Promise<Answer>;

  getQuizzForAnswer: (userId: number) => Promise<Question | null>;

  getAllAnswers: () => Promise<Answer[]>;

  getAllAnswersByUserId: (userId: number) => Promise<Answer[] | null>;

  getResultByUserId: (userId: number) => Promise<{
    user: [Answer[], number];
    result: number | null;
  } | null>;

  updateAnswer: (
    userId: number,
    ansId: number,
    payload: AnswerPayload
  ) => Promise<Answer>;

  deleteAnswer: (userId: number, qId: number) => Promise<DeleteResult>;
}

export class AnswerService extends QuestionService implements IAnswerService {
  constructor(
    questionRepository: Repository<Question>,
    private answerRepository: Repository<Answer>
  ) {
    super(questionRepository);
  }

  async createAnswerForQuizz(userId: number, payload: AnswerPayload) {
    const findAnswered = await this.getAllAnswersByUserId(userId);
    const findQID = findAnswered.map((item) => item.question.id);
    const isDuplicate = findQID.includes(payload.questionId);

    if (isDuplicate) {
      throw new AppError(
        "This question is already answered!",
        "DUPLICATE",
        400
      );
    }
    const findQuestion = await this.getQuestionsById(payload.questionId);

    if (!findQuestion) {
      throw new AppError("Question not found!", "ERROR_ONE", 404);
    }
    if (!findQuestion.questionType.includes(payload.answerType)) {
      throw new AppError(
        "Answer type does not match with question type",
        "UNMATCH",
        404
      );
    }

    checkQAType(payload.answerType, payload.answer);

    let score = 0;
    let isCorrect = false;

    if (
      payload.answerType === "choices" &&
      Array.isArray(payload.answer) &&
      Array.isArray(findQuestion.correctAnswer)
    ) {
      isCorrect =
        payload.answer.length === findQuestion.correctAnswer.length &&
        payload.answer.every(
          (value, index) =>
            value === (findQuestion.correctAnswer as (string | number)[])[index]
        );
      if (isCorrect === true) {
        score = findQuestion.score;
      } else {
        score = 0;
      }
    }
    if (findQuestion.correctAnswer === payload.answer) {
      score = findQuestion.score;
      isCorrect = true;
    }
    const answer = this.answerRepository.create({
      question: {
        id: payload.questionId,
      },
      user: {
        id: userId,
      },
      answer: payload.answer,
      answerType: payload.answerType,
      isCorrect: isCorrect,
      score: score,
    });

    return await this.answerRepository.save(answer);
  }

  async getQuizzForAnswer(userId: number) {
    const rank = await this.getCurrentRank(userId);

    const question = await this.getSingleAnswerByRank(Number(rank) + 1);

    if (question === null) {
      throw new AppError(
        "Great job! You completed all questions.",
        "ERROR_ONE",
        400
      );
    }

    return question;
  }

  async getAllAnswers() {
    return this.answerRepository.find();
  }

  async getAllAnswersByUserId(userId: number) {
    return await this.answerRepository.find({
      where: {
        user: { id: userId },
      },
      order: {
        question: {
          rank: "asc",
        },
      },
      relations: {
        question: true,
      },
    });
  }

  async getResultByUserId(userId: number) {
    const userAnswered = await this.answerRepository.findAndCount({
      where: {
        user: { id: userId },
      },
      order: {
        question: {
          rank: "asc",
        },
      },
      relations: {
        question: true,
      },
    });

    const totalScore = await this.answerRepository.sum("score", {
      user: { id: userId },
    });

    const finalResult = {
      user: userAnswered,
      result: totalScore,
    };

    return finalResult;
  }

  async getCurrentRank(userId: number) {
    return await this.answerRepository
      .findOne({
        where: {
          user: { id: userId },
        },
        order: {
          question: {
            rank: "desc",
          },
        },
        relations: {
          question: true,
        },
      })
      .then((data) => data?.question.rank || 0);
  }

  async updateAnswer(userId: number, ansId: number, payload: AnswerPayload) {
    //for some condition => if user want to change existing question  => need answerType in payload
    //else only want to update existing answer => answerType would be optional

    const check = await this.answerRepository.findOne({
      where: { id: ansId, user: { id: userId } },
      relations: {
        question: true,
      },
    });

    if (!check) {
      throw new AppError(
        "User did not answer for that question!",
        "NOT_FOUND",
        404
      );
    }

    let targetQuestion = check.question;

    const questionChanged = check.question.id !== payload.questionId;
    if (questionChanged) {
      if (!payload.answerType) {
        throw new AppError(
          "Require answerType for changing question!",
          "UNMATCH",
          404
        );
      }

      const findQuestion = await this.getQuestionsById(payload.questionId);
      targetQuestion = findQuestion;
      const invalidAnswerType =
        findQuestion.questionType.toString() !== payload.answerType.toString();

      if (invalidAnswerType) {
        throw new AppError(
          "Answer type does not match with changed question!",
          "UNMATCH",
          404
        );
      }
    }

    const answerType = payload.answerType || check.answerType;
    checkQAType(answerType, payload.answer);

    let score = 0;
    let isCorrect = false;

    if (
      (check.answerType || payload.answerType) === "choices" &&
      Array.isArray(payload.answer) &&
      Array.isArray(targetQuestion.correctAnswer)
    ) {
      isCorrect =
        payload.answer.length === targetQuestion.correctAnswer.length &&
        payload.answer.every(
          (value, index) =>
            value ===
            (targetQuestion.correctAnswer as (string | number)[])[index]
        );
      if (isCorrect === true) {
        score = targetQuestion.score;
      } else {
        score = 0;
      }
    }

    if (targetQuestion.correctAnswer === payload.answer) {
      score = targetQuestion.score;
      isCorrect = true;
    }

    const updated = await this.answerRepository.preload({
      id: ansId || check.id,
      answer: payload.answer || check.answer,
      answerType: payload.answerType || check.answerType,
      question: { id: payload.questionId || check.question.id },
      score: score,
      isCorrect: isCorrect,
    });

    if (!updated) {
      throw new AppError("Answer not found", "ERROR_ONE", 404);
    }

    return await this.answerRepository.save(updated);
  }

  async deleteAnswer(userId: number, ansId: number) {
    const findAnswer = await this.getAllAnswersByUserId(userId);
    const a = findAnswer.filter((value) => value.id === ansId);
    console.log("a : ", a);
    if (a.length === 0) {
      throw new AppError("Question ID is not found!", "NOT_FOUND", 404);
    }

    const deleteAnswer = await this.answerRepository.delete({
      user: { id: userId },
      id: ansId,
    });

    return deleteAnswer;
  }
}
