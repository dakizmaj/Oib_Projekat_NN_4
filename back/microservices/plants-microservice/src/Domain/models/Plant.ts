import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { PlantStatus } from "../enums/PlantStatus";

@Entity("plants")
export class Plant {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 255, nullable: false })
  commonName!: string;

  @Column({ type: "decimal", precision: 3, scale: 2, nullable: false })
  aromaStrength!: number;

  @Column({ type: "varchar", length: 255, nullable: false })
  latinName!: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  countryOfOrigin!: string;

  @Column({ 
    type: "enum", 
    enum: PlantStatus, 
    default: PlantStatus.PLANTED 
  })
  status!: PlantStatus;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt!: Date;
}
