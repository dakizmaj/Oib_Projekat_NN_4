import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";
import { Plant } from "../Domain/models/Plant";
import { Perfume } from "../Domain/models/Perfume";
import { Packaging } from "../Domain/models/Packaging";
import { Storage } from "../Domain/models/Storage";
import { Receipt } from "../Domain/models/Receipt";

dotenv.config();

export const Db = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false },
  synchronize: true,
  logging: false,
  entities: [Plant, Perfume, Packaging, Storage, Receipt],
});
