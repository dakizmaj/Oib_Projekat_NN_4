import { ResultAsync, errAsync } from "neverthrow";
import { PackagingDTO } from "../Domain/DTOs/PackagingDTO";
import { IWarehouseService } from "../Domain/services/IWarehouseService";



export class MagazineWarehouseService implements IWarehouseService {
  async send(packaging: PackagingDTO): Promise<ResultAsync<any, any>> {
    return errAsync("todo");
  }
}