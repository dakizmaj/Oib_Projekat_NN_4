import { LoginUserDTO } from "../DTOs/LoginUserDTO";
import { RegistrationUserDTO } from "../DTOs/RegistrationUserDTO";
import { UserDTO } from "../DTOs/UserDTO";
import { AuthResponseType } from "../types/AuthResponse";

export interface IGatewayService {
  // Auth
  login(data: LoginUserDTO): Promise<AuthResponseType>;
  register(data: RegistrationUserDTO): Promise<AuthResponseType>;

  // Users
  getAllUsers(): Promise<UserDTO[]>;
  getUserById(id: number): Promise<UserDTO>;

  // Production microservice
  getAllPlants(): Promise<any[]>;
  getPlantById(id: number): Promise<any>;
  createPlant(data: any): Promise<any>;

  getAllPerfumes(): Promise<any[]>;
  getPerfumeById(serial: string): Promise<any>;
  createPerfume(data: any): Promise<any>;

  getAllStorages(): Promise<any[]>;
  createStorage(data: any): Promise<any>;

  createPackaging(data: any): Promise<any>;
  createReceipt(data: any): Promise<any>;
}
