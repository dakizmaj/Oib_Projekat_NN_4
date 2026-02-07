import { PerfumeDTO } from "../Domain/DTOs/PerfumeDTO";
import { ISalesService } from "../Domain/Services/ISalesService";
import { Repository } from "typeorm";
import { Perfume } from "../Domain/models/Perfume";
import { errAsync, okAsync, ResultAsync } from "neverthrow";
import { ILogerService } from "../Domain/Services/ILogerService";
import { SalesType } from "../Domain/types/SalesType";

export class SalesService implements ISalesService{
    constructor(
        private perfumeRepo: Repository<Perfume>,
        private logger: ILogerService
    ){}

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
        if(!saved){
            await this.logger.log(`Greska pri cuvanju parfema`, "ERROR");
            return errAsync("Neuspesno kreiranje parfema");
        }
        await this.logger.log(`Sacuvan parfem ${saved.naziv}`, "INFO");
        return okAsync(toDTO(saved));
    }

    async getAllPerfumes(): Promise<ResultAsync<PerfumeDTO[], string>> {
        const items = await this.perfumeRepo.find();
        if(!items){
            await this.logger.log(`Greska pri pribavljanju svih parfema`, "ERROR");
            return errAsync("Error");
        }

        return okAsync((items.map(p => (toDTO(p)))));
    }
    
    async perfumesToSend(perfumeId: number, amount: number): Promise<ResultAsync<SalesType, string>> {
        const found = await this.perfumeRepo.findOne({where: {id: perfumeId}});
        if(!found){
            await this.logger.log(`Greska pri slanju parfema`, "ERROR");
            return errAsync("Error");
        }
        return okAsync({perfume: found, amount: amount});
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