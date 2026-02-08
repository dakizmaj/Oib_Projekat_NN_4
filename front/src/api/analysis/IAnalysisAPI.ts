import { ReceiptDTO, Revenue, MonthData, YearData } from "../../models/analysis/AnalysisDTO";

export interface IAnalysisAPI {
  getAllReceipts(): Promise<ReceiptDTO[]>;
  getRevenue(): Promise<Revenue>;
  getTopTen(): Promise<string[]>;
  getTopTenRevenue(): Promise<Revenue>;
  getRevenueByMonth(): Promise<MonthData[]>;
  getRevenueByYear(): Promise<YearData[]>;
}
