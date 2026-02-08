import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { SalesService } from './Services/SalesService';
import { SalesController } from './WebAPI/Controllers/SalesController';

dotenv.config({ quiet: true });

const app = express();

const corsOrigin = process.env.CORS_ORIGIN ?? "*";
const corsMethods = process.env.CORS_METHODS?.split(",").map(m => m.trim()) ?? ["GET", "POST", "PUT", "DELETE"];

app.use(cors({ origin: corsOrigin, methods: corsMethods }));
app.use(express.json());

// Initialize sales service (no database needed - uses other mikroservices)
const salesService = new SalesService();
const salesController = new SalesController(salesService);

app.use('/api/v1', salesController.getRouter());

console.log('🚀 Sales microservice initialized');
console.log('📦 Using Processing, Warehouse, Analysis, and Logging mikroservices');

export default app;