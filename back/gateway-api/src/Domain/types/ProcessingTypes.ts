import { PerfumeDTO } from "../DTOs/PerfumeDTO";

export interface ProcessingRequest {
  perfumeName: string;
  perfumeType: "parfem" | "kolonjska voda";
  quantity: number;
  netVolume: 150 | 250;
  plantCommonName: string;
}

export interface ProcessingResult {
  perfumes: PerfumeDTO[];
  plantsUsed: number;
  message: string;
}
