import { PlantStatus } from "../enums/PlantStatus";

export interface PlantDTO {
  id?: number;
  commonName: string;
  aromaStrength: number;
  latinName: string;
  countryOfOrigin: string;
  status: PlantStatus;
  createdAt?: Date;
}
