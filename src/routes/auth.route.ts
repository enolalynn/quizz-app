import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { createUserValidator } from "../validators/auth.validator";
const authRouter = Router();

const authController = new AuthController();

authRouter.post("/login", authController.login);
authRouter.post("/register", createUserValidator, authController.register);

export default authRouter;
