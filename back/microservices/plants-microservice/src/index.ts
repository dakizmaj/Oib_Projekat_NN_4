import app from "./app";
import { initialize_database } from "./Database/InitializeConnection";
import { Db } from "./Database/DbConnectionPool";
import { Plant } from "./Domain/models/Plant";
import { IPlantService } from "./Domain/services/IPlantService";
import { PlantService } from "./Services/PlantService";
import { ILogerService } from "./Domain/services/ILogerService";
import { LogerService } from "./Services/LogerService";
import { PlantController } from "./WebAPI/controllers/PlantController";
import { Repository } from "typeorm";

const port = process.env.PORT || 5003;

async function startServer() {
  try {
    // Initialize database first
    await initialize_database();

    // ORM Repositories - get after DB is initialized
    const plantRepository: Repository<Plant> = Db.getRepository(Plant);

    // Services
    const logerService: ILogerService = new LogerService();
    const plantService: IPlantService = new PlantService(plantRepository, logerService);

    // WebAPI routes
    const plantController = new PlantController(plantService, logerService);

    // Registering routes
    app.use('/api/v1', plantController.getRouter());

    // Then start listening
    const server = app.listen(port, () => {
      console.log(`\x1b[32m[TCPListen@Plants]\x1b[0m localhost:${port}`);
    });

    // Handle server errors
    server.on('error', (error: any) => {
      console.error('\x1b[31m[Server Error]\x1b[0m', error);
      process.exit(1);
    });

  } catch (err) {
    console.error("\x1b[31m[Startup Error]\x1b[0m", err);
    process.exit(1);
  }
}

startServer();
