import { Repository } from "typeorm";
import { Plant } from "../Domain/models/Plant";
import { PlantDTO } from "../Domain/DTOs/PlantDTO";
import { IPlantService } from "../Domain/services/IPlantService";
import { PlantStatus } from "../Domain/enums/PlantStatus";
import { ILogerService } from "../Domain/services/ILogerService";

export class PlantService implements IPlantService {
  constructor(
    private readonly plantRepository: Repository<Plant>,
    private readonly logger: ILogerService
  ) {}

  async plantNewPlant(plantData: Omit<PlantDTO, 'id' | 'status' | 'createdAt'>): Promise<PlantDTO> {
    try {
      // Generiši random jačinu aromatičnih ulja između 1.0 i 5.0
      const aromaStrength = plantData.aromaStrength || this.generateRandomAromaStrength();

      // Validacija jačine (mora biti između 1.0 i 5.0)
      if (aromaStrength < 1.0 || aromaStrength > 5.0) {
        await this.logger.log(`Pokušaj sađenja biljke sa nevažećom jačinom: ${aromaStrength}`, "ERROR");
        throw new Error("Jačina aromatičnih ulja mora biti između 1.0 i 5.0");
      }

      const plant = this.plantRepository.create({
        ...plantData,
        aromaStrength,
        status: PlantStatus.PLANTED,
      });

      const savedPlant = await this.plantRepository.save(plant);
      await this.logger.log(`Zasađena nova biljka: ${savedPlant.commonName} (ID: ${savedPlant.id})`, "INFO");

      return this.mapToDTO(savedPlant);
    } catch (error) {
      await this.logger.log(`Greška pri sađenju biljke: ${(error as Error).message}`, "ERROR");
      throw error;
    }
  }

  async adjustAromaStrength(plantId: number, percentageChange: number): Promise<PlantDTO> {
    try {
      const plant = await this.plantRepository.findOne({ where: { id: plantId } });

      if (!plant) {
        await this.logger.log(`Biljka sa ID ${plantId} nije pronađena`, "ERROR");
        throw new Error(`Biljka sa ID ${plantId} nije pronađena`);
      }

      // Izračunaj novu jačinu
      const oldStrength = plant.aromaStrength;
      const newStrength = oldStrength * (1 + percentageChange / 100);

      // Validacija - mora biti između 1.0 i 5.0
      const clampedStrength = Math.max(1.0, Math.min(5.0, newStrength));

      plant.aromaStrength = Math.round(clampedStrength * 100) / 100; // Zaokruži na 2 decimale
      await this.plantRepository.save(plant);

      await this.logger.log(
        `Promenjena jačina biljke ${plant.commonName} (ID: ${plantId}): ${oldStrength} → ${plant.aromaStrength}`,
        "INFO"
      );

      return this.mapToDTO(plant);
    } catch (error) {
      await this.logger.log(`Greška pri promeni jačine biljke: ${(error as Error).message}`, "ERROR");
      throw error;
    }
  }

  async harvestPlants(commonName: string, quantity: number): Promise<PlantDTO[]> {
    try {
      // Pronađi posađene biljke sa datim nazivom
      const plants = await this.plantRepository.find({
        where: {
          commonName,
          status: PlantStatus.PLANTED,
        },
        take: quantity,
      });

      if (plants.length === 0) {
        await this.logger.log(`Nema dostupnih biljaka za berbu: ${commonName}`, "WARNING");
        throw new Error(`Nema dostupnih biljaka za berbu: ${commonName}`);
      }

      if (plants.length < quantity) {
        await this.logger.log(
          `Zatraženo ${quantity} biljaka ${commonName}, ali dostupno samo ${plants.length}`,
          "WARNING"
        );
      }

      // Označi biljke kao ubrane
      for (const plant of plants) {
        plant.status = PlantStatus.HARVESTED;
        await this.plantRepository.save(plant);
      }

      await this.logger.log(`Ubrano ${plants.length} biljaka: ${commonName}`, "INFO");

      return plants.map(plant => this.mapToDTO(plant));
    } catch (error) {
      await this.logger.log(`Greška pri berbi biljaka: ${(error as Error).message}`, "ERROR");
      throw error;
    }
  }

  async getAllPlants(): Promise<PlantDTO[]> {
    try {
      const plants = await this.plantRepository.find();
      return plants.map(plant => this.mapToDTO(plant));
    } catch (error) {
      await this.logger.log(`Greška pri dobijanju svih biljaka: ${(error as Error).message}`, "ERROR");
      throw error;
    }
  }

  async getPlantById(id: number): Promise<PlantDTO | null> {
    try {
      const plant = await this.plantRepository.findOne({ where: { id } });
      return plant ? this.mapToDTO(plant) : null;
    } catch (error) {
      await this.logger.log(`Greška pri dobijanju biljke sa ID ${id}: ${(error as Error).message}`, "ERROR");
      throw error;
    }
  }

  async getAvailablePlantsForProcessing(commonName: string): Promise<PlantDTO[]> {
    try {
      const plants = await this.plantRepository.find({
        where: {
          commonName,
          status: PlantStatus.HARVESTED,
        },
      });

      return plants.map(plant => this.mapToDTO(plant));
    } catch (error) {
      await this.logger.log(
        `Greška pri dobijanju dostupnih biljaka za preradu: ${(error as Error).message}`,
        "ERROR"
      );
      throw error;
    }
  }

  async markPlantsAsProcessed(plantIds: number[]): Promise<void> {
    try {
      for (const id of plantIds) {
        const plant = await this.plantRepository.findOne({ where: { id } });
        if (plant) {
          plant.status = PlantStatus.PROCESSED;
          await this.plantRepository.save(plant);
        }
      }

      await this.logger.log(`Označeno ${plantIds.length} biljaka kao prerađeno`, "INFO");
    } catch (error) {
      await this.logger.log(`Greška pri označavanju biljaka kao prerađene: ${(error as Error).message}`, "ERROR");
      throw error;
    }
  }

  // Helper metoda za generisanje random jačine
  private generateRandomAromaStrength(): number {
    // Generiši random broj između 1.0 i 5.0
    const randomStrength = Math.random() * 4.0 + 1.0;
    return Math.round(randomStrength * 100) / 100; // Zaokruži na 2 decimale
  }

  // Helper metoda za mapiranje Entity -> DTO
  private mapToDTO(plant: Plant): PlantDTO {
    return {
      id: plant.id,
      commonName: plant.commonName,
      aromaStrength: plant.aromaStrength,
      latinName: plant.latinName,
      countryOfOrigin: plant.countryOfOrigin,
      status: plant.status,
      createdAt: plant.createdAt,
    };
  }
}
