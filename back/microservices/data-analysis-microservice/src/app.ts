import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import "reflect-metadata";

import { initialize_database } from "./Database/InitializeConnection";
import { Db } from "./Database/DbConnectionPool";
import { Receipt } from "./Domain/Models/Receipt";

import { DataAnalysisService } from "./Services/DataAnalysisService";
import { DataAnalysisController } from "./WebAPI/Controllers/DataAnalysisController";
import { LogerService } from "./Services/LogerService";

dotenv.config({ quiet: true });

const app = express();

// Read CORS settings from environment
const corsOrigin = process.env.CORS_ORIGIN ?? "*";
const corsMethods = process.env.CORS_METHODS?.split(",").map(m => m.trim()) ?? ["GET", "POST"];

app.use(cors({
    origin: corsOrigin,
    methods: corsMethods
  })
);

app.use(express.json());

initialize_database();

const receiptRepo = Db.getRepository(Receipt);
const logerService = new LogerService();
const dataAnalysisService = new DataAnalysisService(receiptRepo, logerService);

const controller = new DataAnalysisController(dataAnalysisService);

app.use("/api/v1", controller.getRouter());

console.log("🚀 Data Analysis microservice initialized");

export default app;