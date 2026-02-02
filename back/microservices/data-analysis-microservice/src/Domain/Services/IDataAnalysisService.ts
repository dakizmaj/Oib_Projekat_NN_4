import { ResultAsync } from "neverthrow";
import { ReceiptDTO } from "../DTOs/ReceiptDTO";

export interface IDataAnalysisService{
    createReceipt(receipt: ReceiptDTO): Promise<ResultAsync<ReceiptDTO, string>>;
    getAllReceipts(): Promise<ResultAsync<ReceiptDTO[], string>>;

    getAllSales(): Promise<ResultAsync<number, string>>;

}