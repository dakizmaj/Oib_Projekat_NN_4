import { Router, Request, Response } from "express";
import { IDataAnalysisService } from "../../Domain/Services/IDataAnalysisService";
import { ReceiptDTO } from "../../Domain/DTOs/ReceiptDTO";

export class DataAnalysisController {
    private routuer: Router;

    constructor(private service: IDataAnalysisService){
        this.routuer = Router();
        this.initializeRoutes();
    }

    public getRouter(): Router{
        return this.routuer;
    }

    private initializeRoutes(): void {
        this.routuer.get('/data/reciepts', this.getAllReciepts.bind(this));
        this.routuer.post('/data/recipets', this.createReciept.bind(this));
        this.routuer.get('/data/revenue', this.getRevenue.bind(this));
        this.routuer.get('/data/top',this.getTopTen.bind(this));
        this.routuer.get('/data/revenue/top', this.getTopTenRevenue.bind(this));
        this.routuer.get('/data/revenue/month', this.getRevenueByMonth.bind(this));
        this.routuer.get('/data/revenue/year', this.getRevenueByYear.bind(this));
    }

    private async getAllReciepts(req: Request, res: Response): Promise<void>{
        const items = this.service.getAllReceipts();
        (await items).match(
            (allRecipets) => {res.status(200).json(allRecipets)},
            (err) => {res.status(500).json({message: err})}
        )
    }

    private async createReciept(req: Request, res: Response): Promise<void>{
        const data: ReceiptDTO = req.body;
        if((data.kolicina == 0)){
            res.status(400).json({message: "Bad request"});
        }
        const answer = this.service.createReceipt(data);
        (await answer).match(
            (result) => {res.status(200).json({result})},
            (err) => {res.status(400).json({message: err})}
        );
    }

    private async getRevenue(req: Request, res: Response): Promise<void>{
        const answer = this.service.getRevenue();
        (await answer).match(
            (result) => {res.status(200).json({result})},
            (err) => {res.status(404).json({message: err})}
        );
    }

    private async getTopTen(req: Request, res:Response): Promise<void>{
        const answer = this.service.getTopTen();
        (await answer).match(
            (result) => {res.status(200).json({result})},
            (err) => res.status(404).json({message: err})
        )
    }

    private async getTopTenRevenue(req: Request, res:Response): Promise<void>{
        const answer = this.service.getTopTenRevenue();
        (await answer).match(
            (result) => {res.status(200).json({result})},
            (err) => res.status(404).json({message: err})
        )
    }

    private async getRevenueByMonth(req: Request, res:Response): Promise<void>{
        const answer = this.service.getRevenueByMonth();
        (await answer).match(
            (result) => {res.status(200).json({result})},
            (err) => res.status(404).json({message: err})
        )
    }

    private async getRevenueByYear(req: Request, res:Response): Promise<void>{
        const answer = this.service.getRevenueByYear();
        (await answer).match(
            (result) => {res.status(200).json({result})},
            (err) => res.status(404).json({message: err})
        )
    }
}   