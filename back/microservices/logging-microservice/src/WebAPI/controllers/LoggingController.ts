import { Request, Response, Router } from 'express';
import { ILoggingService } from '../../Domain/services/ILoggingService';
import { Log } from '../../Domain/models/Log';

export class LoggingController {
  private router: Router;
  private loggingService: ILoggingService;
  
  constructor(loggingService: ILoggingService) {
    this.router = Router();
    this.loggingService = loggingService;
    this.initializeRoutes();
  }
  
  public getRouter(): Router { return this.router; }
  
  
  
  private initializeRoutes() {
    // this.router.post("/logging/store");
  }
}