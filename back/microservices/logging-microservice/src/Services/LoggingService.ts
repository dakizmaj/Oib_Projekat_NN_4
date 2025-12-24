import { In, Repository } from "typeorm";
import { errAsync, okAsync, ResultAsync } from "neverthrow";
import { ILoggingService, LogFilterParams } from "../Domain/services/ILoggingService";
import { Log } from "../Domain/models/Log";
import { LoggingError } from "../Domain/enums/LoggingError";
import { LogDTO } from "../Domain/DTOs/LogDTO";
import { LoggingKind } from "../Domain/enums/LoggingKind";



export class LoggingService implements ILoggingService {
  constructor(private loggingRepo: Repository<Log>) { }
  
  
  
  async store(log: LogDTO): Promise<ResultAsync<undefined, LoggingError>> {
    const newLog = this.loggingRepo.create({
      kind: log.kind,
      date: log.date,
      time: log.time,
      description: log.description
    });
    
    if (!newLog)
      return errAsync(LoggingError.UNKNOWN);
      
    const _savedLog = this.loggingRepo.save(newLog);
    const savedLog = await _savedLog;
    
    if (!savedLog)
      return errAsync(LoggingError.UNKNOWN);
    
    return okAsync(undefined);
  }
  
  
  
  async read(logId: number): Promise<ResultAsync<LogDTO, LoggingError>> {
    const log = await this.loggingRepo.findOne({ where: { id: logId } });
    if (!log)
      return errAsync(LoggingError.NONEXISTENT);
    
    return okAsync(toDTO(log));
  }
  
  
  
  async update(log: LogDTO): Promise<ResultAsync<LogDTO, LoggingError>> {
    const _existing = this.loggingRepo.findOne({
      where: { id: log.id }
    });
    const existing = await _existing;
    
    if (!existing)
      return errAsync(LoggingError.NONEXISTENT);
      
    existing.kind = log.kind;
    existing.date = log.date;
    existing.time = log.time;
    existing.description = log.description;
    
    // Update this shit
    // Warning: .save will create a new one if `existing` doesn't exist :|
    const _updated = this.loggingRepo.save(existing);
    const updated = await _updated;
    
    if (!updated)
      return errAsync(LoggingError.UNKNOWN);
      
    return okAsync(toDTO(updated));
  }
  
  
  
  async delete(logId: number): Promise<ResultAsync<undefined, LoggingError>> {
    const _existing = this.loggingRepo.findOne({
      where: { id: logId }
    });
    const existing = await _existing;
    
    if (!existing)
      return errAsync(LoggingError.NONEXISTENT);
    
    const _deleted = this.loggingRepo.delete(existing);
    const deleted = await _deleted;
    if (!deleted)
      return errAsync(LoggingError.UNKNOWN);
    
    return okAsync(undefined);
  }
  
  
  
  // async find(): Promise<ResultAsync<LogDTO, LoggingError>> {
  //   return errAsync(LoggingError.UNKNOWN);
  // }
  
  
  
  async filter(params: LogFilterParams): Promise<ResultAsync<LogDTO[], LoggingError>> {
    // logical XOR
    const containsOneOrAnother = (a: any, b: any) => (a == null && b != null) || (a != null && b == null);
    if (containsOneOrAnother(params.dateStart, params.dateEnd))
      return errAsync(LoggingError.INVALID_ARGUMENT);
    if (containsOneOrAnother(params.timeStart, params.timeEnd))
      return errAsync(LoggingError.INVALID_ARGUMENT);
    if (containsOneOrAnother(params.descContains, params.descLike))
      return errAsync(LoggingError.INVALID_ARGUMENT);
    
    // Using Query builder for more fine-tuned filtering
    // `.where("1 = 1")` is there for easier chaining
    let query = this.loggingRepo.createQueryBuilder("log").where("1 = 1");
    
    if (params.kinds != null && params.kinds.length > 0)
      query = query.andWhere("log.kind IN :kinds", { kinds: params.kinds });
      
    if (params.dateStart != null && params.dateEnd != null)
      query = query.andWhere("log.date BETWEEN :dateStart AND :dateEnd",
        { dateStart: params.dateStart, dateEnd: params.dateEnd }
      );
    
    if (params.timeStart != null && params.timeEnd != null)
      query = query.andWhere("log.time BETWEEN :timeStart AND :timeEnd",
        { timeStart: params.timeStart, timeEnd: params.timeEnd }
      );
    
    if (params.descContains != null && params.descContains != "")
      query = query.andWhere("log.description LIKE %:descContains%",
        { descContains: params.descContains }
      );
      
    if (params.descLike != null && params.descLike != "")
      query = query.andWhere("log.description LIKE :descLike",
        { descLike: params.descLike }
      );
      
    const result = await query.getMany();
    if (result == null)
      return errAsync(LoggingError.UNKNOWN);
      
    return okAsync(result);
  }
}



function toDTO(log: Log): LogDTO {
  return {
    id: log.id,
    kind: log.kind,
    date: log.date,
    time: log.time,
    description: log.description
    // ...log
  };
}
