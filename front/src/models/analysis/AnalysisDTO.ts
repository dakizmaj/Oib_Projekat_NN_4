export interface ReceiptDTO {
  tipProdaje: string;
  nacinPlacanja: string;
  spisakParfema: string[];
  kolicina: number;
  iznos: number;
  datumProdaje?: string;
}

export interface Revenue {
  revenue: number;
}

export interface MonthData {
  month: string;
  revenue: number;
}

export interface YearData {
  year: string;
  revenue: number;
}
