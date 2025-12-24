import { LoggingKind } from "../enums/LoggingKind";

export type LogDTO = {
  id: number;
  kind: LoggingKind;
  date: Date;
  time: Date;
  description: string;
}