import axios, { AxiosInstance, AxiosResponse } from "axios";
import { PerfumeDTO } from "../../models/perfumes/PerfumeDTO";
import { ProcessingRequest, ProcessingResult } from "../../models/processing/ProcessingTypes";
import { IProcessingAPI } from "./IProcessingAPI";

export class ProcessingAPI implements IProcessingAPI {
  private readonly axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: import.meta.env.VITE_GATEWAY_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  private getAuthHeaders(token: string) {
    return { Authorization: `Bearer ${token}` };
  }

  async startProcessing(request: ProcessingRequest, token: string): Promise<ProcessingResult> {
    console.log("ProcessingAPI - Starting processing with:", {
      baseURL: this.axiosInstance.defaults.baseURL,
      endpoint: "/processing/start",
      request,
      hasToken: !!token
    });
    
    const response: AxiosResponse<ProcessingResult> = await this.axiosInstance.post(
      "/processing/start",
      request,
      { headers: this.getAuthHeaders(token) }
    );
    
    console.log("ProcessingAPI - Response:", response.data);
    return response.data;
  }

  async getAllPerfumes(token: string): Promise<PerfumeDTO[]> {
    const response: AxiosResponse<PerfumeDTO[]> = await this.axiosInstance.get("/perfumes", {
      headers: this.getAuthHeaders(token),
    });
    return response.data;
  }

  async getPerfumeById(id: number, token: string): Promise<PerfumeDTO> {
    const response: AxiosResponse<PerfumeDTO> = await this.axiosInstance.get(`/perfumes/${id}`, {
      headers: this.getAuthHeaders(token),
    });
    return response.data;
  }

  async getPerfumesByType(type: string, token: string): Promise<PerfumeDTO[]> {
    const response: AxiosResponse<PerfumeDTO[]> = await this.axiosInstance.get(`/perfumes/type/${type}`, {
      headers: this.getAuthHeaders(token),
    });
    return response.data;
  }
}
