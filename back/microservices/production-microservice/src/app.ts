import express from 'express';
import cors from 'cors';
import "reflect-metadata";
import { initialize_database } from './Database/InitializeConnection';
import dotenv from 'dotenv';
import { Db } from './Database/DbConnectionPool';
import { Repository } from 'typeorm';
import { Plant } from './Domain/models/Plant';
import { Perfume } from './Domain/models/Perfume';
import { Packaging } from './Domain/models/Packaging';
import { Storage } from './Domain/models/Storage';
import { Receipt } from './Domain/models/Receipt';
import { ProductionService } from './Services/ProductionService';
import { ProductionController } from './WebAPI/controllers/ProductionController';
import { LogerService } from './Services/LogerService';

dotenv.config({ quiet: true });

const app = express();

const corsOrigin = process.env.CORS_ORIGIN ?? "*";
const corsMethods = process.env.CORS_METHODS?.split(",").map(m => m.trim()) ?? ["GET","POST","PUT","DELETE"];

app.use(cors({ origin: corsOrigin, methods: corsMethods }));
app.use(express.json());

initialize_database();

const plantRepository: Repository<Plant> = Db.getRepository(Plant);
const perfumeRepository: Repository<Perfume> = Db.getRepository(Perfume);
const packagingRepository: Repository<Packaging> = Db.getRepository(Packaging);
const storageRepository: Repository<Storage> = Db.getRepository(Storage);
const receiptRepository: Repository<Receipt> = Db.getRepository(Receipt);

const productionService = new ProductionService(plantRepository, perfumeRepository, packagingRepository, storageRepository, receiptRepository);
const logerService = new LogerService();

const productionController = new ProductionController(productionService, logerService);

app.use('/api/v1', productionController.getRouter());

export default app;
