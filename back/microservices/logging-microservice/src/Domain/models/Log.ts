import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { LoggingKind } from "../enums/LoggingKind";

@Entity("audit_logovi")
export class Log {
  @PrimaryGeneratedColumn()
  id!: number;
  
  @Column({ type: "enum", enum: LoggingKind, default: LoggingKind.LOGKIND_INFO })
  kind!: LoggingKind;
  
  @Column({ type: "date" })
  date!: Date;
  
  @Column({ type: "time" })
  time!: Date;
  
  @Column({ type: "varchar" })
  description!: string;
}