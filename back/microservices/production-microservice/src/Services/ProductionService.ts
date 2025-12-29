import { Repository } from "typeorm";
import { IProductionService } from "../Domain/services/IProductionService";
import { Plant } from "../Domain/models/Plant";
import { Perfume } from "../Domain/models/Perfume";
import { Packaging } from "../Domain/models/Packaging";
import { Storage } from "../Domain/models/Storage";
import { Receipt } from "../Domain/models/Receipt";
import { PlantDTO } from "../Domain/DTOs/PlantDTO";
import { PerfumeDTO } from "../Domain/DTOs/PerfumeDTO";
import { PackagingDTO } from "../Domain/DTOs/PackagingDTO";
import { StorageDTO } from "../Domain/DTOs/StorageDTO";
import { ReceiptDTO } from "../Domain/DTOs/ReceiptDTO";

export class ProductionService implements IProductionService {
  constructor(
    private plantRepo: Repository<Plant>,
    private perfumeRepo: Repository<Perfume>,
    private packagingRepo: Repository<Packaging>,
    private storageRepo: Repository<Storage>,
    private receiptRepo: Repository<Receipt>
  ) {}

  // Plants
  async getAllPlants(): Promise<PlantDTO[]> {
    const plants = await this.plantRepo.find();
    return plants.map(p => ({
      id: p.id,
      opstiNaziv: p.opstiNaziv,
      jacinaAromaticnihUlja: p.jacinaAromaticnihUlja,
      latinskiNaziv: p.latinskiNaziv,
      zemljaPorekla: p.zemljaPorekla,
      stanje: p.stanje,
    }));
  }

  async getPlantById(id: number): Promise<PlantDTO> {
    const p = await this.plantRepo.findOne({ where: { id } });
    if (!p) throw new Error(`Plant ${id} not found`);
    return {
      id: p.id,
      opstiNaziv: p.opstiNaziv,
      jacinaAromaticnihUlja: p.jacinaAromaticnihUlja,
      latinskiNaziv: p.latinskiNaziv,
      zemljaPorekla: p.zemljaPorekla,
      stanje: p.stanje,
    };
  }

  async createPlant(data: PlantDTO): Promise<PlantDTO> {
    const created = this.plantRepo.create({
      opstiNaziv: data.opstiNaziv,
      jacinaAromaticnihUlja: data.jacinaAromaticnihUlja,
      latinskiNaziv: data.latinskiNaziv,
      zemljaPorekla: data.zemljaPorekla,
      stanje: (data.stanje as any) || undefined,
    });
    const saved = await this.plantRepo.save(created);
    return { id: saved.id, opstiNaziv: saved.opstiNaziv, jacinaAromaticnihUlja: saved.jacinaAromaticnihUlja, latinskiNaziv: saved.latinskiNaziv, zemljaPorekla: saved.zemljaPorekla, stanje: saved.stanje };
  }

  // Perfumes
  async getAllPerfumes(): Promise<PerfumeDTO[]> {
    const items = await this.perfumeRepo.find();
    return items.map(i => ({ naziv: i.naziv, tip: i.tip, netoKolicina: i.netoKolicina, serijskiBroj: i.serijskiBroj, idBiljke: i.idBiljke, rokTrajanja: i.rokTrajanja }));
  }
  async getPerfumeById(serial: string): Promise<PerfumeDTO> {
    const p = await this.perfumeRepo.findOne({ where: { serijskiBroj: serial } });
    if (!p) throw new Error(`Perfume ${serial} not found`);
    return { naziv: p.naziv, tip: p.tip, netoKolicina: p.netoKolicina, serijskiBroj: p.serijskiBroj, idBiljke: p.idBiljke, rokTrajanja: p.rokTrajanja };
  }
  async createPerfume(data: PerfumeDTO): Promise<PerfumeDTO> {
    const created = this.perfumeRepo.create({
      naziv: data.naziv,
      tip: data.tip as any,
      netoKolicina: data.netoKolicina,
      serijskiBroj: data.serijskiBroj,
      idBiljke: data.idBiljke,
      rokTrajanja: data.rokTrajanja,});
    const saved = await this.perfumeRepo.save(created);
    return { naziv: saved.naziv, tip: saved.tip, netoKolicina: saved.netoKolicina, serijskiBroj: saved.serijskiBroj, idBiljke: saved.idBiljke, rokTrajanja: saved.rokTrajanja };
  }

  // Storages
  async getAllStorages(): Promise<StorageDTO[]> {
    const s = await this.storageRepo.find();
    return s.map(x => ({ id: x.id, naziv: x.naziv, lokacija: x.lokacija, maxAmbalaza: x.maxAmbalaza }));
  }
  async createStorage(data: StorageDTO): Promise<StorageDTO> {
    const created = this.storageRepo.create({ naziv: data.naziv, lokacija: data.lokacija, maxAmbalaza: data.maxAmbalaza });
    const saved = await this.storageRepo.save(created);
    return { id: saved.id, naziv: saved.naziv, lokacija: saved.lokacija, maxAmbalaza: saved.maxAmbalaza };
  }

  // Packaging
  async createPackaging(data: PackagingDTO): Promise<PackagingDTO> {
    const created = this.packagingRepo.create({ naziv: data.naziv, adresaPosiljaoca: data.adresaPosiljaoca, idSkladista: data.idSkladista, idParfema: data.idParfema, status: data.status as any });
    const saved = await this.packagingRepo.save(created);
    return { id: saved.id, naziv: saved.naziv, adresaPosiljaoca: saved.adresaPosiljaoca, idSkladista: saved.idSkladista, idParfema: saved.idParfema, status: saved.status };
  }

  // Receipts
  async createReceipt(data: ReceiptDTO): Promise<ReceiptDTO> {
    const created = this.receiptRepo.create({ tipProdaje: data.tipProdaje as any, nacinPlacanja: data.nacinPlacanja as any, spisakParfema: data.spisakParfema, kolicina: data.kolicina, iznos: data.iznos });
    const saved = await this.receiptRepo.save(created);
    return { id: saved.id, tipProdaje: saved.tipProdaje, nacinPlacanja: saved.nacinPlacanja, spisakParfema: saved.spisakParfema, kolicina: saved.kolicina, iznos: saved.iznos };
  }
}
