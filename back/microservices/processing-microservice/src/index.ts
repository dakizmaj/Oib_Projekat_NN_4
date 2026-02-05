import app from "./app";
import { initialize_database } from "./Database/InitializeConnection";
import { Db } from "./Database/DbConnectionPool";
import { Perfume } from "./Domain/models/Perfume";
import { IProcessingService } from "./Domain/services/IProcessingService";
import { ProcessingService } from "./Services/ProcessingService";
import { ILogerService } from "./Domain/services/ILogerService";
import { LogerService } from "./Services/LogerService";
import { ProcessingController } from "./WebAPI/controllers/ProcessingController";
import { Repository } from "typeorm";

const port = process.env.PORT || 5004;

async function startServer() {
  // Initialize database first
  await initialize_database();

  // ORM Repositories - get after DB is initialized
  const perfumeRepository: Repository<Perfume> = Db.getRepository(Perfume);

  // Services
  const logerService: ILogerService = new LogerService();
  const processingService: IProcessingService = new ProcessingService(perfumeRepository, logerService);

  // WebAPI routes
  const processingController = new ProcessingController(processingService, logerService);

  // Registering routes
  app.use('/api/v1', processingController.getRouter());

  // Then start listening
  app.listen(port, () => {
    console.log(`\x1b[32m[TCPListen@Processing]\x1b[0m localhost:${port}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
