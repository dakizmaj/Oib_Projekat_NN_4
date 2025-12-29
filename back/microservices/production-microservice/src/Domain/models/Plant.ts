import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

export enum PlantState {
  POSADJENA = "posadjena",
  UBRANA = "ubrana",
  PRERADJENA = "preradjena",
}

@Entity("plants")
export class Plant {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 255 })
  opstiNaziv!: string;

  @Column({ type: "float" })
  jacinaAromaticnihUlja!: number;

  @Column({ type: "varchar", length: 255 })
  latinskiNaziv!: string;

  @Column({ type: "varchar", length: 255 })
  zemljaPorekla!: string;

  @Column({ type: "enum", enum: PlantState, default: PlantState.POSADJENA })
  stanje!: PlantState;
}
