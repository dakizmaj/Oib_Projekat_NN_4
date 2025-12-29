import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("storages")
export class Storage {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 255 })
  naziv!: string;

  @Column({ type: "varchar", length: 255 })
  lokacija!: string;

  @Column({ type: "int" })
  maxAmbalaza!: number;
}
