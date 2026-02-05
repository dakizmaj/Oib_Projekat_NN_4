import { Router, Request, Response } from "express";
import { IProcessingService } from "../../Domain/services/IProcessingService";
import { ILogerService } from "../../Domain/services/ILogerService";
import { ProcessingRequest } from "../../Domain/types/ProcessingTypes";
import { PerfumeType } from "../../Domain/enums/PerfumeType";

export class ProcessingController {
  private readonly router: Router;

  constructor(
    private readonly processingService: IProcessingService,
    private readonly logger: ILogerService
  ) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // Prerada biljaka
    this.router.post("/processing/start", this.startProcessing.bind(this));
    
    // Dobijanje parfema
    this.router.get("/perfumes", this.getAllPerfumes.bind(this));
    this.router.get("/perfumes/:id", this.getPerfumeById.bind(this));
    this.router.get("/perfumes/type/:type", this.getPerfumesByType.bind(this));
  }

  private async startProcessing(req: Request, res: Response): Promise<void> {
    try {
      const request: ProcessingRequest = req.body;

      // Validacija
      if (!request.perfumeName || !request.perfumeType || !request.quantity || !request.netVolume || !request.plantCommonName) {
        res.status(400).json({ message: "Svi podaci su obavezni" });
        return;
      }

      if (request.netVolume !== 150 && request.netVolume !== 250) {
        res.status(400).json({ message: "Neto zapremina mora biti 150ml ili 250ml" });
        return;
      }

      if (request.quantity <= 0) {
        res.status(400).json({ message: "Količina mora biti veća od 0" });
        return;
      }

      const result = await this.processingService.processPlants(request);
      res.status(200).json(result);
    } catch (err) {
      await this.logger.log(`Greška pri obradi: ${(err as Error).message}`, "ERROR");
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async getAllPerfumes(req: Request, res: Response): Promise<void> {
    try {
      const perfumes = await this.processingService.getAllPerfumes();
      res.status(200).json(perfumes);
    } catch (err) {
      await this.logger.log(`Greška pri dobijanju parfema: ${(err as Error).message}`, "ERROR");
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async getPerfumeById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id as string);
      const perfume = await this.processingService.getPerfumeById(id);

      if (!perfume) {
        res.status(404).json({ message: "Parfem nije pronađen" });
        return;
      }

      res.status(200).json(perfume);
    } catch (err) {
      await this.logger.log(`Greška pri dobijanju parfema: ${(err as Error).message}`, "ERROR");
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async getPerfumesByType(req: Request, res: Response): Promise<void> {
    try {
      const type = req.params.type as PerfumeType;
      const quantity = req.query.quantity ? parseInt(req.query.quantity as string) : undefined;

      const perfumes = await this.processingService.getPerfumes(type, quantity);
      res.status(200).json(perfumes);
    } catch (err) {
      await this.logger.log(`Greška pri dobijanju parfema po tipu: ${(err as Error).message}`, "ERROR");
      res.status(500).json({ message: (err as Error).message });
    }
  }

  getRouter(): Router {
    return this.router;
  }
}
