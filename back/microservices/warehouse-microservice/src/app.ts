import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { DataSource } from "typeorm";
import { Warehouse } from "./Domain/models/Warehouse";
import { Packaging } from "./Domain/models/Packaging";
import { PackageStatus } from "./Domain/enums/PackageStatus";
import { DistributedWarehouseService } from "./Services/DistributedWarehouseService";
import { MagazineWarehouseService } from "./Services/MagazineWarehouseService";
import { WarehouseController } from "./WebAPI/WarehouseController";
import { IWarehouseService } from "./Domain/services/IWarehouseService";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
export const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 3306,
  username: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "database_magacin",
  entities: [Warehouse, Packaging],
  synchronize: true,
  logging: false
});

// Initialize data source and setup routes
AppDataSource.initialize()
  .then(async () => {
    console.log("✅ Database connected successfully");

    const warehouseRepository = AppDataSource.getRepository(Warehouse);
    const packagingRepository = AppDataSource.getRepository(Packaging);

    // Seed warehouses if empty
    const count = await warehouseRepository.count();
    if (count === 0) {
      console.log("📦 Seeding warehouses...");
      await warehouseRepository.save([
        {
          name: "Glavno skladište Beograd",
          location: "Beograd, Novi Beograd",
          maxCapacity: 100,
          currentCapacity: 0
        },
        {
          name: "Skladište Niš",
          location: "Niš, Industrijska zona",
          maxCapacity: 50,
          currentCapacity: 0
        },
        {
          name: "Distributivni centar Novi Sad",
          location: "Novi Sad, Centar",
          maxCapacity: 75,
          currentCapacity: 0
        }
      ]);
      console.log("✅ Warehouses seeded");
    }

    // Seed test packages if empty
    const packageCount = await packagingRepository.count();
    if (packageCount === 0) {
      console.log("📦 Seeding test packages...");
      const warehouses = await warehouseRepository.find();
      
      const testPackages = [
        {
          packageId: "PKG-2026-001",
          sender: "Proizvodnja parfema",
          perfumeCount: 5,
          warehouseId: warehouses[0].id,
          destinationAddress: "Beograd, Kneza Miloša 10",
          packageStatus: PackageStatus.PACKSTATUS_PACKAGED
        },
        {
          packageId: "PKG-2026-002",
          sender: "Proizvodnja parfema",
          perfumeCount: 3,
          warehouseId: warehouses[0].id,
          destinationAddress: "Novi Sad, Bulevar oslobođenja 25",
          packageStatus: PackageStatus.PACKSTATUS_PACKAGED
        },
        {
          packageId: "PKG-2026-003",
          sender: "Proizvodnja parfema",
          perfumeCount: 8,
          warehouseId: warehouses[1].id,
          destinationAddress: "Niš, Trg kralja Aleksandra 5",
          packageStatus: PackageStatus.PACKSTATUS_PACKAGED
        },
        {
          packageId: "PKG-2026-004",
          sender: "Proizvodnja parfema",
          perfumeCount: 4,
          warehouseId: warehouses[2].id,
          destinationAddress: "Subotica, Korzo 12",
          packageStatus: PackageStatus.PACKSTATUS_PACKAGED
        },
        {
          packageId: "PKG-2026-005",
          sender: "Proizvodnja parfema",
          perfumeCount: 6,
          warehouseId: warehouses[2].id,
          destinationAddress: "Kragujevac, Trg Slobode 3",
          packageStatus: PackageStatus.PACKSTATUS_PACKAGED
        }
      ];

      await packagingRepository.save(testPackages);
      
      // Update warehouse capacities
      warehouses[0].currentCapacity = 2; // Beograd - 2 packages
      warehouses[1].currentCapacity = 1; // Niš - 1 package
      warehouses[2].currentCapacity = 2; // Novi Sad - 2 packages
      await warehouseRepository.save(warehouses);
      
      console.log("✅ Test packages seeded");
    }

    // Dependency injection based on user role (from environment or default)
    const userRole = process.env.USER_ROLE || "prodavac"; // "menadžer prodaje" or "prodavac"
    
    let warehouseService: IWarehouseService;

    if (userRole === "menadžer prodaje") {
      console.log("🚀 Using Distributivni Warehouse Strategy (3 packages, 0.5s)");
      warehouseService = new DistributedWarehouseService(warehouseRepository, packagingRepository);
    } else {
      console.log("📦 Using Magacinski Warehouse Strategy (1 package, 2.5s)");
      warehouseService = new MagazineWarehouseService(warehouseRepository, packagingRepository);
    }

    const controller = new WarehouseController(warehouseService);

    // Routes
    const router = express.Router();

    // Warehouse routes
    router.get("/warehouses", controller.getAllWarehouses);
    router.get("/warehouses/:id", controller.getWarehouseById);

    // Package routes
    router.get("/packages", controller.getAllPackages);
    router.get("/packages/warehouse/:warehouseId", controller.getPackagesByWarehouse);
    router.post("/packages", controller.createPackage);
    router.post("/packages/pack-perfumes", controller.packPerfumes);
    router.post("/packages/send", controller.sendPackages);

    app.use("/api/v1", router);

    // Health check
    app.get("/health", (req: Request, res: Response) => {
      res.status(200).json({ status: "OK", service: "warehouse-microservice" });
    });
  })
  .catch((error) => {
    console.error("❌ Error during Data Source initialization:", error);
    process.exit(1);
  });

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Error:", err);
  res.status(500).json({ error: "Internal server error" });
});

export default app;
