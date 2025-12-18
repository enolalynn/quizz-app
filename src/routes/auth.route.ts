import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { OtpController } from "../controllers/otp.controller";

import { adminAuthenticate, authenticate, authorize } from "../middleware/auth";
import { createUserValidator } from "../validators/auth.validator";
import { QuestionController } from "../controllers/question.controller";
import { AnswerController } from "../controllers/answer.controller";
const authRouter = Router();

const authController = new AuthController();
const otpController = new OtpController();
const questionController = new QuestionController();
const answerController = new AnswerController();

authRouter.post("/login", authController.login);
authRouter.get(
  "/profile",
  authenticate,
  authorize([""]),
  authController.profile
);
authRouter.post("/register", createUserValidator, authController.register);
authRouter.post("/forgotPassword", otpController.createOTP);
authRouter.put("/resetpassword", otpController.resetpassword); // email,otp,newpassword otp-> find => otp.isUsed === false -> password change -> otp update isUsed = true

authRouter.put("/update-password", authController.changePassword);

//admin

authRouter.post("/admin-register", authController.adminRegister);
authRouter.post("/admin-login", authController.adminLogin);
authRouter.get(
  "/admin-profile",
  adminAuthenticate,
  authController.adminValidate
);

//QUESTION
authRouter.post("/question", questionController.createQuestion);
authRouter.get("/questions", questionController.getAllQuestions);
authRouter.get("/question/:id", questionController.getQuestionsById);
authRouter.put("/edit-question-byrank/:id", questionController.updateQuestion);
authRouter.delete("/question/:id", questionController.deleteQuestion);

//ANSWER
// authRouter.post("/answer", authenticate, answerController.createAnswer);
authRouter.get("/answers", answerController.getAllAnswers);
authRouter.get("/answers-by-user/:id", answerController.getAllAnswersByUserId);
authRouter.get("/result", authenticate, answerController.getResultByUserId);
authRouter.put("/answer/:id", authenticate, answerController.updateAnswer);
authRouter.delete("/answer/:id", authenticate, answerController.deleteAnswer);

authRouter.get("/quizz", authenticate, answerController.getQuizzForAnswer);
authRouter.post(
  "/quizz/answer",
  authenticate,
  answerController.createAnswerForQuizz
);

export default authRouter;
