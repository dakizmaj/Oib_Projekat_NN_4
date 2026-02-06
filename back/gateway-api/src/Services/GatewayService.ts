import axios, { AxiosInstance } from "axios";
import { IGatewayService } from "../Domain/services/IGatewayService";
import { LoginUserDTO } from "../Domain/DTOs/LoginUserDTO";
import { RegistrationUserDTO } from "../Domain/DTOs/RegistrationUserDTO";
import { AuthResponseType } from "../Domain/types/AuthResponse";
import { UserDTO } from "../Domain/DTOs/UserDTO";
import { PlantDTO } from "../Domain/DTOs/PlantDTO";
import { PerfumeDTO } from "../Domain/DTOs/PerfumeDTO";
import { ProcessingRequest, ProcessingResult } from "../Domain/types/ProcessingTypes";

export class GatewayService implements IGatewayService {
  private readonly authClient: AxiosInstance;
  private readonly userClient: AxiosInstance;
  private readonly plantsClient: AxiosInstance;
  private readonly processingClient: AxiosInstance;

  constructor() {
    const authBaseURL = process.env.AUTH_SERVICE_API;
    const userBaseURL = process.env.USER_SERVICE_API;
    const plantsBaseURL = process.env.PLANTS_SERVICE_API || "http://localhost:5003/api/v1";
    const processingBaseURL = process.env.PROCESSING_SERVICE_API || "http://localhost:5004/api/v1";

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
}
