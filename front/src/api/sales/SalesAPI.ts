import axios, { AxiosInstance } from "axios";
import { ISalesAPI } from "./ISalesAPI";
import { PerfumeCatalogItem, SaleRequest, SaleResult } from "../../models/sales/SalesDTO";

export class SalesAPI implements ISalesAPI {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_GATEWAY_URL || "http://localhost:5001/api/v1",
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 120000, // 120s for warehouse/analysis operations
    });
  }

  async getCatalog(): Promise<PerfumeCatalogItem[]> {
    const response = await this.client.get("/sales/catalog");
    return response.data;
  }

  async sellPerfumes(request: SaleRequest): Promise<SaleResult> {
    const response = await this.client.post("/sales/sell", request);
    return response.data;
  }
}
