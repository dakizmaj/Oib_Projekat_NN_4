import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn } from "typeorm";
import { SaleType } from "../Enums/SaleType";
import { PaymentMethod } from "../Enums/PaymentMethod";


@Entity("receipts")
export class Receipt {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "enum", enum: SaleType })
  tipProdaje!: SaleType;

  @Column({ type: "enum", enum: PaymentMethod })
  nacinPlacanja!: PaymentMethod;

  @Column("simple-array")
  spisakParfema!: string[];

  @Column({ type: "int" })
  kolicina!: number;

  @Column({ type: "int" })
  iznos!: number;

  @CreateDateColumn()
  datumProdaje!: Date;
}
