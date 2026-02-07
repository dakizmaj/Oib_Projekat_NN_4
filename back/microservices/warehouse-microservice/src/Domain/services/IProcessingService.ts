import { PerfumeDTO } from "../DTOs/PerfumeDTO";
import { ProcessingRequest, ProcessingResult } from "../types/ProcessingTypes";

export interface IProcessingService {
  startProcessing(request: ProcessingRequest): Promise<ProcessingResult>;
  getAllPerfumes(): Promise<PerfumeDTO[]>;
  getPerfumeById(id: number): Promise<PerfumeDTO>;
  getPerfumesByType(type: string): Promise<PerfumeDTO[]>;
}
