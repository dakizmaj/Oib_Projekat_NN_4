import { ResultAsync } from "neverthrow";
import { LoggingError } from "../enums/LoggingError";
import { LogDTO } from "../DTOs/LogDTO"
import { LoggingKind } from "../enums/LoggingKind";

export type LogFilterParams = {
  kinds?: LoggingKind[],
  dateStart?: Date,
  dateEnd?: Date,
  timeStart?: Date,
  timeEnd?: Date,
  descContains?: string,
  descLike?: string
}

export interface ILoggingService {
  store(log: LogDTO): Promise<ResultAsync<undefined, LoggingError>>;
  read(logId: number): Promise<ResultAsync<LogDTO, LoggingError>>;
  getAll(): Promise<ResultAsync<LogDTO[], LoggingError>>;
  update(log: LogDTO): Promise<ResultAsync<LogDTO, LoggingError>>;
  delete(logId: number): Promise<ResultAsync<undefined, LoggingError>>;
  // find(): Promise<ResultAsync<LogDTO, LoggingError>>;
  filter(params: LogFilterParams): Promise<ResultAsync<LogDTO[], LoggingError>>;
}