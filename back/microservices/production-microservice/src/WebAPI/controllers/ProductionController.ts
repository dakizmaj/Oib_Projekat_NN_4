import { Request, Response, Router } from "express";
import { IProductionService } from "../../Domain/services/IProductionService";
import { ILogerService } from "../../Domain/services/ILogerService";

export class ProductionController {
  private router: Router;

  constructor(private service: IProductionService, private logger: ILogerService) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // Plants
    this.router.get('/production/plants', this.getAllPlants.bind(this));
    this.router.post('/production/plants', this.createPlant.bind(this));

    // Perfumes
    this.router.get('/production/perfumes', this.getAllPerfumes.bind(this));
    this.router.get('/production/perfumes/:serial', this.getPerfume.bind(this));
    this.router.post('/production/perfumes', this.createPerfume.bind(this));

    // Storages
    this.router.get('/production/storages', this.getAllStorages.bind(this));
    this.router.post('/production/storages', this.createStorage.bind(this));

    // Packaging
    this.router.post('/production/packaging', this.createPackaging.bind(this));

    // Receipts
    this.router.post('/production/receipts', this.createReceipt.bind(this));
  }

  private async getAllPlants(req: Request, res: Response): Promise<void> {
    try {
      const items = await this.service.getAllPlants();
      res.status(200).json(items);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  }

  private async createPlant(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body;
      const item = await this.service.createPlant(data);
      res.status(201).json(item);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  }

  private async getAllPerfumes(req: Request, res: Response): Promise<void> {
    try {
      const items = await this.service.getAllPerfumes();
      res.status(200).json(items);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  }

  private async getPerfume(req: Request, res: Response): Promise<void> {
    try {
      const serial = req.params.serial;
      const item = await this.service.getPerfumeById(serial);
      res.status(200).json(item);
    } catch (err: any) {
      res.status(404).json({ message: err.message });
    }
  }

  private async createPerfume(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body;
      const item = await this.service.createPerfume(data);
      res.status(201).json(item);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  }

  private async getAllStorages(req: Request, res: Response): Promise<void> {
    try {
      const items = await this.service.getAllStorages();
      res.status(200).json(items);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  }

  private async createStorage(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body;
      const item = await this.service.createStorage(data);
      res.status(201).json(item);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  }

  private async createPackaging(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body;
      const item = await this.service.createPackaging(data);
      res.status(201).json(item);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  }

  private async createReceipt(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body;
      const item = await this.service.createReceipt(data);
      res.status(201).json(item);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  }

  public getRouter(): Router {
    return this.router;
  }
}
