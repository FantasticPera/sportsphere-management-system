import { Kazna } from "./kazna";

export class User {
    _id: string = "";
    kor_ime: string = "";
    lozinka: string = "";
    ime: string = "";
    prezime: string = "";
    telefon: string = "";
    profilna: string = "";
    omiljeni_sportovi: string[] = [];
    mejl: string = "";
    tip: string = "";
    maticni_broj: string = "";
    status: string = "";
    kazne: Kazna[] = [];
    reset_token: string = "";
    reset_token_istice: Date | null = null;
}
