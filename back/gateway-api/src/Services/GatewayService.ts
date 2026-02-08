import axios, { AxiosInstance } from "axios";
import { IGatewayService } from "../Domain/services/IGatewayService";
import { LoginUserDTO } from "../Domain/DTOs/LoginUserDTO";
import { RegistrationUserDTO } from "../Domain/DTOs/RegistrationUserDTO";
import { AuthResponseType } from "../Domain/types/AuthResponse";
import { UserDTO } from "../Domain/DTOs/UserDTO";
import { PlantDTO } from "../Domain/DTOs/PlantDTO";
import { PerfumeDTO } from "../Domain/DTOs/PerfumeDTO";
import { ProcessingRequest, ProcessingResult } from "../Domain/types/ProcessingTypes";
import { SalesType } from "../Domain/types/SalesType";
import { ReceiptDTO } from "../Domain/DTOs/ReceiptDTO";
import { MonthData, Revenue, YearData } from "../Domain/types/AnalysisTypes";
import { WarehouseDTO, PackagingDTO } from "../Domain/types/WarehouseTypes";

export class GatewayService implements IGatewayService {
  private readonly authClient: AxiosInstance;
  private readonly userClient: AxiosInstance;
  private readonly plantsClient: AxiosInstance;
  private readonly processingClient: AxiosInstance;
  private readonly salesClient: AxiosInstance;
  private readonly analysisClient: AxiosInstance;
  private readonly warehouseClient: AxiosInstance;
  private readonly loggingClient: AxiosInstance;

  constructor() {
    const authBaseURL = process.env.AUTH_SERVICE_API;
    const userBaseURL = process.env.USER_SERVICE_API;
    const plantsBaseURL = process.env.PLANTS_SERVICE_API || "http://localhost:5003/api/v1";
    const processingBaseURL = process.env.PROCESSING_SERVICE_API || "http://localhost:5004/api/v1";
    const salseBaseURL = process.env.SALES_SERVICE_API || "http://localhost:5005/api/v1";
    const analysisBaseURL = process.env.ANALYSIS_SERVICE_API || "http://localhost:5006/api/v1";
    const warehouseBaseURL = process.env.WAREHOUSE_SERVICE_API || "http://localhost:5005/api/v1";
    const loggingBaseURL = process.env.LOGGING_SERVICE_API || "http://localhost:5002/api/v1";

    this.authClient = axios.create({
      baseURL: authBaseURL,
      headers: { "Content-Type": "application/json" },
      timeout: 5000,
    });

    this.userClient = axios.create({
      baseURL: userBaseURL,
      headers: { "Content-Type": "application/json" },
      timeout: 5000,
    });

    this.plantsClient = axios.create({
      baseURL: plantsBaseURL,
      headers: { "Content-Type": "application/json" },
      timeout: 5000,
    });

    this.processingClient = axios.create({
      baseURL: processingBaseURL,
      headers: { "Content-Type": "application/json" },
      timeout: 5000,
    });

    this.salesClient = axios.create({
      baseURL: salseBaseURL,
      headers: { "Content-Type": "application/json" },
      timeout: 5000,
    });

    this.analysisClient = axios.create({
      baseURL: analysisBaseURL,
      headers: { "Content-Type": "application/json" },
      timeout: 5000,
    });

    this.warehouseClient = axios.create({
      baseURL: warehouseBaseURL,
      headers: { "Content-Type": "application/json" },
      timeout: 5000,
    });

    this.loggingClient = axios.create({
      baseURL: loggingBaseURL,
      headers: { "Content-Type": "application/json" },
      timeout: 5000,
    });
  }

  // Auth microservice
  async login(data: LoginUserDTO): Promise<AuthResponseType> {
    try {
      const response = await this.authClient.post<AuthResponseType>("/auth/login", data);
      return response.data;
    } catch {
      return { authenificated: false };
    }
  }

  async register(data: RegistrationUserDTO): Promise<AuthResponseType> {
    try {
      const response = await this.authClient.post<AuthResponseType>("/auth/register", data);
      return response.data;
    } catch {
      return { authenificated: false };
    }
  }

  // User microservice
  async getAllUsers(): Promise<UserDTO[]> {
    const response = await this.userClient.get<UserDTO[]>("/users");
    return response.data;
  }

  async getUserById(id: number): Promise<UserDTO> {
    const response = await this.userClient.get<UserDTO>(`/users/${id}`);
    return response.data;
  }

  // Plants microservice
  async getAllPlants(): Promise<PlantDTO[]> {
    const response = await this.plantsClient.get<PlantDTO[]>("/plants");
    return response.data;
  }

  async getPlantById(id: number): Promise<PlantDTO> {
    const response = await this.plantsClient.get<PlantDTO>(`/plants/${id}`);
    return response.data;
  }

  async plantNewPlant(data: Omit<PlantDTO, 'id' | 'status' | 'createdAt'>): Promise<PlantDTO> {
    const response = await this.plantsClient.post<PlantDTO>("/plants", data);
    return response.data;
  }

  async harvestPlants(commonName: string, quantity: number): Promise<PlantDTO[]> {
    const response = await this.plantsClient.post<PlantDTO[]>("/plants/harvest", { commonName, quantity });
    return response.data;
  }

  async adjustAromaStrength(plantId: number, percentageChange: number): Promise<PlantDTO> {
    const response = await this.plantsClient.put<PlantDTO>(`/plants/${plantId}/adjust-aroma`, { percentageChange });
    return response.data;
  }

  // Processing microservice
  async startProcessing(request: ProcessingRequest): Promise<ProcessingResult> {
    const response = await this.processingClient.post<ProcessingResult>("/processing/start", request);
    return response.data;
  }

  async getAllPerfumes(): Promise<PerfumeDTO[]> {
    const response = await this.processingClient.get<PerfumeDTO[]>("/perfumes");
    return response.data;
  }

  async getPerfumeById(id: number): Promise<PerfumeDTO> {
    const response = await this.processingClient.get<PerfumeDTO>(`/perfumes/${id}`);
    return response.data;
  }

  async getPerfumesByType(type: string): Promise<PerfumeDTO[]> {
    const response = await this.processingClient.get<PerfumeDTO[]>(`/perfumes/type/${type}`);
    return response.data;
  }

   // Sales
  async createPerfume(data: PerfumeDTO): Promise<PerfumeDTO>{
    const response = await this.salesClient.post<PerfumeDTO>(`/sales/perfume`, data);
    return response.data;
  }
  async getAllPerfumesForSale(): Promise<PerfumeDTO[]>{
    const response = await this.salesClient.get<PerfumeDTO[]>(`/sales/perfumes`);
    return response.data;
  }
  async perfumesToSend(perfumeId: number, amount: number): Promise<SalesType>{
    const response = await this.salesClient.get<SalesType>(`/sales/send`, {
      params: { perfumeId, amount }
    });
    return response.data;
  }
  // Data Analysis
  async createReceipt(receipt: ReceiptDTO): Promise<ReceiptDTO>{
    const response = await this.analysisClient.post(`/data/reciept`, receipt);
    return response.data;
  }
  async getAllReceipts(): Promise<ReceiptDTO[]>{
    const response = await this.analysisClient.get(`/data/reciepts`);
    return response.data;
  }
  async getRevenue(): Promise<Revenue>{
    const response = await this.analysisClient.get(`/data/revenue`);
    return response.data;
  }
  async getTopTen(): Promise<String[]>{
    const response = await this.analysisClient.get(`/data/top`);
    return response.data;
  }
  async getTopTenRevenue(): Promise<Revenue>{
    const response = await this.analysisClient.get(`/data/revenue/top`);
    return response.data;
  }
  async getRevenueByMonth(): Promise<MonthData[]>{
    const response = await this.analysisClient.get(`/data/revenue/month`);
    return response.data;
  }
  async getRevenueByYear(): Promise<YearData[]>{
    const response = await this.analysisClient.get(`/data/revenue/year`);
    return response.data;
  }

  // Warehouse microservice
  async getAllWarehouses(): Promise<WarehouseDTO[]> {
    const response = await this.warehouseClient.get("/warehouses");
    return response.data;
  }

  async getWarehouseById(id: number): Promise<WarehouseDTO> {
    const response = await this.warehouseClient.get(`/warehouses/${id}`);
    return response.data;
  }

  async getAllPackages(): Promise<PackagingDTO[]> {
    const response = await this.warehouseClient.get("/packages");
    return response.data;
  }

  async getPackagesByWarehouse(warehouseId: number): Promise<PackagingDTO[]> {
    const response = await this.warehouseClient.get(`/packages/warehouse/${warehouseId}`);
    return response.data;
  }

  async createPackage(packageData: Omit<PackagingDTO, 'id' | 'createdAt'>): Promise<PackagingDTO> {
    const response = await this.warehouseClient.post("/packages", packageData);
    return response.data;
  }

  async packPerfumes(request: {
    perfumeType: string;
    quantity: number;
    netVolume: number;
    warehouseId: number;
    sender: string;
    destinationAddress: string;
    plantCommonName: string;
  }): Promise<PackagingDTO> {
    const response = await this.warehouseClient.post("/packages/pack-perfumes", request);
    return response.data;
  }

  async sendPackages(packageIds: number[]): Promise<{ message: string; sentCount: number }> {
    const response = await this.warehouseClient.post("/packages/send", { packageIds });
    return response.data;
  }

  // Logging microservice
  async getAllLogs(): Promise<any[]> {
    const response = await this.loggingClient.get("/logs");
    return response.data;
  }
}
