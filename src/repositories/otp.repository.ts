import { validationResult } from 'express-validator';
import { AppDataSource } from "../config/database";
import { OTP } from "../model/otp";

export const otpRepository = AppDataSource.getRepository(OTP);
