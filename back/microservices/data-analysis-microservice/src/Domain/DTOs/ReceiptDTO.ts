import { PaymentMethod } from "../Enums/PaymentMethod";
import { SaleType } from "../Enums/SaleType";

export interface ReceiptDTO {
  id?: number;
  tipProdaje: SaleType;
  nacinPlacanja: PaymentMethod;
  spisakParfema: string;
  kolicina: number;
  iznos: number;
}
