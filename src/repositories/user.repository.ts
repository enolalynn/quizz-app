import { validationResult } from "express-validator";
import { AppDataSource } from "../config/database";
import { User } from "../model/user";
import { Admin } from "../model/admin";

export const userRepository = AppDataSource.getRepository(User);
export const adminRepository = AppDataSource.getRepository(Admin);
