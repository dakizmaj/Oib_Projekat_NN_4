import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { initialize_database } from './Database/InitializeConnection';
import { Repository } from 'typeorm';
import { Perfume } from './Domain/models/Perfume';
import { SalesService } from './Services/SalesService';
import { SalesController } from './WebAPI/Controllers/SalesController';
import { Db } from './Database/DbConnectionPool';
import { LogerService } from './Services/LogerService';

dotenv.config({quiet: true});

const app = express();

const corsOrigin = process.env.CORS_ORIGIN ?? "*";
const corsMethods = process.env.CORS_METHODS?.split(",").map(m => m.trim()) ?? ["GET", "POST", "PUT", "DELETE"];

app.use(cors({origin: corsOrigin, methods: corsMethods}));
app.use(express.json());

initialize_database();

const perfumeRepository: Repository<Perfume> = Db.getRepository(Perfume);

const logerService = new LogerService();
const salesService = new SalesService(perfumeRepository, logerService);

const salesController = new SalesController(salesService);

app.use('/api/v1', salesController.getRouter());

export default app;