import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Packaging } from "./Packaging";

@Entity("warehouses")
export class Warehouse {
  @PrimaryGeneratedColumn()
  id!: number;
  
  @Column({ type: "varchar", nullable: false })
  name!: string;
  
  @Column({ type: "varchar" })
  location!: string;
  
  @Column({ type: "int", nullable: false, name: "max_capacity" })
  maxCapacity!: number;

  @Column({ type: "int", default: 0, name: "current_capacity" })
  currentCapacity!: number;

  @OneToMany(() => Packaging, packaging => packaging.warehouse)
  packages!: Packaging[];
}