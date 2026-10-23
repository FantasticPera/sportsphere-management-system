import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Service } from '../services/service';
import { User } from '../models/user';

@Component({
  selector: 'app-oprema-promocije',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './oprema-promocije.html',
  styleUrl: './oprema-promocije.css'
})
export class OpremaPromocijeComponent implements OnInit {
  user: User = new User();
  mojiObjekti: any[] = [];
  izabraniObjekat: any = null;
  
  // Tabovi
  aktivniTab: 'oprema' | 'promocije' = 'oprema';

  // Oprema
  opremaLista: any[] = [];
  novaOprema: any = {
    naziv: '', cena: 0, zalihe: 0, vrsta_sporta: '', slika: ''
  };
  porukaOprema: string = '';

  // Promocije
  novaPromocija: any = {
    naziv: '', period_vazenja_od: '', period_vazenja_do: '', procenat: null, fiksni_popust: null, vrsta_sporta: ''
  };
  porukaPromocija: string = '';

  private service = inject(Service);
  private router = inject(Router);

  ngOnInit(): void {
    let u = localStorage.getItem('loggedUser');
    if (!u) {
      this.router.navigate(['/login']);
      return;
    }
    this.user = JSON.parse(u);
    if (this.user.tip !== 'radnik' && this.user.tip !== 'zaposleni') {
      this.router.navigate(['/']);
      return;
    }

    this.service.getObjektiRadnika(this.user._id).subscribe({
      next: (res) => {
        this.mojiObjekti = res;
      },
      error: (err) => console.log(err)
    });
  }

  onObjekatChange() {
    if (this.izabraniObjekat) {
      this.ucitajOpremu();
    } else {
      this.opremaLista = [];
    }
  }

  // --- OPREMA ---
  ucitajOpremu() {
    this.service.getOpremaZaObjekat(this.izabraniObjekat._id).subscribe(res => {
      this.opremaLista = res;
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.novaOprema.slika = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  dodajOpremu() {
    if (!this.izabraniObjekat) return;
    this.novaOprema.idObj = this.izabraniObjekat._id;

    if (!this.novaOprema.naziv || !this.novaOprema.vrsta_sporta) {
      this.porukaOprema = 'Naziv i vrsta sporta su obavezni.';
      return;
    }

    this.service.dodajOpremu(this.novaOprema).subscribe({
      next: (res) => {
        this.porukaOprema = res.message;
        this.ucitajOpremu();
        this.novaOprema = { naziv: '', cena: 0, zalihe: 0, vrsta_sporta: '', slika: '' };
      },
      error: (err) => this.porukaOprema = 'Greska pri dodavanju opreme.'
    });
  }

  azurirajOpremu(o: any) {
    this.service.azurirajOpremu(o._id, o.cena, o.zalihe).subscribe({
      next: (res) => {
        alert("Oprema uspesno azurirana!");
      },
      error: (err) => alert("Greska pri azuriranju opreme.")
    });
  }

  // --- PROMOCIJE ---
  dodajPromociju() {
    if (!this.izabraniObjekat) return;
    if (!this.novaPromocija.naziv || !this.novaPromocija.period_vazenja_od || !this.novaPromocija.period_vazenja_do) {
      this.porukaPromocija = 'Naziv i period (od-do) su obavezni.';
      return;
    }

    this.novaPromocija.idObj = this.izabraniObjekat._id;
    this.service.dodajPromociju(this.novaPromocija).subscribe({
      next: (res) => {
        this.porukaPromocija = res.message;
        // Da bismo osvezili prikaz, osvezavamo listu objekata
        this.service.getObjektiRadnika(this.user._id).subscribe(objekti => {
          this.mojiObjekti = objekti;
          this.izabraniObjekat = this.mojiObjekti.find(o => o._id === this.izabraniObjekat._id);
        });
        this.novaPromocija = { naziv: '', period_vazenja_od: '', period_vazenja_do: '', procenat: null, fiksni_popust: null, vrsta_sporta: '' };
      },
      error: (err) => this.porukaPromocija = 'Greska pri dodavanju promocije.'
    });
  }

  azurirajPromociju(p: any) {
    if (!this.izabraniObjekat) return;
    
    let podaci = {
      idObj: this.izabraniObjekat._id,
      idPromocije: p._id,
      naziv: p.naziv,
      period_vazenja_od: p.period_vazenja_od,
      period_vazenja_do: p.period_vazenja_do,
      procenat: p.procenat,
      fiksni_popust: p.fiksni_popust,
      vrsta_sporta: p.vrsta_sporta
    };

    this.service.azurirajPromociju(podaci).subscribe({
      next: (res) => {
        alert("Promocija uspesno azurirana!");
      },
      error: (err) => alert("Greska pri azuriranju promocije.")
    });
  }
}
