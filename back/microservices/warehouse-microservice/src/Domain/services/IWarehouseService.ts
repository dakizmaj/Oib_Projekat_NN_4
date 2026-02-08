import { Result } from "neverthrow";
import { PackagingDTO } from "../DTOs/PackagingDTO";
import { WarehouseDTO } from "../DTOs/WarehouseDTO";

export type PackPerfumesRequest = {
  perfumeType: string;
  quantity: number;
  netVolume: number;
  warehouseId: number;
  sender: string;
  destinationAddress: string;
  plantCommonName: string;
};

export type SendPackagesRequest = {
  warehouseId?: number;
  packageIds?: string[]; // Specific package IDs to send
  packIfNotAvailable?: boolean;
  packParams?: PackPerfumesRequest;
};

export interface IWarehouseService {
  // Warehouse operations
  getAllWarehouses(): Promise<Result<WarehouseDTO[], Error>>;
  getWarehouseById(id: number): Promise<Result<WarehouseDTO, Error>>;

  // Packaging operations
  getAllPackages(): Promise<Result<PackagingDTO[], Error>>;
  getPackagesByWarehouse(warehouseId: number): Promise<Result<PackagingDTO[], Error>>;
  createPackage(packageData: Omit<PackagingDTO, 'id' | 'createdAt'>): Promise<Result<PackagingDTO, Error>>;
  packPerfumes(request: PackPerfumesRequest): Promise<Result<PackagingDTO, Error>>;
  
  // Send packages with strategy-based timing
  // If no packages available and packIfNotAvailable=true, automatically creates them
  sendPackages(request: SendPackagesRequest): Promise<Result<{ message: string; sentCount: number }, Error>>;
}