import { ResultAsync } from "neverthrow";
import { PackagingDTO } from "../DTOs/PackagingDTO";

export interface IWarehouseService {
  // getPerfumes(perfumeIds: number[]): Promise<ResultAsync<any, any>>;
  sendPackaging(packaging: PackagingDTO): Promise<ResultAsync<any, any>>;
  waitForDelivery(packages: PackagingDTO[]): Promise<ResultAsync<any, any>>;
}