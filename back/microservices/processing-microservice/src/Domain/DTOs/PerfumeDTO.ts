import { PerfumeType } from "../enums/PerfumeType";

export interface PerfumeDTO {
  id?: number;
  name: string;
  type: PerfumeType;
  netVolume: number;
  serialNumber?: string;
  plantId: number;
  expirationDate: Date;
  createdAt?: Date;
}
