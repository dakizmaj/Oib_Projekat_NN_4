import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from "typeorm";
import { Warehouse } from "./Warehouse";
import { PackageStatus } from "../enums/PackageStatus";

@Entity("packaging")
export class Packaging {
  @PrimaryGeneratedColumn()
  id!: number;
  
  @Column({ type: "varchar", nullable: false, unique: true, name: "package_id" })
  packageId!: string;
  
  @Column({ type: "varchar", nullable: false })
  sender!: string;

  @Column({ type: "int", nullable: false, name: "perfume_count" })
  perfumeCount!: number;

  @Column({ type: "text", nullable: true, name: "perfume_ids" })
  perfumeIds?: string; // JSON array of perfume IDs: "[1,2,3]"
  
  @Column({ type: "varchar", name: "destination_address" })
  destinationAddress!: string;
  
  @Column({ type: "int", name: "warehouse_id" })
  warehouseId!: number;
  
  @Column({ type: "enum", enum: PackageStatus, default: PackageStatus.PACKSTATUS_UNPACKAGED, name: "package_status" })
  packageStatus!: PackageStatus;

  @CreateDateColumn({ type: "timestamp", name: "created_at" })
  createdAt!: Date;

  @ManyToOne(() => Warehouse, warehouse => warehouse.packages)
  @JoinColumn({ name: "warehouse_id" })
  warehouse!: Warehouse;
}