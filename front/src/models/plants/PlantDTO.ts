export type PlantDTO = {
  id?: number;
  commonName: string;
  latinName: string;
  countryOfOrigin: string;
  plantingDate: string;
  aromaStrength: number;
  status: "posadjena" | "ubrana" | "preradjena";
  harvestDate?: string | null;
};
