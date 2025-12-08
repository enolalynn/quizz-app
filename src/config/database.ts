import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "../model/user";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5433,
  username: "postgres",
  password: "admin",
  database: "ts-project",
  synchronize: true,
  logging: false,
  entities: [User],
  migrations: [],
  subscribers: [],
});
