import { PerfumeCatalogItem, SaleRequest, SaleResult } from "../../models/sales/SalesDTO";

export interface ISalesAPI {
  getCatalog(): Promise<PerfumeCatalogItem[]>;
  sellPerfumes(request: SaleRequest): Promise<SaleResult>;
}
