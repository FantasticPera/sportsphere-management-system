import { StavkaNarudzbine } from "./stavka-narudzbine";

export class Narudzbina {
    _id: string = "";
    idKor: string = "";
    idObj: string = "";
    proizvodi: StavkaNarudzbine[] = [];
    racun: number = 0;
    status: string = "";
}
