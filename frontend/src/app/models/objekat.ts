import { Komentar } from "./komentar";
import { Promocija } from "./promocija";
import { Teren } from "./teren";

export class Objekat {
    _id: string = "";
    naziv: string = "";
    adresa: string = "";
    mesto: string = "";
    lat: number = 0;
    lng: number = 0;
    pib: string = "";
    radnici: string[] = [];
    broj_radnika: number = 0;
    lajkovi: string[] = [];
    dislajkovi: string[] = [];
    komentari: Komentar[] = [];
    promocije: Promocija[] = [];
    status: string = "";
    radno_vreme_od: string = "";
    radno_vreme_do: string = "";
    vrsta_sporta: string[] = [];
    opis: string = "";
    max_kazni_korisnika: number = 0;
    tereni: Teren[] = [];
}
