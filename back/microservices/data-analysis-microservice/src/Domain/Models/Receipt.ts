import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { SaleType } from "../Enums/SaleType";
import { PaymentMethod } from "../Enums/PaymentMethod";


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