import { LoginUserDTO } from "../DTOs/LoginUserDTO";
import { RegistrationUserDTO } from "../DTOs/RegistrationUserDTO";
import { UserDTO } from "../DTOs/UserDTO";
import { PlantDTO } from "../DTOs/PlantDTO";
import { PerfumeDTO } from "../DTOs/PerfumeDTO";
import { AuthResponseType } from "../types/AuthResponse";
import { ProcessingRequest, ProcessingResult } from "../types/ProcessingTypes";
import { SalesType } from "../types/SalesType";
import { ReceiptDTO } from "../DTOs/ReceiptDTO";
import { MonthData, Revenue, YearData } from "../types/AnalysisTypes";
import { WarehouseDTO, PackagingDTO } from "../types/WarehouseTypes";

export interface IGatewayService {
  // Auth
  login(data: LoginUserDTO): Promise<AuthResponseType>;
  register(data: RegistrationUserDTO): Promise<AuthResponseType>;

  // Users
  getAllUsers(): Promise<UserDTO[]>;
  getUserById(id: number): Promise<UserDTO>;

  // Plants
  getAllPlants(): Promise<PlantDTO[]>;
  getPlantById(id: number): Promise<PlantDTO>;
  plantNewPlant(data: Omit<PlantDTO, 'id' | 'status' | 'createdAt'>): Promise<PlantDTO>;
  harvestPlants(commonName: string, quantity: number): Promise<PlantDTO[]>;
  adjustAromaStrength(plantId: number, percentageChange: number): Promise<PlantDTO>;

  // Processing
  startProcessing(request: ProcessingRequest): Promise<ProcessingResult>;
  getAllPerfumes(): Promise<PerfumeDTO[]>;
  getPerfumeById(id: number): Promise<PerfumeDTO>;
  getPerfumesByType(type: string): Promise<PerfumeDTO[]>;

  // Sales
  createPerfume(data: PerfumeDTO): Promise<PerfumeDTO>;
  getAllPerfumesForSale(): Promise<PerfumeDTO[]>;
  perfumesToSend(perfumeId: number, amount: number): Promise<SalesType>;

  // Data Analysis
  createReceipt(receipt: ReceiptDTO): Promise<ReceiptDTO>;
  getAllReceipts(): Promise<ReceiptDTO[]>;
  getRevenue(): Promise<Revenue>;
  getTopTen(): Promise<String[]>;
  getTopTenRevenue(): Promise<Revenue>;
  getRevenueByMonth(): Promise<MonthData[]>;
  getRevenueByYear(): Promise<YearData[]>;

  // Warehouse
  getAllWarehouses(): Promise<WarehouseDTO[]>;
  getWarehouseById(id: number): Promise<WarehouseDTO>;
  getAllPackages(): Promise<PackagingDTO[]>;
  getPackagesByWarehouse(warehouseId: number): Promise<PackagingDTO[]>;
  createPackage(packageData: Omit<PackagingDTO, 'id' | 'createdAt'>): Promise<PackagingDTO>;
  packPerfumes(request: {
    perfumeType: string;
    quantity: number;
    netVolume: number;
    warehouseId: number;
    sender: string;
    destinationAddress: string;
    plantCommonName: string;
  }): Promise<PackagingDTO>;
  sendPackages(packageIds: number[]): Promise<{ message: string; sentCount: number }>;

  // Logging
  getAllLogs(): Promise<any[]>;
}
