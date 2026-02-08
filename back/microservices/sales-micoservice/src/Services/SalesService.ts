import { ISalesService, PerfumeCatalogItem, SaleRequest, SaleResult } from "../Domain/Services/ISalesService";
import { err, ok, Result } from "neverthrow";
import axios, { AxiosInstance } from "axios";

export class SalesService implements ISalesService {
    private readonly processingClient: AxiosInstance;
    private readonly warehouseClient: AxiosInstance;
    private readonly analysisClient: AxiosInstance;
    private readonly loggingClient: AxiosInstance;

    constructor() {
        const processingURL = process.env.PROCESSING_SERVICE_URL || "http://localhost:5004/api/v1";
        const warehouseURL = process.env.WAREHOUSE_SERVICE_URL || "http://localhost:5005/api/v1";
        const analysisURL = process.env.ANALYSIS_SERVICE_URL || "http://localhost:5007/api/v1";
        const loggingURL = process.env.LOGGING_SERVICE_URL || "http://localhost:5002/api/v1";

        this.processingClient = axios.create({ baseURL: processingURL, timeout: 5000 });
        this.warehouseClient = axios.create({ baseURL: warehouseURL, timeout: 100000 });
        this.analysisClient = axios.create({ baseURL: analysisURL, timeout: 5000 });
        this.loggingClient = axios.create({ baseURL: loggingURL, timeout: 5000 });
    }

    /**
     * Prikazuje katalog dostupnih parfema iz processing mikroservisa
     */
    async getCatalog(): Promise<Result<PerfumeCatalogItem[], Error>> {
        try {
            await this.logAction('CATALOG_REQUEST', 'Fetching available perfumes catalog');
            
            // Get all perfumes from processing mikroservis
            const response = await this.processingClient.get('/perfumes');
            const perfumes = response.data;

            // Transform to catalog format
            const catalog: PerfumeCatalogItem[] = perfumes.map((p: any) => ({
                id: p.id,
                name: p.perfumeName || p.name,
                type: p.perfumeType || p.type,
                volume: p.netVolume || p.volume,
                price: this.calculatePrice(p.perfumeType || p.type, p.netVolume || p.volume),
                availableQuantity: 100 // Mock - u stvarnosti bi se računalo iz warehouse
            }));

            await this.logAction('CATALOG_SUCCESS', `Returned ${catalog.length} perfumes in catalog`);
            return ok(catalog);
        } catch (error) {
            await this.logAction('CATALOG_ERROR', `Failed to fetch catalog: ${(error as Error).message}`);
            return err(new Error(`Failed to fetch catalog: ${error}`));
        }
    }

    /**
     * Prodaja parfema - kompletan flow:
     * 1. Poziva warehouse da pošalje paket
     * 2. Raspakuje paket (dobija perfume IDs)
     * 3. Šalje podatke na analysis mikroservis za evidenciju i račun
     */
    async sellPerfumes(request: SaleRequest): Promise<Result<SaleResult, Error>> {
        try {
            console.log('[SalesService] sellPerfumes called with:', JSON.stringify(request));
            await this.logAction('SALE_START', `Starting sale: ${request.quantity}x perfume #${request.perfumeId} for ${request.customerName}`);

            // 1. Request package from warehouse (this will send and unpack)
            await this.logAction('WAREHOUSE_REQUEST', `Requesting package from warehouse`);
            
            const warehouseRequest = {
                warehouseId: 1,
                packIfNotAvailable: true,
                packParams: {
                    perfumeType: 'Mixed',
                    quantity: request.quantity,
                    netVolume: 150,
                    warehouseId: 1,
                    sender: 'Sales Department',
                    destinationAddress: request.customerName,
                    plantCommonName: 'Lavanda'
                }
            };
            
            console.log('[SalesService] Warehouse request:', JSON.stringify(warehouseRequest));
            
            const warehouseResponse = await this.warehouseClient.post('/packages/send', warehouseRequest);
            
            console.log('[SalesService] Warehouse response:', JSON.stringify(warehouseResponse.data));

            if (!warehouseResponse.data || warehouseResponse.data.sentCount === 0) {
                await this.logAction('WAREHOUSE_ERROR', 'No packages available from warehouse');
                return err(new Error('No packages available from warehouse'));
            }

            await this.logAction('WAREHOUSE_SUCCESS', `Received ${warehouseResponse.data.sentCount} package(s) from warehouse`);

            // 2. Calculate total price
            const unitPrice = 2500; // RSD per bottle
            const totalPrice = unitPrice * request.quantity;

            // 3. Send to analysis mikroservis for receipt creation
            await this.logAction('ANALYSIS_REQUEST', `Creating receipt for ${request.quantity} perfumes, total: ${totalPrice} RSD`);
            
            const receiptData = {
                tipProdaje: 'MALOPRODAJA',
                nacinPlacanja: 'GOTOVINA',
                spisakParfema: [`Parfem ID: ${request.perfumeId}`],
                kolicina: request.quantity,
                iznos: totalPrice
            };
            
            console.log('[SalesService] Receipt data:', JSON.stringify(receiptData));

            const analysisResponse = await this.analysisClient.post('/data/recipet', receiptData);
            const receiptId = analysisResponse.data.result?.id || analysisResponse.data.id;
            
            console.log('[SalesService] Analysis response:', JSON.stringify(analysisResponse.data));

            await this.logAction('SALE_SUCCESS', `Sale completed successfully. Receipt ID: ${receiptId}, Total: ${totalPrice} RSD`);

            return ok({
                success: true,
                receiptId: receiptId,
                message: `Prodaja uspešna! Račun br. ${receiptId}`,
                totalPrice: totalPrice,
                perfumesSold: request.quantity
            });

        } catch (error: any) {
            const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message || 'Unknown error';
            console.error('[SalesService] Error:', errorMsg);
            console.error('[SalesService] Full error:', JSON.stringify({
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            }));
            await this.logAction('SALE_ERROR', `Sale failed: ${errorMsg}`);
            
            return ok({
                success: false,
                message: `Greška pri prodaji: ${errorMsg}`
            });
        }
    }

    private calculatePrice(type: string, volume: number): number {
        // Simple pricing logic - 25 RSD per ml
        return volume * 25;
    }

    private async logAction(action: string, details: string): Promise<void> {
        try {
            await this.loggingClient.post('/logs', {
                type: action,
                description: `[sales] ${details}`
            });
        } catch (error) {
            console.error('Failed to log action:', error);
        }
    }
}