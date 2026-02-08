import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn } from "typeorm";

@Entity("izvestaji_analize")
export class AnalysisReport {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 255 })
  title!: string;

  @Column({ type: "varchar", length: 50 })
  reportType!: string; // 'MONTHLY', 'YEARLY', 'TOP_PRODUCTS', 'TREND', 'TOTAL'

  @Column({ type: "json" })
  data!: any;

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ type: "text", nullable: true })
  description?: string;
}
