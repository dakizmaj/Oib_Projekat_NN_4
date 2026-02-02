import { Repository } from "typeorm";
import { IDataAnalysisService } from "../Domain/Services/IDataAnalysisService";
import { Receipt } from "../Domain/Models/Receipt";
import { errAsync, okAsync, ResultAsync } from "neverthrow";
import { ReceiptDTO } from "../Domain/DTOs/ReceiptDTO";
import { SaleType } from "../Domain/Enums/SaleType";
import { getCallSites } from "node:util";

export class DataAnalysisService implements IDataAnalysisService{
    constructor(private recieptRepo: Repository<Receipt>){}

    async createReceipt(receipt: ReceiptDTO): Promise<ResultAsync<ReceiptDTO, string>> {
        const created = this.recieptRepo.create({
            tipProdaje: receipt.tipProdaje,
            nacinPlacanja: receipt.nacinPlacanja,
            spisakParfema: receipt.spisakParfema,
            kolicina: receipt.kolicina,
            iznos: receipt.iznos
        });

        const saved = await this.recieptRepo.save(created);
        if(!saved)
            return errAsync("Error");

        return okAsync(toDTO(saved));
    }

    async getAllReceipts(): Promise<ResultAsync<ReceiptDTO[], string>> {
        const items = await this.recieptRepo.find();
        if(!items)
            return errAsync("Error");
        
        return okAsync((items.map(p => (toDTO(p)))));
    }

    async getAllSales(): Promise<ResultAsync<number, string>> {
        const items = await this.recieptRepo.find();
        if(!items)
            return errAsync("Error");
        let salesSum = 0;
        items.forEach(element => {
            salesSum += element.iznos;
        });
        return okAsync(salesSum);
    }
}



function toDTO(receipt: Receipt): ReceiptDTO {
    return{
        tipProdaje: receipt.tipProdaje,
        nacinPlacanja: receipt.nacinPlacanja,
        spisakParfema: receipt.spisakParfema,
        kolicina: receipt.kolicina,
        iznos: receipt.iznos
    }
}