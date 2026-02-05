import { PerfumeDTO } from "../DTOs/PerfumeDTO";
import { ProcessingRequest, ProcessingResult } from "../types/ProcessingTypes";
import { PerfumeType } from "../enums/PerfumeType";

export interface IProcessingService {
  // Započni preradu biljaka u parfeme
  processPlants(request: ProcessingRequest): Promise<ProcessingResult>;
  
  // Dobavi napravljene parfeme (za pakovanje)
  getPerfumes(type?: PerfumeType, quantity?: number): Promise<PerfumeDTO[]>;
  
  // Dobavi perfume po ID-ju
  getPerfumeById(id: number): Promise<PerfumeDTO | null>;
  
  // Dobavi sve parfeme
  getAllPerfumes(): Promise<PerfumeDTO[]>;
}
