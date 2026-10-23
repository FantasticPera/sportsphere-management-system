import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Service } from '../services/service';
import { User } from '../models/user';

@Component({
  selector: 'app-radnik-narudzbine',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './radnik-narudzbine.html',
  styleUrl: './radnik-narudzbine.css'
})
export class RadnikNarudzbineComponent implements OnInit {
  user: User = new User();
  mojiObjekti: any[] = [];
  izabraniObjekat: any = null;
  narudzbine: any[] = [];

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
      this.ucitajNarudzbine();
    } else {
      this.narudzbine = [];
    }
  }

  ucitajNarudzbine() {
    this.service.getNarudzbineZaObjekat(this.izabraniObjekat._id).subscribe({
      next: (res) => {
        // Sortiramo: prvo novije, ili mozda po statusu (aktivne prve)
        // Ostavljamo kako stize sa backenda za sad
        this.narudzbine = res;
      },
      error: (err) => console.log(err)
    });
  }

  promeniStatus(n: any, noviStatus: string) {
    this.service.promeniStatusNarudzbine(n._id, noviStatus).subscribe({
      next: (res) => {
        alert(res.message);
        this.ucitajNarudzbine();
      },
      error: (err) => alert("Greska pri promeni statusa.")
    });
  }
}
