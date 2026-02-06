import { ResultAsync } from "neverthrow";
import { PerfumeDTO } from "../DTOs/PerfumeDTO";

export interface ISalesService {
    createPerfume(data: PerfumeDTO): Promise<ResultAsync<PerfumeDTO, string>>;
    getAllPerfumes(): Promise<ResultAsync<PerfumeDTO[], string>>;
    perfumesToSend(perfumeId: number, amount: number): Promise<ResultAsync<{naziv: string, amount: number}, string>>;
}