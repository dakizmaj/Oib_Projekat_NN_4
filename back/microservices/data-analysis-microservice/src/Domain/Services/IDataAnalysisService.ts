import { ResultAsync } from "neverthrow";
import { ReceiptDTO } from "../DTOs/ReceiptDTO";
import { MonthData, Revenue, YearData } from "../types/AnalysisTypes";

export interface IDataAnalysisService{
    createReceipt(receipt: ReceiptDTO): Promise<ResultAsync<ReceiptDTO, string>>;
    getAllReceipts(): Promise<ResultAsync<ReceiptDTO[], string>>;

    getRevenue(): Promise<ResultAsync<Revenue, string>>;
    getTopTen(): Promise<ResultAsync<String[], string>>;
    getTopTenRevenue(): Promise<ResultAsync<Revenue, string>>;
    getRevenueByMonth(): Promise<ResultAsync<MonthData[], string>>;
    getRevenueByYear(): Promise<ResultAsync<YearData[], string>>;
}