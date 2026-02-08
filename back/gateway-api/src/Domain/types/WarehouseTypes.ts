export interface WarehouseDTO {
  id?: number;
  name: string;
  location: string;
  maxCapacity: number;
  currentCapacity: number;
}

export interface PackagingDTO {
  id?: number;
  packageId: string;
  sender: string;
  perfumeCount: number;
  warehouseId: number;
  warehouseName?: string;
  destinationAddress: string;
  packageStatus: string;
  createdAt?: Date;
}
