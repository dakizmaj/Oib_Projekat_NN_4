import { WarehouseDTO, PackagingDTO, PackPerfumesRequest, SendPackagesRequest } from "../../models/warehouse/WarehouseDTO";

export interface IWarehouseAPI {
  getAllWarehouses(): Promise<WarehouseDTO[]>;
  getWarehouseById(id: number): Promise<WarehouseDTO>;
  getAllPackages(): Promise<PackagingDTO[]>;
  getPackagesByWarehouse(warehouseId: number): Promise<PackagingDTO[]>;
  createPackage(packageData: Omit<PackagingDTO, 'id' | 'createdAt'>): Promise<PackagingDTO>;
  sendPackages(request: SendPackagesRequest): Promise<{ message: string; sentCount: number }>;
  packPerfumes(request: PackPerfumesRequest): Promise<PackagingDTO>;
}
