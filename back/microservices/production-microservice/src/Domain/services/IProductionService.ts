import { PlantDTO } from "../DTOs/PlantDTO";
import { PerfumeDTO } from "../DTOs/PerfumeDTO";
import { PackagingDTO } from "../DTOs/PackagingDTO";
import { StorageDTO } from "../DTOs/StorageDTO";
import { ReceiptDTO } from "../DTOs/ReceiptDTO";

export interface IProductionService {
  // Plants
  getAllPlants(): Promise<PlantDTO[]>;
  getPlantById(id: number): Promise<PlantDTO>;
  createPlant(data: PlantDTO): Promise<PlantDTO>;

  // Perfumes
  getAllPerfumes(): Promise<PerfumeDTO[]>;
  getPerfumeById(serial: string): Promise<PerfumeDTO>;
  createPerfume(data: PerfumeDTO): Promise<PerfumeDTO>;

  // Storages
  getAllStorages(): Promise<StorageDTO[]>;
  createStorage(data: StorageDTO): Promise<StorageDTO>;

  // Packaging
  createPackaging(data: PackagingDTO): Promise<PackagingDTO>;

  // Receipts
  createReceipt(data: ReceiptDTO): Promise<ReceiptDTO>;
}
