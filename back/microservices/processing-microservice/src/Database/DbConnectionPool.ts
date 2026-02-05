import { DataSource } from "typeorm";
import { Perfume } from "../Domain/models/Perfume";
import dotenv from "dotenv";

dotenv.config({ quiet: true });

export const Db = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "3306"),
  username: process.env.DB_USERNAME || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_DATABASE || "database_prerada",
  synchronize: true,
  logging: false,
  entities: [Perfume],
  subscribers: [],
  migrations: [],
});
