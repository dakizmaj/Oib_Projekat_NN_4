export interface PerfumeCatalogItem {
  id: number;
  name: string;
  type: string;
  volume: number;
  price: number;
  availableQuantity: number;
}

export interface SaleRequest {
  perfumeId: number;
  quantity: number;
  customerName: string;
}

export interface SaleResult {
  success: boolean;
  receiptId?: number;
  message: string;
  totalPrice?: number;
  perfumesSold?: number;
}
