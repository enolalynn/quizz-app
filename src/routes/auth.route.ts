import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { OtpController } from "../controllers/otp.controller";

import { adminAuthenticate, authenticate, authorize } from "../middleware/auth";
import { createUserValidator } from "../validators/auth.validator";
const authRouter = Router();

const authController = new AuthController();
const otpController = new OtpController();

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

export default authRouter;
