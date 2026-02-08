import axios, { AxiosInstance } from "axios";
import { IAnalysisAPI } from "./IAnalysisAPI";
import { ReceiptDTO, Revenue, MonthData, YearData } from "../../models/analysis/AnalysisDTO";

export class AnalysisAPI implements IAnalysisAPI {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_GATEWAY_URL || "http://localhost:5001/api/v1",
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 30000,
    });
  }

  async getAllReceipts(): Promise<ReceiptDTO[]> {
    const response = await this.client.get("/data/reciepts");
    return response.data;
  }

  async getRevenue(): Promise<Revenue> {
    const response = await this.client.get("/data/revenue");
    return response.data;
  }

  async getTopTen(): Promise<string[]> {
    const response = await this.client.get("/data/top");
    return response.data.result || response.data;
  }

  async getTopTenRevenue(): Promise<Revenue> {
    const response = await this.client.get("/data/revenue/top");
    return response.data;
  }

  async getRevenueByMonth(): Promise<MonthData[]> {
    const response = await this.client.get("/data/revenue/month");
    return response.data;
  }

  async getRevenueByYear(): Promise<YearData[]> {
    const response = await this.client.get("/data/revenue/year");
    return response.data;
  }
}
