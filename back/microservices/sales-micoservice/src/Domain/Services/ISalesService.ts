import { ResultAsync } from "neverthrow";
import { PerfumeDTO } from "../DTOs/PerfumeDTO";
import { SalesType } from "../types/SalesType";

export interface ISalesService {
    createPerfume(data: PerfumeDTO): Promise<ResultAsync<PerfumeDTO, string>>;
    getAllPerfumes(): Promise<ResultAsync<PerfumeDTO[], string>>;
    perfumesToSend(perfumeId: number, amount: number): Promise<ResultAsync<SalesType, string>>;
}