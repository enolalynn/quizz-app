import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "../model/user";
import { Question } from "../model/question";
import { Answer } from "../model/answer";
import { OTP } from "../model/otp";
import "dotenv/config";
import { Admin } from "../model/admin";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: Number(process.env.DATABASE_PORT) || 5432,
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  synchronize: true,
  logging: false,
  entities: [User, Question, Answer, OTP, Admin],
  migrations: [],
  subscribers: [],
});
