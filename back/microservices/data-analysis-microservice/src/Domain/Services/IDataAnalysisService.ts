import { ResultAsync } from "neverthrow";
import { ReceiptDTO } from "../DTOs/ReceiptDTO";
import { MonthData, Revenue, YearData, WeekData, TrendData } from "../types/AnalysisTypes";

export interface AnalysisReportDTO {
    id?: number;
    title: string;
    reportType: string;
    data: any;
    createdAt?: Date;
    description?: string;
}

export interface IDataAnalysisService{
    // Receipt operations
    createReceipt(receipt: ReceiptDTO): Promise<ResultAsync<ReceiptDTO, string>>;
    getAllReceipts(): Promise<ResultAsync<ReceiptDTO[], string>>;

    // Analysis operations
    getRevenue(): Promise<ResultAsync<Revenue, string>>;
    getTopTen(): Promise<ResultAsync<String[], string>>;
    getTopTenRevenue(): Promise<ResultAsync<Revenue, string>>;
    getRevenueByMonth(): Promise<ResultAsync<MonthData[], string>>;
    getRevenueByYear(): Promise<ResultAsync<YearData[], string>>;
    getRevenueByWeek(): Promise<ResultAsync<WeekData[], string>>;
    getSalesTrend(): Promise<ResultAsync<TrendData[], string>>;

    // Report operations
    createAnalysisReport(title: string, reportType: string, data: any, description?: string): Promise<ResultAsync<AnalysisReportDTO, string>>;
    getAllReports(): Promise<ResultAsync<AnalysisReportDTO[], string>>;
    getReportById(id: number): Promise<ResultAsync<AnalysisReportDTO, string>>;
}