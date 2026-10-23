import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Service } from '../services/service';
import { Router, RouterLink } from '@angular/router';
import { User } from '../models/user';
import { KalendarComponent } from '../kalendar-component/kalendar-component';

@Component({
  selector: 'app-radnik-rezervacije',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, KalendarComponent],
  templateUrl: './radnik-rezervacije.html',
  styleUrl: './radnik-rezervacije.css',
})
export class RadnikRezervacijeComponent implements OnInit {
  zapisi: any[] = [];
  user: User = new User();
  mojiObjekti: any[] = [];
  izabraniObjekat: any = null;
  
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

    this.dohvatiPodatke();

    this.service.getObjektiRadnika(this.user._id).subscribe({
      next: (res) => {
        this.mojiObjekti = res;
      },
      error: (err) => console.log(err)
    });
  }

  dohvatiPodatke() {
    this.service.getRezervacijeRadnika(this.user._id).subscribe({
      next: (res) => {
        this.zapisi = res;
      },
      error: (err) => {
        console.log("Greska pri dohvatanju rezervacija", err);
      }
    });
  }

  mozePotvrditi(z: any): boolean {
    // Svi koji nisu zavrseni (odrzano, nije_dosao) ili otkazani
    if (z.status === 'odrzano' || z.status === 'nije_dosao' || z.status === 'otkazano') return false;

    // Parsiranje datuma i vremena pocetka
    let [godina, mesec, dan] = z.datum.split('-');
    let [sati, minuti] = z.interval_od.split(':');

    let vremePocetka = new Date(parseInt(godina), parseInt(mesec) - 1, parseInt(dan), parseInt(sati), parseInt(minuti), 0);
    let trenutno = new Date();

    let razlikaMinuti = (trenutno.getTime() - vremePocetka.getTime()) / 60000;
    
    // Moguce je kliknuti samo 10 minuta pred termin i bilo kad posle toga
    return razlikaMinuti >= -10;
  }

  potvrdi(z: any) {
    this.service.potvrdiDolazak(z.tip, z._id).subscribe({
      next: (res) => {
        this.dohvatiPodatke();
      },
      error: (err) => {
        alert("Greska pri potvrdjivanju.");
      }
    });
  }

  odjavi(z: any) {
    this.service.odjaviDolazak(z.tip, z._id, z.idKor, z.idObjekta).subscribe({
      next: (res) => {
        this.dohvatiPodatke();
      },
      error: (err) => {
        alert("Greska pri odjavljivanju.");
      }
    });
  }
}
