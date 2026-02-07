import { PerfumeDTO } from "../../models/perfumes/PerfumeDTO";
import { ProcessingRequest, ProcessingResult } from "../../models/processing/ProcessingTypes";

export interface IProcessingAPI {
  startProcessing(request: ProcessingRequest, token: string): Promise<ProcessingResult>;
  getAllPerfumes(token: string): Promise<PerfumeDTO[]>;
  getPerfumeById(id: number, token: string): Promise<PerfumeDTO>;
  getPerfumesByType(type: string, token: string): Promise<PerfumeDTO[]>;
}
