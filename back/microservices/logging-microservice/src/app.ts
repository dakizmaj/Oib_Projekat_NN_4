import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import "reflect-metadata";
import { Repository } from "typeorm";

import { initializeDatabase } from "./Database/InitializeConnection";
import { Db } from "./Database/DbConnectionPool";
import { Log } from "./Domain/models/Log";

import { LoggingService } from "./Services/LoggingService";
import { LoggingController } from "./WebAPI/controllers/LoggingController";
import { ILoggingService } from "./Domain/services/ILoggingService";

dotenv.config({ quiet: true });

const app = express();

// Read CORS settings from environment
const corsOrigin = process.env.CORS_ORIGIN ?? "*";
const corsMethods = process.env.CORS_METHODS?.split(",").map(m => m.trim()) ?? ["POST"];

app.use(cors({
    origin: corsOrigin,
    methods: corsMethods
  })
);

app.use(express.json());

initializeDatabase();

const logRepo = Db.getRepository(Log);
const logService: ILoggingService = new LoggingService(logRepo);

const logController = new LoggingController(logService);

app.use("/api/v1", logController.getRouter());

export default app;
