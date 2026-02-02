import { Router, Request, Response } from "express";
import { IDataAnalysisService } from "../../Domain/Services/IDataAnalysisService";
import { ReceiptDTO } from "../../Domain/DTOs/ReceiptDTO";

export class DataAnalysisController {
    private routuer: Router;

    constructor(private service: IDataAnalysisService){
        this.routuer = Router();
        this
    }

    public getRouter(): Router{
        return this.routuer;
    }

    private initializeRoutes(): void {
        this.routuer.get('/data/reciepts', this.getAllReciepts.bind(this));
        this.routuer.post('data/rexipets', this.createReciept.bind(this));
        this.routuer.get('data/allsales', this.getAllSales.bind(this));
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
        if((data.kolicina == 0) && (data.spisakParfema == "")){
            res.status(400).json({message: "Bad request"});
        }
        const answer = this.service.createReceipt(data);
        (await answer).match(
            (result) => {res.status(200).json({result})},
            (err) => {res.status(400).json({message: err})}
        );
    }

    private async getAllSales(req: Request, res: Response): Promise<void>{
        const answer = this.service.getAllSales();
        (await answer).match(
            (result) => {res.status(200).json({result})},
            (err) => {res.status(404).json({message: err})}
        );
    }
}   