import { WarehouseDTO, PackagingDTO } from "../../models/warehouse/WarehouseDTO";

export interface IWarehouseAPI {
  getAllWarehouses(): Promise<WarehouseDTO[]>;
  getWarehouseById(id: number): Promise<WarehouseDTO>;
  getAllPackages(): Promise<PackagingDTO[]>;
  getPackagesByWarehouse(warehouseId: number): Promise<PackagingDTO[]>;
  createPackage(packageData: Omit<PackagingDTO, 'id' | 'createdAt'>): Promise<PackagingDTO>;
  sendPackages(packageIds: number[]): Promise<{ message: string; sentCount: number }>;
}
