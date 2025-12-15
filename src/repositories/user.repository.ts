import { AppDataSource } from "../config/database";
import { User } from "../model/user";
import { Admin } from "../model/admin";
import { Question } from "../model/question";
import { Answer } from "../model/answer";

export const userRepository = AppDataSource.getRepository(User);
export const adminRepository = AppDataSource.getRepository(Admin);
export const questionRepository = AppDataSource.getRepository(Question);
export const answerRepository = AppDataSource.getRepository(Answer);
