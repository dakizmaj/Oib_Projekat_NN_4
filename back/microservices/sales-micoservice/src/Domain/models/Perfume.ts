import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { PerfumeType } from "../Enums/PerfumeType";


@Entity("perfumes")
export class Perfume {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({type: "varchar", length: 255})
    naziv!: string;

    @Column({type: "enum", enum: PerfumeType })
    tip!: PerfumeType;

    @Column({type: "int"})
    kolicina!: number;

    @Column({type: "varchar", length: 255})
    serijskiBroj!: string;

    @Column({type: "varchar"})
    idBiljke!: number;

    @Column({type: "date"})
    rokTrajanja!: Date;
}