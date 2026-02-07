export type PerfumeDTO = {
  id?: number;
  serialNumber: string | null;
  perfumeName: string;
  perfumeType: "parfem" | "kolonjska voda";
  netVolume: number;
  productionDate: string;
  expirationDate: string;
};
