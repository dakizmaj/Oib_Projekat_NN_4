import { Repository } from "typeorm";
import axios, { AxiosInstance } from "axios";
import { Perfume } from "../Domain/models/Perfume";
import { PerfumeDTO } from "../Domain/DTOs/PerfumeDTO";
import { IProcessingService } from "../Domain/services/IProcessingService";
import { ILogerService } from "../Domain/services/ILogerService";
import { ProcessingRequest, ProcessingResult } from "../Domain/types/ProcessingTypes";
import { PerfumeType } from "../Domain/enums/PerfumeType";

interface PlantDTO {
  id: number;
  commonName: string;
  aromaStrength: number;
  latinName: string;
  countryOfOrigin: string;
  status: string;
}

export class ProcessingService implements IProcessingService {
  private readonly plantsClient: AxiosInstance;

  constructor(
    private readonly perfumeRepository: Repository<Perfume>,
    private readonly logger: ILogerService
  ) {
    const plantsServiceUrl = process.env.PLANTS_SERVICE_URL || "http://localhost:5003/api/v1";
    this.plantsClient = axios.create({
      baseURL: plantsServiceUrl,
      headers: { "Content-Type": "application/json" },
      timeout: 10000,
    });
  }

  async processPlants(request: ProcessingRequest): Promise<ProcessingResult> {
    try {
      await this.logger.log(
        `Započeta prerada: ${request.quantity}x ${request.netVolume}ml ${request.perfumeName}`,
        "INFO"
      );

      // Izračunaj potrebnu količinu biljaka
      // 1 biljka = 50ml parfema
      const totalMlNeeded = request.quantity * request.netVolume;
      const plantsNeeded = Math.ceil(totalMlNeeded / 50);

      await this.logger.log(
        `Potrebno ${plantsNeeded} biljaka za ${totalMlNeeded}ml parfema`,
        "INFO"
      );

      // Uberi biljke iz plants mikroservisa
      const harvestedPlants = await this.harvestPlantsFromService(request.plantCommonName, plantsNeeded);

      if (harvestedPlants.length < plantsNeeded) {
        await this.logger.log(
          `Nedovoljno biljaka! Dostupno: ${harvestedPlants.length}, potrebno: ${plantsNeeded}`,
          "ERROR"
        );
        throw new Error(`Nedovoljno biljaka za preradu. Potrebno: ${plantsNeeded}, dostupno: ${harvestedPlants.length}`);
      }

      // Proveri jačinu arome i balansiraj ako treba
      console.log('🔍 Provera jačine arome za', harvestedPlants.length, 'biljaka...');
      for (const plant of harvestedPlants) {
        console.log(`   Biljka ${plant.commonName} (ID: ${plant.id}): aromaStrength = ${plant.aromaStrength}`);
        if (plant.aromaStrength > 4.0) {
          console.log(`   ⚠️  PREKORAČENJE! Pokretanje balansiranja...`);
          await this.balanceAroma(plant);
        }
      }

      // Označi biljke kao prerađene
      await this.markPlantsAsProcessed(harvestedPlants.map(p => p.id));

      // Kreiraj parfeme
      const perfumes: PerfumeDTO[] = [];
      const currentYear = new Date().getFullYear();

      for (let i = 0; i < request.quantity; i++) {
        const perfume = this.perfumeRepository.create({
          name: request.perfumeName,
          type: request.perfumeType,
          netVolume: request.netVolume,
          plantId: harvestedPlants[i % harvestedPlants.length].id,
          expirationDate: this.calculateExpirationDate(),
        });

        const savedPerfume = await this.perfumeRepository.save(perfume);

        // Generiši serijski broj nakon što dobijemo ID
        savedPerfume.serialNumber = `PP-${currentYear}-${savedPerfume.id}`;
        await this.perfumeRepository.save(savedPerfume);

        perfumes.push(this.mapToDTO(savedPerfume));
      }

      await this.logger.log(
        `Uspešno prerađeno ${perfumes.length} parfema od ${harvestedPlants.length} biljaka`,
        "INFO"
      );

      return {
        perfumes,
        plantsUsed: harvestedPlants.length,
        message: `Uspešno kreirano ${perfumes.length} parfema`,
      };
    } catch (error) {
      await this.logger.log(`Greška pri preradi: ${(error as Error).message}`, "ERROR");
      throw error;
    }
  }

  async getPerfumes(type?: PerfumeType, quantity?: number): Promise<PerfumeDTO[]> {
    try {
      let perfumes: Perfume[];

      if (type) {
        perfumes = await this.perfumeRepository.find({
          where: { type },
          take: quantity,
        });
      } else {
        perfumes = await this.perfumeRepository.find({
          take: quantity,
        });
      }

      return perfumes.map(p => this.mapToDTO(p));
    } catch (error) {
      await this.logger.log(`Greška pri dobijanju parfema: ${(error as Error).message}`, "ERROR");
      throw error;
    }
  }

  async getPerfumeById(id: number): Promise<PerfumeDTO | null> {
    try {
      const perfume = await this.perfumeRepository.findOne({ where: { id } });
      return perfume ? this.mapToDTO(perfume) : null;
    } catch (error) {
      await this.logger.log(`Greška pri dobijanju parfema ${id}: ${(error as Error).message}`, "ERROR");
      throw error;
    }
  }

  async getAllPerfumes(): Promise<PerfumeDTO[]> {
    try {
      const perfumes = await this.perfumeRepository.find();
      return perfumes.map(p => this.mapToDTO(p));
    } catch (error) {
      await this.logger.log(`Greška pri dobijanju svih parfema: ${(error as Error).message}`, "ERROR");
      throw error;
    }
  }

  // === PRIVATE HELPER METHODS ===

  private async harvestPlantsFromService(commonName: string, quantity: number): Promise<PlantDTO[]> {
    try {
      // Dobavi listu ubranih biljaka sa datim nazivom
      const response = await this.plantsClient.get<PlantDTO[]>(`/plants/available/${commonName}`);
      const availablePlants = response.data;

      if (availablePlants.length === 0) {
        throw new Error(`Nema ubranih biljaka sa nazivom "${commonName}". Prvo uberi biljke na stranici Proizvodnja.`);
      }

      // Uzmi potreban broj biljaka
      const plantsToUse = availablePlants.slice(0, quantity);

      await this.logger.log(
        `Pronađeno ${availablePlants.length} ubranih biljaka, koristi se ${plantsToUse.length}`,
        "INFO"
      );

      return plantsToUse;
    } catch (error) {
      await this.logger.log(`Greška pri dobijanju ubranih biljaka: ${(error as Error).message}`, "ERROR");
      throw new Error(`Nije moguće dobiti ubrane biljke iz mikroservisa proizvodnje: ${(error as Error).message}`);
    }
  }

  private async balanceAroma(plant: PlantDTO): Promise<void> {
    try {
      // Ako je jačina > 4.0, treba balansirati
      const excess = plant.aromaStrength - 4.0;
      const excessPercentage = (excess / 4.0) * 100;

      console.log(`\n🔄 BALANSIRANJE AROME:`);
      console.log(`   Stara biljka: ${plant.commonName} (ID: ${plant.id})`);
      console.log(`   Jačina: ${plant.aromaStrength} (granica: 4.0)`);
      console.log(`   Prekoračenje: ${excessPercentage.toFixed(2)}%`);

      await this.logger.log(
        `Biljka ${plant.commonName} (ID: ${plant.id}) ima jačinu ${plant.aromaStrength} (prekoračenje: ${excessPercentage.toFixed(2)}%)`,
        "WARNING"
      );

      // Zasadi novu biljku
      console.log(`   📌 Šaljem zahtev za sađenje nove biljke...`);
      const newPlant = await this.plantNewPlant(plant.commonName, plant.latinName, plant.countryOfOrigin);
      console.log(`   ✅ Nova biljka zasađena! ID: ${newPlant.id}, Početna jačina: ${newPlant.aromaStrength}`);

      await this.logger.log(`Zasađena nova biljka za balansiranje (ID: ${newPlant.id})`, "INFO");

      // Smanji jačinu nove biljke srazmerno procentu prekoračenja
      const reductionPercentage = -excessPercentage; // Negativan procenat za smanjenje
      console.log(`   📉 Smanjujem jačinu nove biljke za ${excessPercentage.toFixed(2)}%...`);
      await this.adjustPlantAroma(newPlant.id, reductionPercentage);
      
      const expectedStrength = newPlant.aromaStrength * (1 + reductionPercentage / 100);
      console.log(`   ✅ Nova jačina: ~${expectedStrength.toFixed(2)}`);
      console.log(`   🎉 Balansiranje završeno!\n`);

      await this.logger.log(
        `Balansiranje završeno: nova biljka ${newPlant.id} sa smanjenom jačinom za ${excessPercentage.toFixed(2)}%`,
        "INFO"
      );
    } catch (error) {
      console.log(`   ❌ Greška pri balansiranju: ${(error as Error).message}\n`);
      await this.logger.log(`Greška pri balansiranju arome: ${(error as Error).message}`, "ERROR");
      // Ne bacamo grešku jer je balansiranje opcionalno
    }
  }

  private async plantNewPlant(commonName: string, latinName: string, countryOfOrigin: string): Promise<PlantDTO> {
    try {
      const response = await this.plantsClient.post<PlantDTO>("/plants", {
        commonName,
        latinName,
        countryOfOrigin,
      });
      return response.data;
    } catch (error) {
      throw new Error(`Greška pri sađenju nove biljke: ${(error as Error).message}`);
    }
  }

  private async adjustPlantAroma(plantId: number, percentageChange: number): Promise<void> {
    try {
      await this.plantsClient.put(`/plants/${plantId}/adjust-aroma`, {
        percentageChange,
      });
    } catch (error) {
      throw new Error(`Greška pri podešavanju jačine arome: ${(error as Error).message}`);
    }
  }

  private async markPlantsAsProcessed(plantIds: number[]): Promise<void> {
    try {
      await this.plantsClient.post("/plants/mark-processed", {
        plantIds,
      });
    } catch (error) {
      await this.logger.log(`Greška pri označavanju biljaka kao prerađene: ${(error as Error).message}`, "WARNING");
      // Ne bacamo grešku jer je označavanje opcionalno
    }
  }

  private calculateExpirationDate(): Date {
    // Parfem traje 3 godine od datuma proizvodnje
    const expirationDate = new Date();
    expirationDate.setFullYear(expirationDate.getFullYear() + 3);
    return expirationDate;
  }

  private mapToDTO(perfume: Perfume): PerfumeDTO {
    return {
      id: perfume.id,
      perfumeName: perfume.name,
      perfumeType: perfume.type,
      netVolume: perfume.netVolume,
      serialNumber: perfume.serialNumber || null,
      productionDate: perfume.createdAt ? new Date(perfume.createdAt).toISOString() : new Date().toISOString(),
      expirationDate: new Date(perfume.expirationDate).toISOString(),
    };
  }
}
