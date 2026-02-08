import { Request, Response, Router } from "express";
import { IGatewayService } from "../Domain/services/IGatewayService";
import { LoginUserDTO } from "../Domain/DTOs/LoginUserDTO";
import { RegistrationUserDTO } from "../Domain/DTOs/RegistrationUserDTO";
import { PlantDTO } from "../Domain/DTOs/PlantDTO";
import { ProcessingRequest } from "../Domain/types/ProcessingTypes";
import { authenticate } from "../Middlewares/authentification/AuthMiddleware";
import { authorize } from "../Middlewares/authorization/AuthorizeMiddleware";
import { PerfumeDTO } from "../Domain/DTOs/PerfumeDTO";
import { ReceiptDTO } from "../Domain/DTOs/ReceiptDTO";

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
  
    // Sales mikroservis
    this.router.get('/sales/catalog', this.getSalesCatalog.bind(this));
    this.router.post('/sales/sell', this.sellPerfumes.bind(this));
    
    // Data Analysis
    this.router.get('/data/reciepts', this.getAllReceipts.bind(this));
    this.router.post('/data/recipet', this.createRecipet.bind(this));
    this.router.get('/data/revenue', this.getRevenue.bind(this));
    this.router.get('/data/top',this.getTopTen.bind(this));
    this.router.get('/data/revenue/top', this.getTopTenRevenue.bind(this));
    this.router.get('/data/revenue/month', this.getRevenueByMonth.bind(this));
    this.router.get('/data/revenue/year', this.getRevenueByYear.bind(this));

    // Warehouse (NO AUTH for testing)
    this.router.get("/warehouses", this.getAllWarehouses.bind(this));
    this.router.get("/warehouses/:id", this.getWarehouseById.bind(this));
    this.router.get("/packages", this.getAllPackages.bind(this));
    this.router.get("/packages/warehouse/:warehouseId", this.getPackagesByWarehouse.bind(this));
    this.router.post("/packages/pack-perfumes", this.packPerfumes.bind(this)); // MUST be before /packages POST
    this.router.post("/packages/send", this.sendPackages.bind(this)); // MUST be before /packages POST
    this.router.post("/packages", this.createPackage.bind(this));

    // Logging (NO AUTH for testing)
    this.router.get("/logs", this.getAllLogs.bind(this));
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
      console.log("[Gateway] Processing request received:", JSON.stringify(request, null, 2));
      const result = await this.gatewayService.startProcessing(request);
      console.log("[Gateway] Processing result:", result);
      res.status(200).json(result);
    } catch (err) {
      console.error("[Gateway] Processing error:", err);
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

  // Sales mikroservis
  private async getSalesCatalog(req: Request, res: Response): Promise<void> {
    try {
      const catalog = await this.gatewayService.getSalesCatalog();
      res.status(200).json(catalog);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async sellPerfumes(req: Request, res: Response): Promise<void> {
    try {
      const { perfumeId, quantity, customerName } = req.body;
      const result = await this.gatewayService.sellPerfumes({ perfumeId, quantity, customerName });
      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  //Data Analysis
  private async createRecipet(req: Request, res:Response): Promise<void>{
    try{
      const data: ReceiptDTO = req.body;
      const reciept = await this.gatewayService.createReceipt(data);
      res.status(200).json(reciept);
    }catch (err){
      res.status(500).json({ message: (err as Error).message});
    }
  }

  private async getAllReceipts(req: Request, res:Response): Promise<void>{
    try{
      const receipts = await this.gatewayService.getAllReceipts();
      res.status(200).json(receipts);
    }catch (err){
      res.status(404).json({ message: (err as Error).message});
    }
  }

  private async getRevenue(req: Request, res:Response): Promise<void>{
    try{
      const revenue = await this.gatewayService.getRevenue();
      res.status(200).json(revenue);
    }catch (err){
      res.status(500).json({ message: (err as Error).message});
    }
  }

  private async getTopTen(req: Request, res:Response): Promise<void>{
    try{
      const topTen = await this.gatewayService.getTopTen();
      res.status(200).json(topTen);
    }catch (err){
      res.status(500).json({ message: (err as Error).message});
    }
  }

  private async getTopTenRevenue(req: Request, res:Response): Promise<void>{
    try{
      const revenue = await this.gatewayService.getTopTenRevenue();
      res.status(200).json(revenue);
    }catch (err){
      res.status(500).json({ message: (err as Error).message});
    }
  }
  private async getRevenueByMonth(req: Request, res:Response): Promise<void>{
    try{
      const revenue = await this.gatewayService.getRevenueByMonth();
      res.status(200).json(revenue);
    }catch (err){
      res.status(500).json({ message: (err as Error).message});
    }
  }

  private async getRevenueByYear(req: Request, res:Response): Promise<void>{
    try{
      const revenue = await this.gatewayService.getRevenueByYear();
      res.status(200).json(revenue);
    }catch (err){
      res.status(500).json({ message: (err as Error).message});
    }
  }

  // Warehouse
  private async getAllWarehouses(req: Request, res: Response): Promise<void> {
    try {
      const warehouses = await this.gatewayService.getAllWarehouses();
      res.status(200).json(warehouses);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async getWarehouseById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const warehouse = await this.gatewayService.getWarehouseById(id);
      res.status(200).json(warehouse);
    } catch (err) {
      res.status(404).json({ message: (err as Error).message });
    }
  }

  private async getAllPackages(req: Request, res: Response): Promise<void> {
    try {
      const packages = await this.gatewayService.getAllPackages();
      res.status(200).json(packages);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async getPackagesByWarehouse(req: Request, res: Response): Promise<void> {
    try {
      const warehouseId = parseInt(req.params.warehouseId);
      const packages = await this.gatewayService.getPackagesByWarehouse(warehouseId);
      res.status(200).json(packages);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async createPackage(req: Request, res: Response): Promise<void> {
    try {
      const packageData = req.body;
      const result = await this.gatewayService.createPackage(packageData);
      res.status(201).json(result);
    } catch (err) {
      res.status(400).json({ message: (err as Error).message });
    }
  }

  private async packPerfumes(req: Request, res: Response): Promise<void> {
    try {
      const request = req.body;
      const result = await this.gatewayService.packPerfumes(request);
      res.status(201).json(result);
    } catch (err) {
      res.status(400).json({ message: (err as Error).message });
    }
  }

  private async sendPackages(req: Request, res: Response): Promise<void> {
    try {
      const { warehouseId, packageIds, packIfNotAvailable, packParams } = req.body;
      
      const result = await this.gatewayService.sendPackages({
        warehouseId,
        packageIds,
        packIfNotAvailable,
        packParams
      });
      res.status(200).json(result);
    } catch (err) {
      res.status(400).json({ message: (err as Error).message });
    }
  }

  // Logging
  private async getAllLogs(req: Request, res: Response): Promise<void> {
    try {
      const logs = await this.gatewayService.getAllLogs();
      res.status(200).json(logs);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  public getRouter(): Router {
    return this.router;
  }
}
