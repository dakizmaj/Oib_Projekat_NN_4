import { PerfumeDTO } from "../perfumes/PerfumeDTO";

export type ProcessingRequest = {
  perfumeName: string;
  perfumeType: "parfem" | "kolonjska voda";
  quantity: number;
  netVolume: 150 | 250;
  plantCommonName: string;
};

export type ProcessingResult = {
  perfumes: PerfumeDTO[];
  plantsUsed: number;
  message: string;
};
