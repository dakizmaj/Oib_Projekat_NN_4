import { Like, Repository } from "typeorm";
import { IDataAnalysisService } from "../Domain/Services/IDataAnalysisService";
import { Receipt } from "../Domain/Models/Receipt";
import { errAsync, okAsync, ResultAsync } from "neverthrow";
import { ReceiptDTO } from "../Domain/DTOs/ReceiptDTO";
import { ILogerService } from "../Domain/Services/ILogerService";
import { MonthData, Revenue, YearData } from "../Domain/types/AnalysisTypes";

export class DataAnalysisService implements IDataAnalysisService{
    constructor(
        private recieptRepo: Repository<Receipt>,
        private logger: ILogerService
    ){}

    async createReceipt(receipt: ReceiptDTO): Promise<ResultAsync<ReceiptDTO, string>> {
        const created = this.recieptRepo.create({
            tipProdaje: receipt.tipProdaje,
            nacinPlacanja: receipt.nacinPlacanja,
            spisakParfema: receipt.spisakParfema,
            kolicina: receipt.kolicina,
            iznos: receipt.iznos
        });

        const saved = await this.recieptRepo.save(created);
        if(!saved){
            this.logger.log(`Greska pri kreiranju racuna`, "ERROR");
            return errAsync("Greska pri kreiranju racuna");
        }
        this.logger.log(`Racun ${saved.id} kreiran`, "INFO");
        return okAsync(toDTO(saved));
    }

    async getAllReceipts(): Promise<ResultAsync<ReceiptDTO[], string>> {
        const items = await this.recieptRepo.find();
        if(!items){
            this.logger.log(`Greska pri pribavljanju svih racuna`, "ERROR");
            return errAsync("Error");
        }
        this.logger.log(`Svi racuni pribavljeni`, "INFO");
        return okAsync((items.map((p: Receipt) => (toDTO(p)))));
    }

    async getRevenue(): Promise<ResultAsync<Revenue, string>> {
        const sum = await this.recieptRepo.sum("iznos");
        if(!sum){
            this.logger.log(`Greska pri dobavljanju zarade`, "ERROR");
            return errAsync("Greska pri dobavljanju zarade");
        }
        return okAsync({revenue: sum});
    }

    async getTopTen(): Promise<ResultAsync<string[], string>> {
        const items = await this.recieptRepo.find();
        if(!items){
            this.logger.log(`Greska pri nabavljanju najprodavanijih`, "ERROR");
            errAsync("Greska pri nabavljanju najprodavanijih");
        }
        this.logger.log(`Uspesno pronadjeni najprodavaniji parfemi`);
        return okAsync(findMostSold(items));
    }

    async getTopTenRevenue(): Promise<ResultAsync<Revenue, string>> {
        const items = await this.recieptRepo.find();
        if(!items){
            this.logger.log(`Greska pri nabavljanju najprodavanijih`, "ERROR");
            errAsync("Greska pri nabavljanju najprodavanijih");
        }
        let mostSold = findMostSold(items);
        let receipts: Receipt[] = [];
        items.forEach(recipet => {
            mostSold.forEach( parfem =>{
                if(recipet.spisakParfema.includes(parfem)){
                    if(!receipts.includes(recipet)){
                        receipts.push(recipet);
                    }
                }
            });
        });
        let salesSum = 0;
        receipts.forEach(receipt => {
            salesSum += receipt.iznos;
        });

        return okAsync({revenue: salesSum});
    }

    async getRevenueByMonth(): Promise<ResultAsync<MonthData[], string>> {
        const items = await this.recieptRepo.createQueryBuilder('month')
        .select("MONTH(reciept.datumProdaje)", "month")
        .addSelect("SUM(reciept.iznos)", "revenue")
        .groupBy("month")
        .orderBy("month")
        .getRawMany();
        if(!items){
            this.logger.log("Neuspesno dobavljanje prihoda po mesecu", "ERROR");
            return errAsync("Neuspesno dobavljanje po nedelju");
        }
        return okAsync(items);
    }

    async getRevenueByYear(): Promise<ResultAsync<YearData[], string>> {
        const items = await this.recieptRepo.createQueryBuilder('month')
        .select("YEAR(reciept.datumProdaje)", "year")
        .addSelect("SUM(reciept.iznos)", "revenue")
        .groupBy("year")
        .orderBy("year")
        .getRawMany();
        if(!items){
            this.logger.log("Neuspesno dobavljanje prihoda po godini", "ERROR");
            return errAsync("Neuspesno dobavljanje po nedelju");
        }
        return okAsync(items);
    }
}


function findMostSold(sales: Receipt[]){
    let topSales: Map<string, number> = new Map<string, number>();
    sales.forEach(reciept => {
        reciept.spisakParfema.forEach(element => {
            topSales.set(element, (topSales.get(element)||0) + 1)
        });
    });
    let mostSold: string[] = [];
    if(topSales.size <= 10){
        mostSold = Array.from(topSales.keys())
    }else{
        let temp = Array.from(topSales.entries());
        temp.sort((a, b) => b[1]-a[1]);
        temp.slice(0, 10);
        temp.forEach(element => {
            mostSold.push(element[0]);
        });
        
    }
    return mostSold;
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