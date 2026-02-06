import { LoginUserDTO } from "../DTOs/LoginUserDTO";
import { RegistrationUserDTO } from "../DTOs/RegistrationUserDTO";
import { UserDTO } from "../DTOs/UserDTO";
import { PlantDTO } from "../DTOs/PlantDTO";
import { PerfumeDTO } from "../DTOs/PerfumeDTO";
import { AuthResponseType } from "../types/AuthResponse";
import { ProcessingRequest, ProcessingResult } from "../types/ProcessingTypes";

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
}
