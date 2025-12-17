import { DeleteResult, Repository } from "typeorm";
import { Answer, answerType } from "../model/answer";
import { CorrectAnswer, QuestionService } from "./question.service";
import { Question } from "../model/question";
import { AppError } from "../error-codes/app.error";

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
        "UNMATCH_WITH_QUESTIONTYPE",
        404
      );
    }
    switch (payload.answerType) {
      case "boolean":
        if (typeof payload.answer !== typeof true) {
          throw new AppError(
            "Answer must be a boolean for BOOLEAN type",
            "UNMATCH_WITH_QUESTIONTYPE",
            400
          );
        }
        break;
      case "choices":
        if (
          !Array.isArray(payload.answer) ||
          !payload.answer.every(
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
        if (typeof payload.answer !== "string") {
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
    console.log(answer);
    return await this.answerRepository.save(answer);
  }

  async getQuizzForAnswer(userId: number) {
    const rank = await this.getCurrentRank(userId);

    const question = await this.getSingleAnswerByRank(Number(rank) + 1);

    if (question === null) {
      throw new AppError(
        "Great job finishing all questions!",
        "ERROR_ONE",
        400
      );
    }

    // const findId = question.map((item) => item.id);
    // console.log(findId.sort());

    // //SHOWING TOTAL SCORE WOULD BE BETTER (COMING SOON....!)
    // if (answered.length === question.length) {
    //   throw new AppError(
    //     "Great job finishing all questions!",
    //     "ERROR_ONE",
    //     400
    //   );
    // }
    // if (answered.length > 0) {
    //   return await this.getQuestionsById(answered.length + 1);
    // }
    return question; //need to fix array type later
  }

  async getAllAnswers() {
    return this.answerRepository.find();
  }

  async getAllAnswersByUserId(userId: number) {
    console.log("id : ", userId);
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
    //if user want to change existing question  => answerType need in payload
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
        "USER_NOT_FOUND",
        404
      );
    }
    console.log("q id : ", payload.questionId);
    console.log(payload.answerType);

    let targetQuestion = check.question;

    const questionChanged = check.question.id !== payload.questionId;
    if (questionChanged) {
      if (!payload.answerType) {
        throw new AppError(
          "Require answerType for changing question!",
          "UNMATCH_WITH_QUESTIONTYPE",
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
          "UNMATCH_WITH_QUESTIONTYPE",
          404
        );
      }
    }

    const answerType = payload.answerType || check.answerType;

    switch (answerType) {
      case "boolean":
        if (typeof payload.answer !== typeof true) {
          throw new AppError(
            "Answer must be a boolean for BOOLEAN type",
            "UNMATCH_WITH_QUESTIONTYPE",
            400
          );
        }
        break;
      case "choices":
        if (
          !Array.isArray(payload.answer) ||
          !payload.answer.every(
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
        if (typeof payload.answer !== "string") {
          throw new AppError(
            "Answer must be a string for BLANK type",
            "UNMATCH_WITH_QUESTIONTYPE",
            400
          );
        }
        break;
      default:
        throw new AppError("Invalid", "ERROR_ONE", 400);
    }

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
      throw new AppError(
        "Question ID is not found!",
        "INVALID_QUESTION_ID",
        404
      );
    }
    const deleteAnswer = await this.answerRepository.delete({
      user: { id: userId },
      id: ansId,
    });
    return deleteAnswer;
  }
}
