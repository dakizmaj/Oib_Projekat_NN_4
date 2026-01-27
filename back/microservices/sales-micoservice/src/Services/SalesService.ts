import { PerfumeDTO } from "../Domain/DTOs/PerfumeDTO";
import { ISalesService } from "../Domain/Services/ISalesService";
import { Repository } from "typeorm";
import { Perfume } from "../Domain/models/Perfume";
import { errAsync, okAsync, ResultAsync } from "neverthrow";

export class SalesService implements ISalesService{
    constructor(private perfumeRepo: Repository<Perfume>){}

    async createPerfume(data: PerfumeDTO): Promise<ResultAsync<PerfumeDTO, string>> {
        const created =  this.perfumeRepo.create({
            naziv: data.naziv,
            tip: data.tip,
            kolicina: data.kolicina,
            serijskiBroj: data.serijskiBroj,
            idBiljke: data.idBiljke,
            rokTrajanja: data.rokTrajanja
        });
        const saved = await this.perfumeRepo.save(created);
        if(!saved)
            return errAsync("Error");
        
        return okAsync(toDTO(saved));
    }

    async getAllPerfumes(): Promise<ResultAsync<PerfumeDTO[], string>> {
        const items = await this.perfumeRepo.find();
        if(!items) 
            return errAsync("Error");

        return okAsync((items.map(p => (toDTO(p)))));
    }
    
    async perfumesToSend(perfumeId: number, amount: number): Promise<ResultAsync<{ naziv: string; amount: number; }, string>> {
        const found = await this.perfumeRepo.findOne({where: {id: perfumeId}});
        if(!found)
            return errAsync("Error");
        
        return okAsync({naziv: found.naziv, amount: amount});
    }
}

function toDTO(perfume: Perfume) : PerfumeDTO {
    return{
        naziv: perfume.naziv,
        tip: perfume.tip,
        kolicina: perfume.kolicina,
        serijskiBroj: perfume.serijskiBroj,
        idBiljke: perfume.idBiljke,
        rokTrajanja: perfume.rokTrajanja.toISOString()
    }
}