import axios, { AxiosInstance } from "axios";
import { IGatewayService } from "../Domain/services/IGatewayService";
import { LoginUserDTO } from "../Domain/DTOs/LoginUserDTO";
import { RegistrationUserDTO } from "../Domain/DTOs/RegistrationUserDTO";
import { AuthResponseType } from "../Domain/types/AuthResponse";
import { UserDTO } from "../Domain/DTOs/UserDTO";

export class GatewayService implements IGatewayService {
  private readonly authClient: AxiosInstance;
  private readonly userClient: AxiosInstance;
  private readonly productionClient: AxiosInstance;

  constructor() {
    const authBaseURL = process.env.AUTH_SERVICE_API;
    const userBaseURL = process.env.USER_SERVICE_API;

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

    const productionBaseURL = process.env.PRODUCTION_SERVICE_API;
    this.productionClient = axios.create({
      baseURL: productionBaseURL,
      headers: { "Content-Type": "application/json" },
      timeout: 5000,
    });

    // TODO: ADD MORE CLIENTS
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

  // Production microservice
  async getAllPlants(): Promise<any[]> {
    const response = await this.productionClient.get<any[]>("/production/plants");
    return response.data;
  }

  async getPlantById(id: number): Promise<any> {
    const response = await this.productionClient.get<any>(`/production/plants/${id}`);
    return response.data;
  }

  async createPlant(data: any): Promise<any> {
    const response = await this.productionClient.post<any>(`/production/plants`, data);
    return response.data;
  }

  async getAllPerfumes(): Promise<any[]> {
    const response = await this.productionClient.get<any[]>("/production/perfumes");
    return response.data;
  }

  async getPerfumeById(serial: string): Promise<any> {
    const response = await this.productionClient.get<any>(`/production/perfumes/${serial}`);
    return response.data;
  }

  async createPerfume(data: any): Promise<any> {
    const response = await this.productionClient.post<any>(`/production/perfumes`, data);
    return response.data;
  }

  async getAllStorages(): Promise<any[]> {
    const response = await this.productionClient.get<any[]>("/production/storages");
    return response.data;
  }

  async createStorage(data: any): Promise<any> {
    const response = await this.productionClient.post<any>(`/production/storages`, data);
    return response.data;
  }

  async createPackaging(data: any): Promise<any> {
    const response = await this.productionClient.post<any>(`/production/packaging`, data);
    return response.data;
  }

  async createReceipt(data: any): Promise<any> {
    const response = await this.productionClient.post<any>(`/production/receipts`, data);
    return response.data;
  }

  // TODO: ADD MORE API CALLS
}
