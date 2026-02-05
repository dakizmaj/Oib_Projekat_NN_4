import { PerfumeDTO } from "../DTOs/PerfumeDTO";
import { PerfumeType } from "../enums/PerfumeType";

export interface ProcessingRequest {
  perfumeName: string;
  perfumeType: PerfumeType;
  quantity: number; // Broj bočica
  netVolume: 150 | 250; // ml
  plantCommonName: string; // Naziv biljke koja se koristi
}

export interface ProcessingResult {
  perfumes: PerfumeDTO[];
  plantsUsed: number;
  message: string;
}
