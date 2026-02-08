import { Repository, In } from "typeorm";
import { Result, ok, err } from "neverthrow";
import { Warehouse } from "../Domain/models/Warehouse";
import { Packaging } from "../Domain/models/Packaging";
import { PackagingDTO } from "../Domain/DTOs/PackagingDTO";
import { WarehouseDTO } from "../Domain/DTOs/WarehouseDTO";
import { IWarehouseService, SendPackagesRequest } from "../Domain/services/IWarehouseService";
import { PackageStatus } from "../Domain/enums/PackageStatus";
import axios from "axios";

/**
 * Distributivni centar strategy
 * - Šalje 3 ambalaže odjednom
 * - Vreme nabavke ambalaže: 0.5 sekundi
 */
export class DistributedWarehouseService implements IWarehouseService {
  private readonly PACKAGES_PER_SEND = 3;
  private readonly PROCUREMENT_TIME_MS = 500; // 0.5 seconds
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
   * Distributivni strategy: Šalje do 3 ambalaže odjednom sa 0.5s vremenom nabavke po ambalaži
   * Ako nema dostupne ambalaže i packIfNotAvailable=true, automatski pakuje parfeme
   */
  async sendPackages(request: SendPackagesRequest): Promise<Result<{ message: string; sentCount: number }, Error>> {
    try {
      const { warehouseId, packageIds, packIfNotAvailable = false, packParams } = request;

      // Find available PACKAGED packages
      let packages = await this.packagingRepository.find({ 
        where: { 
          packageStatus: PackageStatus.PACKSTATUS_PACKAGED,
          ...(warehouseId && { warehouseId })
        },
        relations: ['warehouse']
      });

      // Filter by specific packageIds if provided
      if (packageIds && packageIds.length > 0) {
        packages = packages.filter(pkg => packageIds.includes(pkg.packageId));
      }

      // If no packages available and auto-pack is enabled
      if (packages.length === 0 && packIfNotAvailable && packParams) {
        await this.logAction('AUTO_PACK_START', `No packages available, auto-packing perfumes`);
        
        const packResult = await this.packPerfumes(packParams);
        if (packResult.isErr()) {
          return err(new Error(`Auto-pack failed: ${packResult.error.message}`));
        }

        // Reload packages
        packages = await this.packagingRepository.find({ 
          where: { 
            packageStatus: PackageStatus.PACKSTATUS_PACKAGED,
            ...(warehouseId && { warehouseId })
          },
          relations: ['warehouse']
        });
      }
      
      if (packages.length === 0) {
        return err(new Error("No packages available to send. Enable auto-pack or create packages first."));
      }

      // Distributivni strategy: Process in batches of 3
      const batches: Packaging[][] = [];
      for (let i = 0; i < packages.length; i += this.PACKAGES_PER_SEND) {
        batches.push(packages.slice(i, i + this.PACKAGES_PER_SEND));
      }

      let totalSent = 0;

      for (const batch of batches) {
        // Simulate procurement time for each package in batch (parallel)
        const procurementPromises = batch.map(() => 
          new Promise(resolve => setTimeout(resolve, this.PROCUREMENT_TIME_MS))
        );
        await Promise.all(procurementPromises);

        // Mark as SENT
        for (const pkg of batch) {
          pkg.packageStatus = PackageStatus.PACKSTATUS_SENT;
          await this.packagingRepository.save(pkg);

          // Update warehouse capacity
          const warehouse = await this.warehouseRepository.findOne({ where: { id: pkg.warehouseId } });
          if (warehouse) {
            warehouse.currentCapacity = Math.max(0, warehouse.currentCapacity - 1);
            await this.warehouseRepository.save(warehouse);
          }

          totalSent++;
          await this.logAction('SEND_PACKAGE', `Package ${pkg.packageId} sent (Distributivni strategy)`);
        }
      }

      return ok({ 
        message: `Successfully sent ${totalSent} packages using Distributivni centar strategy`,
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
        type: action,
        description: `[warehouse] ${details}`
      });
    } catch (error) {
      console.error('Failed to log action:', error);
    }
  }
}