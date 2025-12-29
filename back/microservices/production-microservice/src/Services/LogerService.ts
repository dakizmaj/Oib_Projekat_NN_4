import { ILogerService } from "../Domain/services/ILogerService";

export class LogerService implements ILogerService {
  log(msg: string): void {
    console.log(msg);
  }
}
