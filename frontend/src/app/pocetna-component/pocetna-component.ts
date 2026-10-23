import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Service } from '../services/service';

@Component({
  selector: 'app-pocetna-component',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './pocetna-component.html',
  styleUrl: './pocetna-component.css',
})
export class PocetnaComponent implements OnInit {

  ukupanBrojAktivnih: number = 0;
  top3Objekti: any[] = [];
  aktuelnePromocije: any[] = [];

  // Pretraga
  searchNaziv: string = "";
  searchGradovi: string[] = [];
  searchSport: string = "";
  searchTipTerena: string = "";
  searchSamoSlobodni: boolean = false;

  gradoviList: string[] = [];
  sportoviList: any[] = [];
  objektiList: any[] = [];
  searchResults: any[] = [];
  hasSearched: boolean = false;

  // Pretraga trenera
  searchTrenerSport: string = "";
  searchTrenerObjekat: string = "";
  treneriResults: any[] = [];
  hasSearchedTreneri: boolean = false;

  loggedUser: any = null;

  // Admin promenljive
  korisniciNaCekanju: any[] = [];
  sviAktivniKorisnici: any[] = [];
  objektiNaCekanju: any[] = [];
  sviTreneri: any[] = [];
  noviSport: string = "";

  private service = inject(Service);

  ngOnInit(): void {
    let u = localStorage.getItem('loggedUser');
    if (u) {
      this.loggedUser = JSON.parse(u);
    }
    this.ucitajPodatke();

    if (this.loggedUser && this.loggedUser.tip === 'admin') {
      this.ucitajAdminPodatke();
    }
  }

  ucitajAdminPodatke() {
    this.service.getKorisniciNaCekanju().subscribe(res => this.korisniciNaCekanju = res);
    this.service.getSviAktivniKorisnici().subscribe(res => this.sviAktivniKorisnici = res);
    this.service.getObjektiNaCekanju().subscribe(res => this.objektiNaCekanju = res);
    this.service.getSviTreneri().subscribe(res => this.sviTreneri = res);
  }

  odobriKorisnika(k: any, status: string) {
    this.service.azurirajStatusKorisnika(k._id, status).subscribe(res => {
      alert(res.message);
      this.ucitajAdminPodatke();
    });
  }

  deaktivirajKorisnika(k: any) {
    this.service.azurirajStatusKorisnika(k._id, 'obrisan').subscribe(res => {
      alert(res.message);
      this.ucitajAdminPodatke();
    });
  }

  odobriObjekat(o: any) {
    this.service.azurirajStatusObjekta(o._id, 'aktivan').subscribe(res => {
      alert(res.message);
      this.ucitajAdminPodatke();
      this.ucitajPodatke(); // osvezi i glavni prikaz
    });
  }

  deaktivirajTrenera(t: any) {
    this.service.deaktivirajTrenera(t._id).subscribe(res => {
      alert(res.message);
      this.ucitajAdminPodatke();
    });
  }

  dodajNoviSport() {
    if (!this.noviSport) return;
    this.service.dodajSportAdmin(this.noviSport).subscribe({
      next: (res) => {
        alert(res.message);
        this.noviSport = "";
        this.ucitajPodatke(); // Da bi se osvezila search lista sportova
      },
      error: (err) => alert(err.error.error || "Greska")
    });
  }

  ucitajPodatke() {
    // Inicijalni info
    this.service.getPocetnaInfo().subscribe(data => {
      this.ukupanBrojAktivnih = data.ukupanBrojAktivnih;
      this.top3Objekti = data.top3Objekti;
      this.aktuelnePromocije = data.aktuelnePromocije;
    });

    this.service.getGradovi().subscribe(res => {
      this.gradoviList = res;
    });

    // Sportovi
    this.service.getAllSports().subscribe(res => {
      this.sportoviList = res;
    });

    // Svi objekti za padajuci meni kod trenera
    this.service.searchObjekti("", [], "", "", false).subscribe(res => {
      this.objektiList = res;
    });
  }

  pretrazi() {
    this.hasSearched = true;
    this.service.searchObjekti(this.searchNaziv, this.searchGradovi, this.searchSport, this.searchTipTerena, this.searchSamoSlobodni).subscribe(res => {
      this.searchResults = res;
      if (this.sortColumn) {
        this.primeniSort();
      }
    });
  }

  pretraziTrenere() {
    this.service.pretraziTrenere(this.searchTrenerSport, this.searchTrenerObjekat).subscribe(res => {
      this.treneriResults = res;
      this.hasSearchedTreneri = true;
    });
  }

  zakaziTrening(idTrenera: string) {
    alert("Zakazi trening ce biti implementirano naknadno!");
  }

  // Polja za sortiranje
  sortColumn: string = '';
  sortDir: string = 'asc';

  sortData(col: string, dir: string) {
    this.sortColumn = col;
    this.sortDir = dir;
    this.primeniSort();
  }

  primeniSort() {
    this.searchResults.sort((a, b) => {
      let valA = a[this.sortColumn];
      let valB = b[this.sortColumn];

      if (Array.isArray(valA)) valA = valA.join(', ').toLowerCase();
      else if (typeof valA === 'string') valA = valA.toLowerCase();

      if (Array.isArray(valB)) valB = valB.join(', ').toLowerCase();
      else if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return this.sortDir === 'asc' ? -1 : 1;
      if (valA > valB) return this.sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }

  logout() {
    localStorage.removeItem('loggedUser');
    window.location.reload();
  }

}
