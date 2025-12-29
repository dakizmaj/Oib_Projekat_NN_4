import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Storage } from "./Storage";
import { Perfume } from "./Perfume";

export enum PackageStatus {
  SPAKOVANA = "spakovana",
  POSLATA = "poslata",
}

@Entity("package")
export class Packaging {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 255 })
  naziv!: string;

  @Column({ type: "varchar", length: 255 })
  adresaPosiljaoca!: string;

  @Column({ type: "int" })
  idSkladista!: number;

  @ManyToOne(() => Storage)
  @JoinColumn({ name: "idSkladista" })
  skladiste?: Storage;

  @Column({ type: "varchar", length: 255 })
  idParfema!: string;

  @ManyToOne(() => Perfume)
  @JoinColumn({ name: "idParfema", referencedColumnName: "serijskiBroj" })
  parfem?: Perfume;

  @Column({ type: "enum", enum: PackageStatus, default: PackageStatus.SPAKOVANA })
  status!: PackageStatus;
}
