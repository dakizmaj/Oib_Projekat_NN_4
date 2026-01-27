import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { PlantState } from "../Enums/PlantState";


@Entity("plants")
export class Plant{
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({type: "varchar", length: 255})
    naziv!: string;

    @Column({type: "float"})
    jacina!: number;

    @Column({type: "varchar"})
    latinskiNaziv!: string;

    @Column({type: "varchar"})
    zemlja!: string;

    @Column({type : "enum", enum: PlantState})
    stanje!: PlantState
}