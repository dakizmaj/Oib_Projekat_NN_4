import { ResultAsync } from "neverthrow";
import { ReceiptDTO } from "../DTOs/ReceiptDTO";

export interface IDataAnalysisService{
    createReceipt(receipt: ReceiptDTO): Promise<ResultAsync<ReceiptDTO, string>>;
    getAllReceipts(): Promise<ResultAsync<ReceiptDTO[], string>>;

    getRevenue(): Promise<ResultAsync<number, string>>;
    getTopTen(): Promise<ResultAsync<String[], string>>;
    getTopTenRevenue(): Promise<ResultAsync<number, string>>;
    getRevenueByMonth(): Promise<ResultAsync<{month: string, revenue: number}[], string>>;
    getRevenueByYear(): Promise<ResultAsync<{year: string, revenue: number}[], string>>;
}