import { PerfumeType } from "../Enums/PerfumeType";

export interface PerfumeDTO{
    naziv: string,
    tip: PerfumeType,
    kolicina: number,
    serijskiBroj: string,
    idBiljke: number,
    rokTrajanja: string
}