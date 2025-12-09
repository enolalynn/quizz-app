import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "../model/user";
import { Question } from "../model/question";
import { Answer } from "../model/answer";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "admin",
  password: "admin",
  database: "quizz-app",
  synchronize: true,
  logging: false,
  entities: [User, Question, Answer],
  migrations: [],
  subscribers: [],
});
