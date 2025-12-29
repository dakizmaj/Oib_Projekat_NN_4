import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { Plant } from "./Plant";

export enum PerfumeType {
  PARFEM = "parfem",
  KOLJONSKA = "koljonska_voda",
}

@Entity("perfume")
export class Perfume {
  @Column({ type: "varchar", length: 255 })
  naziv!: string;

  @Column({ type: "enum", enum: PerfumeType })
  tip!: PerfumeType;

  @Column({ type: "int" })
  netoKolicina!: number;

  @Column({ type: "char", length: 12, primary: true })
  serijskiBroj!: string;

  @Column({ type: "int" })
  idBiljke!: number;

  @ManyToOne(() => Plant)
  @JoinColumn({ name: "idBiljke" })
  biljka?: Plant;

  @Column({ type: "varchar", length: 255 })
  rokTrajanja!: string;
}
