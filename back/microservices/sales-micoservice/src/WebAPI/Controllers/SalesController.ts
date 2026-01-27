import { Router, Request, Response, response } from "express";
import { ISalesService } from "../../Domain/Services/ISalesService";
import { Perfume } from "../../Domain/models/Perfume";
import { PerfumeDTO } from "../../Domain/DTOs/PerfumeDTO";

export class SalesController {
    private router: Router;

    constructor(private service: ISalesService){
        this.router = Router();
        this.initilaizeRoutes();
    }

    public getRouter(): Router {
        return this.router;
    }

    private initilaizeRoutes(): void {
        this.router.get('/sales/perfumes', this.getAllPerfumes.bind(this));
        this.router.get('/sales/send/', this.perfumesToSend.bind(this));
    }

    private async getAllPerfumes(req: Request, res: Response): Promise<void> {
        const items = this.service.getAllPerfumes();
        (await items).match(
            (allPerumes)   => {res.status(200).json(allPerumes)},
            (err)          => {res.status(500).json({message: err})}
        )

    }

    private async perfumesToSend(req: Request, res: Response): Promise<void> {
        if((req.body.perfumeId == null) || (req.body.amount == null)){
            res.status(400).json({errMessage: "Bad request"})
        }
        const perfmeId: number = req.body.perfumeId;
        const perfumeAmount: number = req.body.amount;
        const answer = this.service.perfumesToSend(perfmeId, perfumeAmount);

        (await answer).match(
            (result) => {res.status(200).json({result})},
            (err)     => {res.status(404).json({message: err})}
        );
    }

}   

