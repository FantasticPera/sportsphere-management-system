import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Service } from '../services/service';

@Component({
  selector: 'app-zakazi-trening',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './zakazi-trening.html',
  styleUrl: './zakazi-trening.css'
})
export class ZakaziTreningComponent implements OnInit {

  idTrenera: string | null = null;
  trener: any = null;
  loggedUser: any = null;

  datum: string = '';
  od: string = '';
  doVreme: string = '';

  poruka: string = '';

  private route = inject(ActivatedRoute);
  private service = inject(Service);

  ngOnInit() {
    let u = localStorage.getItem('loggedUser');
    if (u) {
      this.loggedUser = JSON.parse(u);
    }
    
    this.idTrenera = this.route.snapshot.paramMap.get('id');
    if (this.idTrenera) {
      this.service.getTrener(this.idTrenera).subscribe(res => {
        this.trener = res;
      });
    }

    // Min datum = danas
    let now = new Date();
    this.datum = now.toISOString().split('T')[0];
  }

  get minDatum(): string {
    return new Date().toISOString().split('T')[0];
  }

  zakazi() {
    if (!this.datum || !this.od || !this.doVreme) {
      this.poruka = "Molimo unesite datum i vreme treninga.";
      return;
    }

    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timeRegex.test(this.od) || !timeRegex.test(this.doVreme)) {
      this.poruka = "Vreme mora biti u formatu HH:mm (npr. 14:00).";
      return;
    }

    if (this.od >= this.doVreme) {
      this.poruka = "Vreme pocetka mora biti pre vremena zavrsetka.";
      return;
    }

    if (this.idTrenera && this.loggedUser) {
      this.service.zakaziTrening(this.loggedUser._id, this.idTrenera, this.datum, this.od, this.doVreme).subscribe({
        next: (res: any) => {
          this.poruka = res.message;
        },
        error: (err) => {
          this.poruka = err.error?.error || "Greska pri zakazivanju treninga.";
        }
      });
    }
  }
}
