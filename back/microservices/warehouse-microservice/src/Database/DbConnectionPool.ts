import "reflect-metadata";
import dotenv from "dotenv";
import { DataSource } from "typeorm";
import { Warehouse } from "../Domain/models/Warehouse";

dotenv.config();

export const DATABASE_DATASOURCE = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false },
  synchronize: true,
  logging: false,
  entities: [Warehouse],
});
