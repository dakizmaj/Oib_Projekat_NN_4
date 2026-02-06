import { Request, Response, Router } from "express";
import { IGatewayService } from "../Domain/services/IGatewayService";
import { LoginUserDTO } from "../Domain/DTOs/LoginUserDTO";
import { RegistrationUserDTO } from "../Domain/DTOs/RegistrationUserDTO";
import { PlantDTO } from "../Domain/DTOs/PlantDTO";
import { ProcessingRequest } from "../Domain/types/ProcessingTypes";
import { authenticate } from "../Middlewares/authentification/AuthMiddleware";
import { authorize } from "../Middlewares/authorization/AuthorizeMiddleware";

export class GatewayController {
  private readonly router: Router;

  constructor(private readonly gatewayService: IGatewayService) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // Auth
    this.router.post("/login", this.login.bind(this));
    this.router.post("/register", this.register.bind(this));

    // Users
    this.router.get("/users", authenticate, authorize("administrator"), this.getAllUsers.bind(this));
    this.router.get("/users/:id", authenticate, authorize("administrator", "menadzer_prodaje", "prodavac"), this.getUserById.bind(this));

    // Plants (NO AUTH for testing)
    this.router.get("/plants", this.getAllPlants.bind(this));
    this.router.get("/plants/:id", this.getPlantById.bind(this));
    this.router.post("/plants", this.plantNewPlant.bind(this));
    this.router.post("/plants/harvest", this.harvestPlants.bind(this));
    this.router.put("/plants/:id/adjust-aroma", this.adjustAromaStrength.bind(this));

    // Processing (NO AUTH for testing)
    this.router.post("/processing/start", this.startProcessing.bind(this));
    this.router.get("/perfumes", this.getAllPerfumes.bind(this));
    this.router.get("/perfumes/:id", this.getPerfumeById.bind(this));
    this.router.get("/perfumes/type/:type", this.getPerfumesByType.bind(this));
  }

  // Auth
  private async login(req: Request, res: Response): Promise<void> {
    const data: LoginUserDTO = req.body;
    const result = await this.gatewayService.login(data);
    res.status(200).json(result);
  }

  private async register(req: Request, res: Response): Promise<void> {
    const data: RegistrationUserDTO = req.body;
    const result = await this.gatewayService.register(data);
    res.status(200).json(result);
  }

  // Users
  private async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const users = await this.gatewayService.getAllUsers();
      res.status(200).json(users);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (!req.user || req.user.id !== id) {
        res.status(401).json({ message: "You can only access your own data!" });
        return;
      }

      const user = await this.gatewayService.getUserById(id);
      res.status(200).json(user);
    } catch (err) {
      res.status(404).json({ message: (err as Error).message });
    }
  }

  // Plants
  private async getAllPlants(req: Request, res: Response): Promise<void> {
    try {
      const plants = await this.gatewayService.getAllPlants();
      res.status(200).json(plants);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async getPlantById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id as string);
      const plant = await this.gatewayService.getPlantById(id);
      res.status(200).json(plant);
    } catch (err) {
      res.status(404).json({ message: (err as Error).message });
    }
  }

  private async plantNewPlant(req: Request, res: Response): Promise<void> {
    try {
      const data: Omit<PlantDTO, 'id' | 'status' | 'createdAt'> = req.body;
      const plant = await this.gatewayService.plantNewPlant(data);
      res.status(201).json(plant);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async harvestPlants(req: Request, res: Response): Promise<void> {
    try {
      const { commonName, quantity } = req.body;
      const plants = await this.gatewayService.harvestPlants(commonName, quantity);
      res.status(200).json(plants);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async adjustAromaStrength(req: Request, res: Response): Promise<void> {
    try {
      const plantId = parseInt(req.params.id as string);
      const { percentageChange } = req.body;
      const plant = await this.gatewayService.adjustAromaStrength(plantId, percentageChange);
      res.status(200).json(plant);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  // Processing
  private async startProcessing(req: Request, res: Response): Promise<void> {
    try {
      const request: ProcessingRequest = req.body;
      const result = await this.gatewayService.startProcessing(request);
      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async getAllPerfumes(req: Request, res: Response): Promise<void> {
    try {
      const perfumes = await this.gatewayService.getAllPerfumes();
      res.status(200).json(perfumes);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async getPerfumeById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id as string);
      const perfume = await this.gatewayService.getPerfumeById(id);
      res.status(200).json(perfume);
    } catch (err) {
      res.status(404).json({ message: (err as Error).message });
    }
  }

  private async getPerfumesByType(req: Request, res: Response): Promise<void> {
    try {
      const type = req.params.type as string;
      const perfumes = await this.gatewayService.getPerfumesByType(type);
      res.status(200).json(perfumes);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  public getRouter(): Router {
    return this.router;
  }
}
