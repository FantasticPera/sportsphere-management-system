import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Service } from '../services/service';

@Component({
  selector: 'app-zahtevi',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './zahtevi.html',
  styleUrl: './zahtevi.css'
})
export class ZahteviComponent implements OnInit {
  idOglas: string | null = null;
  zahtevi: any[] = [];
  poruka: string = '';

  private route = inject(ActivatedRoute);
  private service = inject(Service);

  ngOnInit() {
    this.idOglas = this.route.snapshot.paramMap.get('id');
    if (this.idOglas) {
      this.ucitajZahteve();
    }
  }

  ucitajZahteve() {
    if (this.idOglas) {
      this.service.dohvatiZahteveZaOglas(this.idOglas).subscribe(res => {
        this.zahtevi = res;
      });
    }
  }

  obradi(idZahtev: string, akcija: string) {
    if (!this.idOglas) return;

    this.service.obradiZahtev(idZahtev, this.idOglas, akcija).subscribe({
      next: (res: any) => {
        this.poruka = res.message;
        this.ucitajZahteve();
      },
      error: (err) => {
        alert(err.error?.error || "Greska pri obradi zahteva.");
      }
    });
  }
}
