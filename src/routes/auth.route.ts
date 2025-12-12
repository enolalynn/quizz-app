import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { OtpController } from "../controllers/otp.controller";

import { adminAuthenticate, authenticate, authorize } from "../middleware/auth";
import { createUserValidator } from "../validators/auth.validator";
import { QuestionController } from "../controllers/question.controller";
const authRouter = Router();

const authController = new AuthController();
const otpController = new OtpController();
const questionController = new QuestionController();

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

authRouter.post("/question", questionController.createQuestion);
authRouter.get("/questions", questionController.getAllQuestions);
authRouter.put("/edit-question/:id", questionController.updateQuestion);
authRouter.delete("/question/:id", questionController.deleteQuestion);

export default authRouter;
