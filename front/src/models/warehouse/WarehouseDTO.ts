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
  perfumeIds?: string;
  warehouseId: number;
  warehouseName?: string;
  destinationAddress: string;
  packageStatus: string;
  createdAt?: Date;
}

export interface PackPerfumesRequest {
  perfumeType: string;
  quantity: number;
  netVolume: number;
  warehouseId: number;
  sender: string;
  destinationAddress: string;
  plantCommonName: string;
}

export interface SendPackagesRequest {
  warehouseId?: number;
  packageIds?: string[]; // Specific package IDs to send
  packIfNotAvailable?: boolean;
  packParams?: PackPerfumesRequest;
}
