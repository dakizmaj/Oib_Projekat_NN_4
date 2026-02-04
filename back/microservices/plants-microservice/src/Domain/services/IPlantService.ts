import { PlantDTO } from "../DTOs/PlantDTO";

export interface IPlantService {
  // Zasadi novu biljku
  plantNewPlant(plantData: Omit<PlantDTO, 'id' | 'status' | 'createdAt'>): Promise<PlantDTO>;
  
  // Promeni jačinu aromatičnih ulja za određeni procenat
  adjustAromaStrength(plantId: number, percentageChange: number): Promise<PlantDTO>;
  
  // Uberi određeni broj biljaka
  harvestPlants(commonName: string, quantity: number): Promise<PlantDTO[]>;
  
  // Dobavi sve biljke
  getAllPlants(): Promise<PlantDTO[]>;
  
  // Dobavi biljku po ID-ju
  getPlantById(id: number): Promise<PlantDTO | null>;
  
  // Dobavi dostupne biljke za preradu (ubrane ali ne prerađene)
  getAvailablePlantsForProcessing(commonName: string): Promise<PlantDTO[]>;
  
  // Označi biljke kao prerađene
  markPlantsAsProcessed(plantIds: number[]): Promise<void>;
}
