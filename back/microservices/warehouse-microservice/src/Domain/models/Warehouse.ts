import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("warehouses")
export class Warehouse {
  @PrimaryGeneratedColumn()
  id!: number;
  
  @Column({ type: "varchar", nullable: false })
  name!: string;
  
  @Column({ type: "varchar" })
  location!: string;
  
  @Column({ type: "int", nullable: false })
  maxPackages!: number;
}