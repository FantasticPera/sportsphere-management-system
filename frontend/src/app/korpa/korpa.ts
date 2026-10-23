import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { Service } from '../services/service';

@Component({
  selector: 'app-korpa',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './korpa.html',
  styleUrl: './korpa.css'
})
export class KorpaComponent implements OnInit {
  korpa: any = null;
  objekat: any = null;
  loggedUser: any = null;
  poruka: string = '';

  ukupnoBezPopusta: number = 0;
  ukupnoZaPlacanje: number = 0;

  private service = inject(Service);
  private router = inject(Router);

  ngOnInit(): void {
    let u = localStorage.getItem('loggedUser');
    if (u) {
      this.loggedUser = JSON.parse(u);
    } else {
      this.router.navigate(['/login']);
      return;
    }

    let k = localStorage.getItem('korpa');
    if (k) {
      this.korpa = JSON.parse(k);
      this.service.getObjekat(this.korpa.idObj).subscribe(o => {
        this.objekat = o;
        this.izracunajCenu();
      });
    }
  }

  izracunajCenu() {
    this.ukupnoBezPopusta = 0;
    this.ukupnoZaPlacanje = 0;

    if (!this.korpa || !this.korpa.proizvodi) return;

    let danas = new Date().toISOString().split('T')[0];

    for (let p of this.korpa.proizvodi) {
      let stavkaUkupno = p.cena * p.kolicina;
      this.ukupnoBezPopusta += stavkaUkupno;

      let popustCenaPoKomadu = p.cena;

      // Proveri promocije za ovaj sport
      if (this.objekat && this.objekat.promocije) {
        for (let promo of this.objekat.promocije) {
          if (promo.vrsta_sporta === p.vrsta_sporta && promo.period_vazenja_od <= danas && promo.period_vazenja_do >= danas) {
            if (promo.procenat > 0) {
              popustCenaPoKomadu = popustCenaPoKomadu * (1 - promo.procenat / 100);
            }
            if (promo.fiksni_popust > 0) {
              popustCenaPoKomadu = popustCenaPoKomadu - promo.fiksni_popust;
            }
          }
        }
      }

      if (popustCenaPoKomadu < 0) popustCenaPoKomadu = 0;

      this.ukupnoZaPlacanje += (popustCenaPoKomadu * p.kolicina);
      p.cenaSaPopustom = popustCenaPoKomadu;
    }
  }

  ukloni(index: number) {
    this.korpa.proizvodi.splice(index, 1);
    if (this.korpa.proizvodi.length === 0) {
      this.korpa = null;
      localStorage.removeItem('korpa');
    } else {
      localStorage.setItem('korpa', JSON.stringify(this.korpa));
      this.izracunajCenu();
    }
  }

  isprazni() {
    this.korpa = null;
    localStorage.removeItem('korpa');
  }

  naruci() {
    if (!this.korpa || this.korpa.proizvodi.length === 0) return;
    
    this.service.kreirajNarudzbinu(
      this.loggedUser._id,
      this.korpa.idObj,
      this.korpa.proizvodi,
      this.ukupnoZaPlacanje
    ).subscribe({
      next: (res: any) => {
        this.poruka = "Narudzbina uspesno poslata!";
        this.korpa = null;
        localStorage.removeItem('korpa');
      },
      error: (err) => {
        this.poruka = err.error?.error || "Greska pri narucivanju.";
      }
    });
  }
}
