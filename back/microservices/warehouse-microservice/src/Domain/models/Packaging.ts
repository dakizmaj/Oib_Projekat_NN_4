import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { PackageStatus } from "../enums/PackageStatus";

@Entity("packaging")
export class Packaging {
  @PrimaryGeneratedColumn()
  id!: number;
  
  @Column({ type: "varchar", nullable: false })
  name!: string;
  
  @Column({ type: "varchar" })
  destinationAddress!: string;
  
  @Column({ type: "int" })
  warehouseId!: number;
  
  @Column({ type: "int" })
  perfumeId!: number;
  
  @Column({ type: "enum", enum: PackageStatus, default: PackageStatus.PACKSTATUS_UNPACKAGED })
  packageStatus!: PackageStatus;
}