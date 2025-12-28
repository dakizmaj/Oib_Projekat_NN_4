import { ResultAsync } from "neverthrow";
import { PackagingDTO } from "../DTOs/PackagingDTO";

export interface IWarehouseService {
  send(packaging: PackagingDTO): Promise<ResultAsync<any, any>>;
}