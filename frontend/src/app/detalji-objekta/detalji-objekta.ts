import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Service } from '../services/service';
import { KalendarComponent } from '../kalendar-component/kalendar-component';

@Component({
  selector: 'app-detalji-objekta',
  standalone: true,
  imports: [CommonModule, RouterLink, KalendarComponent, FormsModule],
  templateUrl: './detalji-objekta.html',
  styleUrl: './detalji-objekta.css'
})
export class DetaljiObjektaComponent implements OnInit {
  objekat: any = null;
  loggedUser: any = null;

  @ViewChild(KalendarComponent) kalendar!: KalendarComponent;

  // Polja za rezervaciju
  rezTerenId: string = '';
  rezDatum: string = '';
  rezOd: string = '';
  rezDo: string = '';
  poruka: string = '';
  satiOd: string[] = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'];
  satiDo: string[] = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'];

  private route = inject(ActivatedRoute);
  private service = inject(Service);

  opremaSva: any[] = [];
  opremaPrikaz: any[] = [];
  sportovi: any[] = [];
  odabraniSport: string = "";

  ngOnInit(): void {
    let u = localStorage.getItem('loggedUser');
    if (u) {
      this.loggedUser = JSON.parse(u);
    }

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.service.getObjekat(id).subscribe(o => {
        this.objekat = o;
        if (this.objekat.tereni && this.objekat.tereni.length > 0) {
          this.rezTerenId = this.objekat.tereni[0]._id;
        }

        this.service.getOprema(this.objekat._id).subscribe(op => {
          this.opremaSva = op.map(item => ({...item, trazenaKolicina: 1}));
          this.opremaPrikaz = [...this.opremaSva];
        });
      });
    }

    this.service.getAllSports().subscribe(s => {
      this.sportovi = s;
    });
  }

  filtrirajOpremu() {
    if (this.odabraniSport === "") {
      this.opremaPrikaz = [...this.opremaSva];
    } else {
      this.opremaPrikaz = this.opremaSva.filter(o => o.vrsta_sporta === this.odabraniSport);
    }
  }

  dodajUKorpu(op: any) {
    if (op.trazenaKolicina < 1 || op.trazenaKolicina > op.zalihe) {
      alert("Neispravna kolicina!");
      return;
    }

    let korpaStr = localStorage.getItem('korpa');
    let korpa = korpaStr ? JSON.parse(korpaStr) : { idObj: this.objekat._id, nazivObjekta: this.objekat.naziv, proizvodi: [] };

    if (korpa.idObj !== this.objekat._id) {
      alert("Korpa vec sadrzi opremu iz drugog objekta! Zavrsite ili ispraznite tu korpu prvo.");
      return;
    }

    let p = korpa.proizvodi.find((x: any) => x.idOpreme === op._id);
    if (p) {
      if (p.kolicina + op.trazenaKolicina > op.zalihe) {
        alert("Nema toliko na zalihama ukupno!");
        return;
      }
      p.kolicina += op.trazenaKolicina;
    } else {
      korpa.proizvodi.push({
        idOpreme: op._id,
        naziv: op.naziv,
        slika: op.slika,
        cena: op.cena,
        kolicina: op.trazenaKolicina,
        vrsta_sporta: op.vrsta_sporta
      });
    }

    localStorage.setItem('korpa', JSON.stringify(korpa));
    alert(`${op.naziv} dodato u korpu!`);
    op.trazenaKolicina = 1;
  }

  rezervisi() {
    if (!this.rezTerenId || !this.rezDatum || !this.rezOd || !this.rezDo) {
      this.poruka = "Sva polja su obavezna!";
      return;
    }
    if (this.rezOd >= this.rezDo) {
      this.poruka = "Vreme 'Od' mora biti pre vremena 'Do'!";
      return;
    }

    this.service.rezervisiTeren(this.loggedUser._id, this.objekat._id, this.rezTerenId, this.rezDatum, this.rezOd, this.rezDo)
      .subscribe({
        next: (res: any) => {
          this.poruka = res.message || "Uspesno rezervisano!";
          if (this.kalendar) {
            this.kalendar.fetchData();
          }
        },
        error: (err) => {
          this.poruka = err.error?.error || "Greska pri rezervaciji.";
        }
      });
  }
}
