import { PackageStatus } from "../enums/PackageStatus"

export type PackagingDTO = {
  id: number,
  name: string,
  destinationAddress: string,
  warehouseId: number,
  perfumeId: number,
  packageStatus: PackageStatus
}