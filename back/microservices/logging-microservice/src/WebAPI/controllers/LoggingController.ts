import { Request, Response, Router } from 'express';
import { ILoggingService, LogFilterParams } from '../../Domain/services/ILoggingService';
import { LogDTO } from '../../Domain/DTOs/LogDTO';

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
    this.router.post("/logging/store", this.store.bind(this));
    this.router.post("/logging/read", this.read.bind(this)); // params in request body; POST method is needed
    this.router.post("/logging/update", this.update.bind(this));
    this.router.post("/logging/delete", this.delete.bind(this));
    this.router.post("/logging/filter", this.filter.bind(this));
  }
  
  
  
  private async store(request: Request, response: Response) {
    if (request.body.log == null){
      response.status(400).json({ errMsg: "Bad body request", bodyRequest: request });
      return;
    }
    
    const log: LogDTO = request.body.log;
    const result = this.loggingService.store(log);
    
    (await result).match(
      (_) => { response.status(200).json({msg: "Log stored"}) },
      (err) => { response.status(400).json({errMsg: "Error occured", errType: err}) }
    )
  }
  
  
  
  private async read(request: Request, response: Response) {
    if (request.body.logId == null) {
      response.status(400).json({ errMsg: "Bad body request", bodyRequest: request });
      return;
    }
    
    const logId: number = request.body.logId;
    const result = this.loggingService.read(logId);
    
    (await result).match(
      (log) => { response.status(200).json({returned: log}) },
      (err) => { response.status(400).json({errMsg: "Error occured", errType: err}) }
    )
  }
  
  
  
  private async update(request: Request, response: Response) {
    if (request.body.log == null) {
      response.status(400).json({ errMsg: "Bad body request", bodyRequest: request });
      return;
    }
    
    const log: LogDTO = request.body.log;
    const result = this.loggingService.update(log);
    
    (await result).match(
      (log) => { response.status(200).json({returned: log}) },
      (err) => { response.status(400).json({errMsg: "Error occured", errType: err}) }
    )
  }
  
  
  
  private async delete(request: Request, response: Response) {
    if (request.body.logId == null) {
      response.status(400).json({ errMsg: "Bad body request", bodyRequest: request });
      return;
    }
    
    const logId: number = request.body.logId;
    const result = this.loggingService.delete(logId);
    
    (await result).match(
      (_) => { response.status(200).json({msg: `Log #${logId} deleted`}) },
      (err) => { response.status(400).json({errMsg: "Error occured", errType: err}) }
    )
  }
  
  
  
  private async filter(request: Request, response: Response) {
    if (request.body.params == null) {
      response.status(400).json({ errMsg: "Bad body request", bodyRequest: request });
      return;
    }
    
    const params: LogFilterParams = request.body.logId;
    const result = this.loggingService.filter(params);
    
    (await result).match(
      (logs) => { response.status(200).json({returned: logs}) },
      (err) => { response.status(400).json({errMsg: "Error occured", errType: err}) }
    )
  }
}
