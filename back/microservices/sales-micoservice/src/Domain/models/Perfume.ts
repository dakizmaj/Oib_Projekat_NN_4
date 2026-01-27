import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { PerfumeType } from "../Enums/PerfumeType";
import { Plant } from "./Plant";


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

    // @ManyToOne(() => Plant)
    // @JoinColumn({name: "idBiljke"})
    @Column({type: "varchar"})
    idBiljke!: number;

    @Column({type: "date"})
    rokTrajanja!: Date;
}