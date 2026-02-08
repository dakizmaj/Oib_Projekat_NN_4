import axios from "axios";
import { ILogerService } from "../Domain/Services/ILogerService";

export class LogerService implements ILogerService {
  private readonly loggingServiceUrl: string;

  constructor() {
    this.loggingServiceUrl = process.env.LOGGING_SERVICE_URL || "http://localhost:5002/api/v1";
  }

  async log(message: string, type: "INFO" | "WARNING" | "ERROR" = "INFO"): Promise<void> {
    try {
      await axios.post(`${this.loggingServiceUrl}/logs`, {
        type,
        description: message,
      });
    } catch (error) {
      console.error("\x1b[31m[LogerService]\x1b[0m Failed to send log:", (error as Error).message);
    }
  }
}
