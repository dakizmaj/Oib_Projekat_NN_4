import { Repository, In } from "typeorm";
import { Result, ok, err } from "neverthrow";
import { Warehouse } from "../Domain/models/Warehouse";
import { Packaging } from "../Domain/models/Packaging";
import { PackagingDTO } from "../Domain/DTOs/PackagingDTO";
import { WarehouseDTO } from "../Domain/DTOs/WarehouseDTO";
import { IWarehouseService } from "../Domain/services/IWarehouseService";
import { PackageStatus } from "../Domain/enums/PackageStatus";
import axios from "axios";

/**
 * Magacinski centar strategy
 * - Šalje 1 ambalažu odjednom
 * - Vreme nabavke ambalaže: 2.5 sekundi
 */
export class MagazineWarehouseService implements IWarehouseService {
  private readonly PACKAGES_PER_SEND = 1;
  private readonly PROCUREMENT_TIME_MS = 2500; // 2.5 seconds
  private readonly LOGGING_URL = process.env.LOGGING_SERVICE_URL || "http://localhost:5002/api/v1";
  private readonly PROCESSING_URL = process.env.PROCESSING_SERVICE_URL || "http://localhost:5004/api/v1";

  constructor(
    private warehouseRepository: Repository<Warehouse>,
    private packagingRepository: Repository<Packaging>
  ) {}

  async getAllWarehouses(): Promise<Result<WarehouseDTO[], Error>> {
    try {
      const warehouses = await this.warehouseRepository.find();
      const dtos: WarehouseDTO[] = warehouses.map(w => this.mapWarehouseToDTO(w));
      return ok(dtos);
    } catch (error) {
      return err(new Error(`Failed to get warehouses: ${error}`));
    }
  }

  async getWarehouseById(id: number): Promise<Result<WarehouseDTO, Error>> {
    try {
      const warehouse = await this.warehouseRepository.findOne({ where: { id } });
      if (!warehouse) {
        return err(new Error("Warehouse not found"));
      }
      return ok(this.mapWarehouseToDTO(warehouse));
    } catch (error) {
      return err(new Error(`Failed to get warehouse: ${error}`));
    }
  }

  async getAllPackages(): Promise<Result<PackagingDTO[], Error>> {
    try {
      const packages = await this.packagingRepository.find({ relations: ['warehouse'] });
      const dtos: PackagingDTO[] = packages.map(p => this.mapPackagingToDTO(p));
      return ok(dtos);
    } catch (error) {
      return err(new Error(`Failed to get packages: ${error}`));
    }
  }

  async getPackagesByWarehouse(warehouseId: number): Promise<Result<PackagingDTO[], Error>> {
    try {
      const packages = await this.packagingRepository.find({ 
        where: { warehouseId },
        relations: ['warehouse']
      });
      const dtos: PackagingDTO[] = packages.map(p => this.mapPackagingToDTO(p));
      return ok(dtos);
    } catch (error) {
      return err(new Error(`Failed to get packages for warehouse: ${error}`));
    }
  }

  async createPackage(packageData: Omit<PackagingDTO, 'id' | 'createdAt'>): Promise<Result<PackagingDTO, Error>> {
    try {
      // Check warehouse capacity
      const warehouse = await this.warehouseRepository.findOne({ where: { id: packageData.warehouseId } });
      if (!warehouse) {
        return err(new Error("Warehouse not found"));
      }

      if (warehouse.currentCapacity >= warehouse.maxCapacity) {
        return err(new Error(`Warehouse ${warehouse.name} is at full capacity`));
      }

      // Create package
      const packaging = this.packagingRepository.create({
        packageId: packageData.packageId,
        sender: packageData.sender,
        perfumeCount: packageData.perfumeCount,
        destinationAddress: packageData.destinationAddress,
        warehouseId: packageData.warehouseId,
        packageStatus: PackageStatus.PACKSTATUS_PACKAGED
      });

      const saved = await this.packagingRepository.save(packaging);

      // Update warehouse capacity
      warehouse.currentCapacity += 1;
      await this.warehouseRepository.save(warehouse);

      // Log action
      await this.logAction('CREATE_PACKAGE', `Package ${saved.packageId} created in warehouse ${warehouse.name}`);

      const result = await this.packagingRepository.findOne({ 
        where: { id: saved.id },
        relations: ['warehouse']
      });

      return ok(this.mapPackagingToDTO(result!));
    } catch (error) {
      return err(new Error(`Failed to create package: ${error}`));
    }
  }

  /**
   * Pakuje parfeme - poziva processing mikroservis da napravi parfeme, 
   * zatim ih pakuje u ambalažu
   */
  async packPerfumes(request: { 
    perfumeType: string; 
    quantity: number; 
    netVolume: number; 
    warehouseId: number; 
    sender: string; 
    destinationAddress: string;
    plantCommonName: string;
  }): Promise<Result<PackagingDTO, Error>> {
    try {
      // 1. Check warehouse exists and has capacity
      const warehouse = await this.warehouseRepository.findOne({ where: { id: request.warehouseId } });
      if (!warehouse) {
        return err(new Error("Warehouse not found"));
      }

      if (warehouse.currentCapacity >= warehouse.maxCapacity) {
        return err(new Error(`Warehouse ${warehouse.name} is at full capacity`));
      }

      // 2. Call processing microservice to create perfumes
      await this.logAction('PACK_PERFUMES_START', `Requesting ${request.quantity}x ${request.netVolume}ml ${request.perfumeType} perfumes from processing`);
      
      const processingResponse = await axios.post(`${this.PROCESSING_URL}/processing/start`, {
        perfumeName: request.perfumeType,
        perfumeType: request.perfumeType,
        quantity: request.quantity,
        netVolume: request.netVolume,
        plantCommonName: request.plantCommonName
      });

      const perfumeIds = processingResponse.data.perfumes?.map((p: any) => p.id) || [];
      
      await this.logAction('PACK_PERFUMES_RECEIVED', `Received ${perfumeIds.length} perfumes from processing: [${perfumeIds.join(',')}]`);

      // 3. Create package with perfume IDs
      const packageId = `PKG-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      
      const packaging = this.packagingRepository.create({
        packageId: packageId,
        sender: request.sender,
        perfumeCount: perfumeIds.length,
        perfumeIds: JSON.stringify(perfumeIds), // Store perfume IDs as JSON array
        destinationAddress: request.destinationAddress,
        warehouseId: request.warehouseId,
        packageStatus: PackageStatus.PACKSTATUS_PACKAGED
      });

      const saved = await this.packagingRepository.save(packaging);

      // 4. Update warehouse capacity
      warehouse.currentCapacity += 1;
      await this.warehouseRepository.save(warehouse);

      await this.logAction('PACK_PERFUMES_COMPLETE', `Package ${packageId} created with ${perfumeIds.length} perfumes in warehouse ${warehouse.name}`);

      const result = await this.packagingRepository.findOne({ 
        where: { id: saved.id },
        relations: ['warehouse']
      });

      return ok(this.mapPackagingToDTO(result!));
    } catch (error) {
      await this.logAction('PACK_PERFUMES_ERROR', `Failed to pack perfumes: ${(error as Error).message}`);
      return err(new Error(`Failed to pack perfumes: ${error}`));
    }
  }

  /**
   * Magacinski strategy: Šalje po 1 ambalažu sa 2.5s vremenom nabavke
   */
  async sendPackages(packageIds: number[]): Promise<Result<{ message: string; sentCount: number }, Error>> {
    try {
      if (packageIds.length === 0) {
        return err(new Error("No packages to send"));
      }

      // Fetch packages
      const packages = await this.packagingRepository.find({ 
        where: { id: In(packageIds) },
        relations: ['warehouse']
      });
      
      if (packages.length === 0) {
        return err(new Error("No valid packages found"));
      }

      // Check all are PACKAGED status
      const invalidPackages = packages.filter(p => p.packageStatus !== PackageStatus.PACKSTATUS_PACKAGED);
      if (invalidPackages.length > 0) {
        return err(new Error("Some packages are not in PACKAGED status"));
      }

      let totalSent = 0;

      // Magacinski strategy: Process one by one sequentially
      for (const pkg of packages) {
        // Simulate procurement time (sequential, not parallel)
        await new Promise(resolve => setTimeout(resolve, this.PROCUREMENT_TIME_MS));

        // Mark as SENT
        pkg.packageStatus = PackageStatus.PACKSTATUS_SENT;
        await this.packagingRepository.save(pkg);

        // Update warehouse capacity
        const warehouse = await this.warehouseRepository.findOne({ where: { id: pkg.warehouseId } });
        if (warehouse) {
          warehouse.currentCapacity = Math.max(0, warehouse.currentCapacity - 1);
          await this.warehouseRepository.save(warehouse);
        }

        totalSent++;
        await this.logAction('SEND_PACKAGE', `Package ${pkg.packageId} sent (Magacinski strategy)`);
      }

      return ok({ 
        message: `Successfully sent ${totalSent} packages using Magacinski centar strategy`,
        sentCount: totalSent
      });
    } catch (error) {
      return err(new Error(`Failed to send packages: ${error}`));
    }
  }

  private mapWarehouseToDTO(warehouse: Warehouse): WarehouseDTO {
    return {
      id: warehouse.id,
      name: warehouse.name,
      location: warehouse.location,
      maxCapacity: warehouse.maxCapacity,
      currentCapacity: warehouse.currentCapacity
    };
  }

  private mapPackagingToDTO(packaging: Packaging): PackagingDTO {
    return {
      id: packaging.id,
      packageId: packaging.packageId,
      sender: packaging.sender,
      perfumeCount: packaging.perfumeCount,
      perfumeIds: packaging.perfumeIds,
      warehouseId: packaging.warehouseId,
      warehouseName: packaging.warehouse?.name,
      destinationAddress: packaging.destinationAddress,
      packageStatus: packaging.packageStatus,
      createdAt: packaging.createdAt
    };
  }

  private async logAction(action: string, details: string): Promise<void> {
    try {
      await axios.post(`${this.LOGGING_URL}/logs`, {
        service: 'warehouse-microservice',
        action,
        details,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to log action:', error);
    }
  }
}