import { Like, Repository } from "typeorm";
import { IDataAnalysisService, AnalysisReportDTO } from "../Domain/Services/IDataAnalysisService";
import { Receipt } from "../Domain/Models/Receipt";
import { AnalysisReport } from "../Domain/Models/AnalysisReport";
import { errAsync, okAsync, ResultAsync } from "neverthrow";
import { ReceiptDTO } from "../Domain/DTOs/ReceiptDTO";
import { ILogerService } from "../Domain/Services/ILogerService";
import { MonthData, Revenue, YearData, WeekData, TrendData } from "../Domain/types/AnalysisTypes";
import { Db } from "../Database/DbConnectionPool";

export class DataAnalysisService implements IDataAnalysisService{
    private reportRepo: Repository<AnalysisReport>;
    
    constructor(
        private recieptRepo: Repository<Receipt>,
        private logger: ILogerService
    ){
        this.reportRepo = Db.getRepository(AnalysisReport);
    }

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
        const items = await this.recieptRepo.createQueryBuilder('receipt')
        .select("MONTH(receipt.datumProdaje)", "month")
        .addSelect("SUM(receipt.iznos)", "revenue")
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
        const items = await this.recieptRepo.createQueryBuilder('receipt')
        .select("YEAR(receipt.datumProdaje)", "year")
        .addSelect("SUM(receipt.iznos)", "revenue")
        .groupBy("year")
        .orderBy("year")
        .getRawMany();
        if(!items){
            this.logger.log("Neuspesno dobavljanje prihoda po godini", "ERROR");
            return errAsync("Neuspesno dobavljanje po nedelju");
        }
        return okAsync(items);
    }

    async getRevenueByWeek(): Promise<ResultAsync<WeekData[], string>> {
        const items = await this.recieptRepo.createQueryBuilder('receipt')
        .select("WEEK(receipt.datumProdaje)", "week")
        .addSelect("YEAR(receipt.datumProdaje)", "year")
        .addSelect("SUM(receipt.iznos)", "revenue")
        .groupBy("year, week")
        .orderBy("year, week")
        .getRawMany();
        if(!items){
            this.logger.log("Neuspesno dobavljanje prihoda po nedelji", "ERROR");
            return errAsync("Neuspesno dobavljanje po nedelji");
        }
        return okAsync(items);
    }

    async getSalesTrend(): Promise<ResultAsync<TrendData[], string>> {
        const items = await this.recieptRepo.createQueryBuilder('receipt')
        .select("DATE(receipt.datumProdaje)", "date")
        .addSelect("SUM(receipt.iznos)", "revenue")
        .addSelect("COUNT(*)", "sales")
        .groupBy("date")
        .orderBy("date", "DESC")
        .limit(30)
        .getRawMany();
        if(!items){
            this.logger.log("Neuspesno dobavljanje trenda prodaje", "ERROR");
            return errAsync("Neuspesno dobavljanje trenda");
        }
        return okAsync(items);
    }

    async createAnalysisReport(title: string, reportType: string, data: any, description?: string): Promise<ResultAsync<AnalysisReportDTO, string>> {
        try {
            const report = this.reportRepo.create({
                title,
                reportType,
                data,
                description
            });
            
            const saved = await this.reportRepo.save(report);
            this.logger.log(`Izvjestaj ${saved.id} kreiran`, "INFO");
            
            return okAsync({
                id: saved.id,
                title: saved.title,
                reportType: saved.reportType,
                data: saved.data,
                createdAt: saved.createdAt,
                description: saved.description
            });
        } catch (error) {
            this.logger.log("Greska pri kreiranju izvjestaja", "ERROR");
            return errAsync("Greska pri kreiranju izvjestaja");
        }
    }

    async getAllReports(): Promise<ResultAsync<AnalysisReportDTO[], string>> {
        try {
            const reports = await this.reportRepo.find({
                order: { createdAt: 'DESC' }
            });
            
            const dtos = reports.map(r => ({
                id: r.id,
                title: r.title,
                reportType: r.reportType,
                data: r.data,
                createdAt: r.createdAt,
                description: r.description
            }));
            
            return okAsync(dtos);
        } catch (error) {
            this.logger.log("Greska pri dobavljanju izvjestaja", "ERROR");
            return errAsync("Greska pri dobavljanju izvjestaja");
        }
    }

    async getReportById(id: number): Promise<ResultAsync<AnalysisReportDTO, string>> {
        try {
            const report = await this.reportRepo.findOne({ where: { id } });
            
            if (!report) {
                return errAsync("Izvjestaj nije pronadjen");
            }
            
            return okAsync({
                id: report.id,
                title: report.title,
                reportType: report.reportType,
                data: report.data,
                createdAt: report.createdAt,
                description: report.description
            });
        } catch (error) {
            this.logger.log("Greska pri dobavljanju izvjestaja", "ERROR");
            return errAsync("Greska pri dobavljanju izvjestaja");
        }
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