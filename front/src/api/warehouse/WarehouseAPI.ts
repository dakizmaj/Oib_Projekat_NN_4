import axios, { AxiosInstance } from "axios";
import { IWarehouseAPI } from "./IWarehouseAPI";
import { WarehouseDTO, PackagingDTO } from "../../models/warehouse/WarehouseDTO";

const GATEWAY_URL = import.meta.env.VITE_GATEWAY_URL;

export class WarehouseAPI implements IWarehouseAPI {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: GATEWAY_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  async getAllWarehouses(): Promise<WarehouseDTO[]> {
    const response = await this.client.get("/warehouses");
    return response.data;
  }

  async getWarehouseById(id: number): Promise<WarehouseDTO> {
    const response = await this.client.get(`/warehouses/${id}`);
    return response.data;
  }

  async getAllPackages(): Promise<PackagingDTO[]> {
    const response = await this.client.get("/packages");
    return response.data;
  }

  async getPackagesByWarehouse(warehouseId: number): Promise<PackagingDTO[]> {
    const response = await this.client.get(`/packages/warehouse/${warehouseId}`);
    return response.data;
  }

  async createPackage(packageData: Omit<PackagingDTO, 'id' | 'createdAt'>): Promise<PackagingDTO> {
    const response = await this.client.post("/packages", packageData);
    return response.data;
  }

  async sendPackages(packageIds: number[]): Promise<{ message: string; sentCount: number }> {
    const response = await this.client.post("/packages/send", { packageIds });
    return response.data;
  }
}
