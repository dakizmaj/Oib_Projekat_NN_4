import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

export enum SaleType {
  MALOPRODAJA = "maloprodaja",
  VELEPRODAJA = "veleprodaja",
}

export enum PaymentMethod {
  GOTOVINA = "gotovina",
  NA_RACUN = "naRacun",
  KARTICA = "kartica",
}

@Entity("receipt")
export class Receipt {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "enum", enum: SaleType })
  tipProdaje!: SaleType;

  @Column({ type: "enum", enum: PaymentMethod })
  nacinPlacanja!: PaymentMethod;

  @Column({ type: "varchar", length: 255 })
  spisakParfema!: string;

  @Column({ type: "int" })
  kolicina!: number;

  @Column({ type: "int" })
  iznos!: number;
}
