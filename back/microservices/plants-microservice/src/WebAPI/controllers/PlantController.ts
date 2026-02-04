import { Router, Request, Response } from "express";
import { IPlantService } from "../../Domain/services/IPlantService";
import { ILogerService } from "../../Domain/services/ILogerService";
import { PlantDTO } from "../../Domain/DTOs/PlantDTO";

export class PlantController {
  private readonly router: Router;

  constructor(
    private readonly plantService: IPlantService,
    private readonly logger: ILogerService
  ) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // CRUD operacije
    this.router.get("/plants", this.getAllPlants.bind(this));
    this.router.get("/plants/:id", this.getPlantById.bind(this));
    this.router.post("/plants", this.plantNewPlant.bind(this));
    
    // Specifične operacije za proizvodnju
    this.router.post("/plants/harvest", this.harvestPlants.bind(this));
    this.router.put("/plants/:id/adjust-aroma", this.adjustAromaStrength.bind(this));
    this.router.get("/plants/available/:commonName", this.getAvailablePlantsForProcessing.bind(this));
    this.router.post("/plants/mark-processed", this.markPlantsAsProcessed.bind(this));
  }

  private async getAllPlants(req: Request, res: Response): Promise<void> {
    try {
      const plants = await this.plantService.getAllPlants();
      res.status(200).json(plants);
    } catch (err) {
      await this.logger.log(`Greška pri dobijanju svih biljaka: ${(err as Error).message}`, "ERROR");
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async getPlantById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id as string);
      const plant = await this.plantService.getPlantById(id);

      if (!plant) {
        res.status(404).json({ message: "Biljka nije pronađena" });
        return;
      }

      res.status(200).json(plant);
    } catch (err) {
      await this.logger.log(`Greška pri dobijanju biljke: ${(err as Error).message}`, "ERROR");
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async plantNewPlant(req: Request, res: Response): Promise<void> {
    try {
      const plantData: Omit<PlantDTO, 'id' | 'status' | 'createdAt'> = req.body;

      // Validacija
      if (!plantData.commonName || !plantData.latinName || !plantData.countryOfOrigin) {
        res.status(400).json({ message: "Svi obavezni podaci moraju biti prisutni" });
        return;
      }

      const plant = await this.plantService.plantNewPlant(plantData);
      res.status(201).json(plant);
    } catch (err) {
      await this.logger.log(`Greška pri sađenju nove biljke: ${(err as Error).message}`, "ERROR");
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async harvestPlants(req: Request, res: Response): Promise<void> {
    try {
      const { commonName, quantity } = req.body;

      if (!commonName || !quantity || quantity <= 0) {
        res.status(400).json({ message: "Naziv biljke i količina su obavezni" });
        return;
      }

      const plants = await this.plantService.harvestPlants(commonName, quantity);
      res.status(200).json(plants);
    } catch (err) {
      await this.logger.log(`Greška pri berbi biljaka: ${(err as Error).message}`, "ERROR");
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async adjustAromaStrength(req: Request, res: Response): Promise<void> {
    try {
      const plantId = parseInt(req.params.id as string);
      const { percentageChange } = req.body;

      if (percentageChange === undefined || percentageChange === null) {
        res.status(400).json({ message: "Procenat promene je obavezan" });
        return;
      }

      const plant = await this.plantService.adjustAromaStrength(plantId, percentageChange);
      res.status(200).json(plant);
    } catch (err) {
      await this.logger.log(`Greška pri promeni jačine arome: ${(err as Error).message}`, "ERROR");
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async getAvailablePlantsForProcessing(req: Request, res: Response): Promise<void> {
    try {
      const commonName = req.params.commonName as string;
      const plants = await this.plantService.getAvailablePlantsForProcessing(commonName);
      res.status(200).json(plants);
    } catch (err) {
      await this.logger.log(`Greška pri dobijanju dostupnih biljaka: ${(err as Error).message}`, "ERROR");
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async markPlantsAsProcessed(req: Request, res: Response): Promise<void> {
    try {
      const { plantIds } = req.body;

      if (!Array.isArray(plantIds) || plantIds.length === 0) {
        res.status(400).json({ message: "Lista ID-jeva biljaka je obavezna" });
        return;
      }

      await this.plantService.markPlantsAsProcessed(plantIds);
      res.status(200).json({ message: "Biljke su uspešno označene kao prerađene" });
    } catch (err) {
      await this.logger.log(`Greška pri označavanju biljaka: ${(err as Error).message}`, "ERROR");
      res.status(500).json({ message: (err as Error).message });
    }
  }

  getRouter(): Router {
    return this.router;
  }
}
