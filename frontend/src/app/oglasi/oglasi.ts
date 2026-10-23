import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Service } from '../services/service';

@Component({
  selector: 'app-oglasi',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './oglasi.html',
  styleUrl: './oglasi.css'
})
export class OglasiComponent implements OnInit {
  loggedUser: any = null;
  
  mojiOglasi: any[] = [];
  tudjiOglasi: any[] = [];
  dostupneRezervacije: any[] = [];

  idRez: string = '';
  brojIgraca: number | null = null;
  poruka: string = '';

  mojiZahtevi: string[] = [];
  brojLjudiInput: { [oglasId: string]: number } = {};

  private service = inject(Service);

  ngOnInit() {
    let u = localStorage.getItem('loggedUser');
    if (u) {
      this.loggedUser = JSON.parse(u);
      this.ucitajPodatke();
    }
  }

  ucitajPodatke() {
    this.service.dohvatiOglase(this.loggedUser._id).subscribe(res => {
      this.mojiOglasi = res.moji;
      this.tudjiOglasi = res.tudji;
      // Inicijalizacija polja za unos
      for (let o of this.tudjiOglasi) {
        if (!this.brojLjudiInput[o._id]) {
          this.brojLjudiInput[o._id] = 1;
        }
      }
    });

    this.service.rezervacijeZaOglas(this.loggedUser._id).subscribe(res => {
      this.dostupneRezervacije = res;
    });

    this.service.dohvatiMojeZahteve(this.loggedUser._id).subscribe(res => {
      this.mojiZahtevi = res;
    });
  }

  kreirajOglas() {
    if (!this.idRez || !this.brojIgraca || this.brojIgraca <= 0) {
      this.poruka = "Morate izabrati termin i uneti ispravan broj igraca.";
      return;
    }

    this.service.kreirajOglas(this.loggedUser._id, this.idRez, this.brojIgraca).subscribe({
      next: (res: any) => {
        this.poruka = res.message;
        this.idRez = '';
        this.brojIgraca = null;
        this.ucitajPodatke(); // osvezi liste
      },
      error: (err) => {
        this.poruka = err.error?.error || "Greska pri kreiranju oglasa.";
      }
    });
  }

  posaljiZahtev(oglasId: string) {
    let broj = this.brojLjudiInput[oglasId];
    let oglas = this.tudjiOglasi.find(o => o._id === oglasId);

    if (!broj || broj <= 0) {
      alert("Molimo unesite validan broj ljudi.");
      return;
    }
    if (oglas && broj > oglas.broj_nedostajucih_igraca) {
      alert("Broj ljudi ne moze biti veci od broja nedostajucih igraca!");
      return;
    }

    this.service.posaljiZahtevOglas(this.loggedUser._id, oglasId, broj).subscribe({
      next: (res: any) => {
        alert(res.message);
        this.mojiZahtevi.push(oglasId);
      },
      error: (err) => {
        alert(err.error?.error || "Greska pri slanju zahteva.");
      }
    });
  }

  proveriZahteve(oglasId: string) {
    alert("Bice implementirano naknadno!");
  }

  zatvoriOglas(oglasId: string) {
    alert("Bice implementirano naknadno!");
  }
}
