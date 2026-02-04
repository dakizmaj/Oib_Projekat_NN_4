import { DataSource } from "typeorm";
import { Plant } from "../Domain/models/Plant";
import dotenv from "dotenv";

dotenv.config({ quiet: true });

export const Db = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "3306"),
  username: process.env.DB_USERNAME || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_DATABASE || "database_proizvodnja",
  synchronize: true, // Auto-create tables (samo za development!)
  logging: false,
  entities: [Plant],
  subscribers: [],
  migrations: [],
});
