import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Service } from '../services/service';
import { User } from '../models/user';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-radnik-izvestaji',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './radnik-izvestaji.html',
  styleUrl: './radnik-izvestaji.css'
})
export class RadnikIzvestajiComponent implements OnInit {
  user: User = new User();
  mojiObjekti: any[] = [];
  
  izabraniObjekat: any = null;
  mesec: number = new Date().getMonth() + 1; // 1-12
  godina: number = new Date().getFullYear();

  meseci = [
    { val: 1, naziv: 'Januar' }, { val: 2, naziv: 'Februar' }, { val: 3, naziv: 'Mart' },
    { val: 4, naziv: 'April' }, { val: 5, naziv: 'Maj' }, { val: 6, naziv: 'Jun' },
    { val: 7, naziv: 'Jul' }, { val: 8, naziv: 'Avgust' }, { val: 9, naziv: 'Septembar' },
    { val: 10, naziv: 'Oktobar' }, { val: 11, naziv: 'Novembar' }, { val: 12, naziv: 'Decembar' }
  ];
  godine = [2023, 2024, 2025, 2026, 2027];

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

  generisiPDF() {
    if (!this.izabraniObjekat) {
      alert("Izaberite objekat!");
      return;
    }

    this.service.getIzvestaj(this.izabraniObjekat._id, this.godina, this.mesec).subscribe({
      next: (podaci) => {
        const doc = new jsPDF();
        
        doc.setFontSize(18);
        doc.text(`Izvestaj za objekat: ${this.izabraniObjekat.naziv}`, 14, 20);
        
        doc.setFontSize(12);
        let mNaziv = this.meseci.find(m => m.val === this.mesec)?.naziv;
        doc.text(`Period: ${mNaziv} ${this.godina}`, 14, 30);
        
        // Tabelarni prikaz za terene
        doc.setFontSize(14);
        doc.text(`Popunjenost terena`, 14, 45);
        
        let terenBody = podaci.popunjenost.map((t: any) => [t.teren, t.sati, `${t.procenat}%`]);
        autoTable(doc, {
          startY: 50,
          head: [['Teren / Hala', 'Zauzeti sati', 'Popunjenost (%)']],
          body: terenBody,
        });

        // Tabelarni prikaz za opremu
        let finalY = (doc as any).lastAutoTable.finalY + 15;
        
        doc.text(`Promet opreme (Zavrsene narudzbine)`, 14, finalY);
        
        let opremaBody = podaci.promet.map((o: any) => [o.naziv, o.kolicina, `${o.prihod} RSD`]);
        if (opremaBody.length === 0) {
          opremaBody = [['Nema podataka', '-', '-']];
        }
        autoTable(doc, {
          startY: finalY + 5,
          head: [['Naziv opreme', 'Prodata kolicina', 'Ukupan prihod']],
          body: opremaBody,
        });

        doc.save(`Izvestaj_${this.izabraniObjekat.naziv}_${mNaziv}_${this.godina}.pdf`);
      },
      error: (err) => {
        console.log(err);
        alert("Greska pri dohvatanju podataka za izvestaj.");
      }
    });
  }
}
