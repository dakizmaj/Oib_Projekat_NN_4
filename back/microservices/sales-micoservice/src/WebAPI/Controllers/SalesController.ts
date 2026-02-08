import { Router, Request, Response } from "express";
import { ISalesService } from "../../Domain/Services/ISalesService";

export class SalesController {
    private router: Router;

    constructor(private service: ISalesService) {
        this.router = Router();
        this.initializeRoutes();
    }

    public getRouter(): Router {
        return this.router;
    }

    private initializeRoutes(): void {
        // GET /api/v1/sales/catalog - Get available perfumes catalog
        this.router.get('/sales/catalog', this.getCatalog.bind(this));
        
        // POST /api/v1/sales/sell - Sell perfumes
        this.router.post('/sales/sell', this.sellPerfumes.bind(this));
    }

    /**
     * GET /api/v1/sales/catalog
     * Returns catalog of available perfumes with prices
     */
    private async getCatalog(req: Request, res: Response): Promise<void> {
        const result = await this.service.getCatalog();
        
        result.match(
            (catalog) => res.status(200).json(catalog),
            (error) => res.status(500).json({ error: error.message })
        );
    }

    /**
     * POST /api/v1/sales/sell
     * Body: { perfumeId: number, quantity: number, customerName: string }
     * Sells perfumes - requests from warehouse, creates receipt
     */
    private async sellPerfumes(req: Request, res: Response): Promise<void> {
        const { perfumeId, quantity, customerName } = req.body;

        if (!perfumeId || !quantity || !customerName) {
            res.status(400).json({ error: 'Missing required fields: perfumeId, quantity, customerName' });
            return;
        }

        const result = await this.service.sellPerfumes({
            perfumeId,
            quantity,
            customerName
        });

        result.match(
            (saleResult) => {
                if (saleResult.success) {
                    res.status(200).json(saleResult);
                } else {
                    res.status(400).json(saleResult);
                }
            },
            (error) => res.status(500).json({ error: error.message })
        );
    }
}   

