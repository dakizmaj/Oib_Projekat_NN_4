import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { PerfumeType } from "../enums/PerfumeType";

@Entity("perfumes")
export class Perfume {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 255, nullable: false })
  name!: string;

  @Column({ 
    type: "varchar", 
    length: 50,
    nullable: false 
  })
  type!: PerfumeType;

  @Column({ type: "int", nullable: false })
  netVolume!: number; // 150ml ili 250ml

  @Column({ type: "varchar", length: 50, nullable: true, unique: true })
  serialNumber!: string; // PP-2025-{ID}

  @Column({ type: "int", nullable: false })
  plantId!: number; // ID biljke od koje je napravljen

  @Column({ type: "date", nullable: false })
  expirationDate!: Date;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt!: Date;
}
