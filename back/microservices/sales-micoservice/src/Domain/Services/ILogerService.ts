export interface ILogerService {
  log(message: string, type?: "INFO" | "WARNING" | "ERROR"): Promise<void>;
}
