import { Request, Response } from "express";
import { IWarehouseService } from "../Domain/services/IWarehouseService";

export class WarehouseController {
  constructor(private warehouseService: IWarehouseService) {}

  // GET /warehouses - Get all warehouses
  getAllWarehouses = async (req: Request, res: Response): Promise<void> => {
    const result = await this.warehouseService.getAllWarehouses();
    
    if (result.isErr()) {
      res.status(500).json({ error: result.error.message });
      return;
    }

    res.status(200).json(result.value);
  };

  // GET /warehouses/:id - Get warehouse by ID
  getWarehouseById = async (req: Request, res: Response): Promise<void> => {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid warehouse ID" });
      return;
    }

    const result = await this.warehouseService.getWarehouseById(id);
    
    if (result.isErr()) {
      res.status(404).json({ error: result.error.message });
      return;
    }

    res.status(200).json(result.value);
  };

  // GET /packages - Get all packages
  getAllPackages = async (req: Request, res: Response): Promise<void> => {
    const result = await this.warehouseService.getAllPackages();
    
    if (result.isErr()) {
      res.status(500).json({ error: result.error.message });
      return;
    }

    res.status(200).json(result.value);
  };

  // GET /packages/warehouse/:warehouseId - Get packages by warehouse
  getPackagesByWarehouse = async (req: Request, res: Response): Promise<void> => {
    const warehouseId = parseInt(req.params.warehouseId);
    
    if (isNaN(warehouseId)) {
      res.status(400).json({ error: "Invalid warehouse ID" });
      return;
    }

    const result = await this.warehouseService.getPackagesByWarehouse(warehouseId);
    
    if (result.isErr()) {
      res.status(500).json({ error: result.error.message });
      return;
    }

    res.status(200).json(result.value);
  };

  // POST /packages - Create a new package
  createPackage = async (req: Request, res: Response): Promise<void> => {
    const { packageId, sender, perfumeCount, warehouseId, destinationAddress, packageStatus } = req.body;

    if (!packageId || !sender || !perfumeCount || !warehouseId || !destinationAddress || !packageStatus) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const result = await this.warehouseService.createPackage({
      packageId,
      sender,
      perfumeCount,
      warehouseId,
      destinationAddress,
      packageStatus
    });

    if (result.isErr()) {
      res.status(400).json({ error: result.error.message });
      return;
    }

    res.status(201).json(result.value);
  };

  // POST /packages/pack-perfumes - Pack perfumes (calls processing microservice)
  packPerfumes = async (req: Request, res: Response): Promise<void> => {
    const { perfumeType, quantity, netVolume, warehouseId, sender, destinationAddress, plantCommonName } = req.body;

    if (!perfumeType || !quantity || !netVolume || !warehouseId || !sender || !destinationAddress || !plantCommonName) {
      res.status(400).json({ error: "Missing required fields: perfumeType, quantity, netVolume, warehouseId, sender, destinationAddress, plantCommonName" });
      return;
    }

    const result = await this.warehouseService.packPerfumes({
      perfumeType,
      quantity,
      netVolume,
      warehouseId,
      sender,
      destinationAddress,
      plantCommonName
    });

    if (result.isErr()) {
      res.status(400).json({ error: result.error.message });
      return;
    }

    res.status(201).json(result.value);
  };

  // POST /packages/send - Send packages (uses strategy based on user role)
  sendPackages = async (req: Request, res: Response): Promise<void> => {
    const { packageIds } = req.body;

    if (!Array.isArray(packageIds) || packageIds.length === 0) {
      res.status(400).json({ error: "packageIds must be a non-empty array" });
      return;
    }

    const result = await this.warehouseService.sendPackages(packageIds);

    if (result.isErr()) {
      res.status(400).json({ error: result.error.message });
      return;
    }

    res.status(200).json(result.value);
  };
}
