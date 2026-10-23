import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { User } from '../models/user';


@Injectable({
  providedIn: 'root',
})
export class Service {
  private http = inject(HttpClient);

  uri = "http://localhost:4000/user";

  login(username: string, password: string) {
    let data = {
      kor_ime: username, lozinka: password
    }
    return this.http.post<User>(`${this.uri}/login`, data)
  }

  generateResetToken(identifier: string) {
    let data = { identifier: identifier };
    return this.http.post<{ message?: string, token?: string }>(`${this.uri}/generateResetToken`, data);
  }

  resetPassword(token: string, newPassword: string) {
    let data = { token: token, password: newPassword };
    return this.http.post<{ message: string }>(`${this.uri}/resetPassword`, data);
  }

  getPocetnaInfo() {
    return this.http.get<any>(`${this.uri}/pocetna-info`);
  }

  getGradovi() {
    return this.http.get<string[]>(`${this.uri}/gradovi`);
  }

  searchObjekti(naziv: string, gradovi: string[], sport: string, tip_terena: string, samoSlobodni: boolean = false) {
    let body = { naziv, gradovi, sport, tip_terena, samoSlobodni };
    return this.http.post<any[]>(`${this.uri}/search`, body);
  }

  getKalendarZauzeca(idObj: string, datumOd: string, datumDo: string) {
    return this.http.get<{ rezervacije: any[], treninzi: any[] }>(`${this.uri}/getKalendarZauzeca?idObj=${idObj}&datumOd=${datumOd}&datumDo=${datumDo}`);
  }

  rezervisiTeren(idKor: string, idObj: string, idTeren: string, datum: string, od: string, doVreme: string) {
    return this.http.post(`${this.uri}/rezervisi`, { idKor, idObj, idTeren, datum, od, do: doVreme });
  }

  dohvatiOglase(idKor: string) {
    return this.http.get<{ moji: any[], tudji: any[] }>(`${this.uri}/oglasi/aktivni?idKor=${idKor}`);
  }

  rezervacijeZaOglas(idKor: string) {
    return this.http.get<any[]>(`${this.uri}/rezervacije/dostupne-za-oglas?idKor=${idKor}`);
  }

  kreirajOglas(idKor: string, idRez: string, broj_nedostajucih_igraca: number) {
    return this.http.post(`${this.uri}/oglasi/kreiraj`, { idKor, idRez, broj_nedostajucih_igraca });
  }

  posaljiZahtevOglas(idKor: string, idOglas: string, broj_ljudi: number) {
    return this.http.post(`${this.uri}/zahtevi/posalji`, { idKor, idOglas, broj_ljudi });
  }

  dohvatiMojeZahteve(idKor: string) {
    return this.http.get<string[]>(`${this.uri}/zahtevi/moji?idKor=${idKor}`);
  }

  dohvatiZahteveZaOglas(idOglas: string) {
    return this.http.get<any[]>(`${this.uri}/zahtevi/za-oglas?idOglas=${idOglas}`);
  }

  obradiZahtev(idZahtev: string, idOglas: string, akcija: string) {
    return this.http.post(`${this.uri}/zahtevi/obradi`, { idZahtev, idOglas, akcija });
  }

  pretraziTrenere(sport: string, objekat: string) {
    return this.http.get<any[]>(`${this.uri}/treneri/pretraga?sport=${encodeURIComponent(sport)}&objekat=${encodeURIComponent(objekat)}`);
  }

  getTrener(idTrenera: string) {
    return this.http.get<any>(`${this.uri}/treneri/trener?id=${idTrenera}`);
  }

  zakaziTrening(idKor: string, idTrener: string, datum: string, od: string, doVreme: string) {
    return this.http.post(`${this.uri}/treninzi/zakazi`, { idKor, idTrener, datum, od, doVreme });
  }

  getObjekat(id: string) {
    return this.http.get<any>(`${this.uri}/objekat?id=${id}`);
  }

  getUserByUsername(username: string) {
    return this.http.get<User>(`${this.uri}/getUserByUsername?username=${username}`);
  }

  updateProfile(data: FormData) {
    return this.http.post<User>(`${this.uri}/updateProfile`, data);
  }

  getUserReservations(idKor: string) {
    return this.http.get<any[]>(`${this.uri}/getUserReservations?idKor=${idKor}`);
  }

  getUserTreninzi(idKor: string) {
    return this.http.get<any[]>(`${this.uri}/treninzi/korisnik?idKor=${idKor}`);
  }

  otkaziRezervaciju(idRez: string) {
    return this.http.post<{ message: string }>(`${this.uri}/otkaziRezervaciju`, { idRez });
  }

  getOprema(idObj: string) {
    return this.http.get<any[]>(`${this.uri}/oprema?idObj=${idObj}`);
  }

  kreirajNarudzbinu(idKor: string, idObj: string, proizvodi: any[], racun: number) {
    return this.http.post(`${this.uri}/narudzbine/kreiraj`, { idKor, idObj, proizvodi, racun });
  }

  getNarudzbineKor(idKor: string) {
    return this.http.get<any[]>(`${this.uri}/narudzbine/korisnik?idKor=${idKor}`);
  }

  otkaziNarudzbinu(idNar: string) {
    return this.http.post(`${this.uri}/narudzbine/otkazi`, { idNar });
  }

  getObjektiRadnika(idRadnika: string) {
    return this.http.get<any[]>(`${this.uri}/objekti/radnik?idRadnika=${idRadnika}`);
  }

  changePassword(kor_ime: string, nova_lozinka: string) {
    return this.http.post<{ message: string }>(`${this.uri}/changePassword`, { kor_ime, nova_lozinka });
  }

  clearToken(token: string) {
    let data = { token: token };
    return this.http.post<{ message: string }>(`${this.uri}/clearToken`, data);
  }

  checkToken(token: string) {
    let data = { token: token };
    return this.http.post<{ valid: boolean }>(`${this.uri}/checkToken`, data);
  }

  register(userData: any) {
    return this.http.post<{ message: string }>(`${this.uri}/register`, userData);
  }

  getAllSports() {
    return this.http.get<any[]>(`${this.uri}/getAllSports`); // Ocekujemo da mozda postoji u drugom ruteru, ali sacekaj da proverim
  }

  kreirajObjekat(podaci: any) {
    return this.http.post<{ message: string, error?: string }>(`${this.uri}/objekti/dodaj`, podaci);
  }

  dodajTeren(podaci: any) {
    return this.http.post<{ message: string, error?: string }>(`${this.uri}/tereni/dodaj`, podaci);
  }

  dodajObjekteIzJsona(objekti: any[]) {
    return this.http.post<{ message: string, error?: string }>(`${this.uri}/objekti/dodaj-json`, { objekti });
  }

  getRezervacijeRadnika(idRadnika: string) {
    return this.http.get<any[]>(`${this.uri}/radnik/rezervacije?idRadnika=${idRadnika}`);
  }

  potvrdiDolazak(tip: string, idZapisa: string) {
    return this.http.post<{ message: string }>(`${this.uri}/radnik/rezervacija/potvrdi`, { tip, idZapisa });
  }

  odjaviDolazak(tip: string, idZapisa: string, idKor: string, idObjekta: string) {
    return this.http.post<{ message: string }>(`${this.uri}/radnik/rezervacija/odjavi`, { tip, idZapisa, idKor, idObjekta });
  }

  getOpremaZaObjekat(idObj: string) {
    return this.http.get<any[]>(`${this.uri}/radnik/oprema/${idObj}`);
  }

  dodajOpremu(oprema: any) {
    return this.http.post<{ message: string, oprema?: any }>(`${this.uri}/radnik/oprema/dodaj`, oprema);
  }

  azurirajOpremu(_id: string, cena: number, zalihe: number) {
    return this.http.put<{ message: string }>(`${this.uri}/radnik/oprema/azuriraj`, { _id, cena, zalihe });
  }

  dodajPromociju(promocija: any) {
    return this.http.post<{ message: string }>(`${this.uri}/radnik/promocija/dodaj`, promocija);
  }

  azurirajPromociju(promocija: any) {
    return this.http.put<{ message: string }>(`${this.uri}/radnik/promocija/azuriraj`, promocija);
  }

  getNarudzbineZaObjekat(idObj: string) {
    return this.http.get<any[]>(`${this.uri}/radnik/narudzbine/${idObj}`);
  }

  promeniStatusNarudzbine(idNarudzbine: string, status: string) {
    return this.http.put<{ message: string }>(`${this.uri}/radnik/narudzbine/status`, { idNarudzbine, status });
  }

  getIzvestaj(idObj: string, godina: number, mesec: number) {
    return this.http.get<any>(`${this.uri}/radnik/izvestaj/${idObj}/${godina}/${mesec}`);
  }

  // --- ADMIN RUTE ---
  adminUri = "http://localhost:4000/admin";

  getKorisniciNaCekanju() {
    return this.http.get<any[]>(`${this.adminUri}/korisnici-cekanje`);
  }
  azurirajStatusKorisnika(id: string, status: string) {
    return this.http.put<{message: string}>(`${this.adminUri}/korisnici/status`, { id, status });
  }
  getSviAktivniKorisnici() {
    return this.http.get<any[]>(`${this.adminUri}/korisnici-aktivni`);
  }
  azurirajKorisnika(korisnik: any) {
    return this.http.put<{message: string}>(`${this.adminUri}/korisnici/azuriraj`, korisnik);
  }
  getObjektiNaCekanju() {
    return this.http.get<any[]>(`${this.adminUri}/objekti-cekanje`);
  }
  azurirajStatusObjekta(id: string, status: string) {
    return this.http.put<{message: string}>(`${this.adminUri}/objekti/status`, { id, status });
  }
  getSviTreneri() {
    return this.http.get<any[]>(`${this.adminUri}/treneri`);
  }
  deaktivirajTrenera(id: string) {
    return this.http.put<{message: string}>(`${this.adminUri}/treneri/deaktiviraj`, { id });
  }
  dodajSportAdmin(vrsta: string) {
    return this.http.post<{message: string}>(`${this.adminUri}/sport/dodaj`, { vrsta });
  }
}
