import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Service } from '../services/service';
import { User } from '../models/user';

@Component({
  selector: 'app-profil-component',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './profil-component.html',
  styleUrl: './profil-component.css'
})
export class ProfilComponent implements OnInit {
  user: User = new User();
  sportoviList: any[] = [];
  
  message: string = '';

  selectedFile: File | Blob | null = null;
  avatarPreviewUrl: string | null = null;
  generatedBlob: Blob | null = null;
  isFileConfirmed: boolean = false;
  private generationId: number = 0;

  private service = inject(Service);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  rezervacije: any[] = [];
  treninzi: any[] = [];
  narudzbine: any[] = [];
  mojiObjekti: any[] = [];
  sortKey: string = '';
  sortAsc: boolean = true;

  ngOnInit(): void {
    let u = localStorage.getItem('loggedUser');
    if (!u) {
      this.router.navigate(['/login']);
      return;
    }
    
    let parsedUser = JSON.parse(u);
    this.service.getUserByUsername(parsedUser.kor_ime).subscribe(data => {
      if (data) {
        this.user = data;
        localStorage.setItem('loggedUser', JSON.stringify(data));
        if (this.user.tip === 'sportista') {
          this.service.getUserReservations(this.user._id).subscribe(res => {
            this.rezervacije = res;
          });
          this.service.getUserTreninzi(this.user._id).subscribe(res => {
            this.treninzi = res;
          });
          this.service.getNarudzbineKor(this.user._id).subscribe(res => {
            this.narudzbine = res;
          });
        } else if (this.user.tip === 'radnik' || this.user.tip === 'zaposleni') {
          this.service.getObjektiRadnika(this.user._id).subscribe(res => {
            this.mojiObjekti = res;
          });
        }
      }
    });

    this.service.getAllSports().subscribe(s => {
      this.sportoviList = s;
    });
  }

  sortData(key: string, dir: number) {
    this.rezervacije.sort((a, b) => {
      let v1 = a[key] || '';
      let v2 = b[key] || '';
      if (typeof v1 === 'string') v1 = v1.toString().toLowerCase();
      if (typeof v2 === 'string') v2 = v2.toString().toLowerCase();
      if (v1 < v2) return -1 * dir;
      if (v1 > v2) return 1 * dir;
      return 0;
    });
  }

  otkazi(idRez: string) {
    this.service.otkaziRezervaciju(idRez).subscribe(res => {
      this.service.getUserReservations(this.user._id).subscribe(r => {
        this.rezervacije = r;
      });
    }, err => {
      alert('Doslo je do greske pri otkazivanju rezervacije.');
    });
  }

  otkaziOpremu(idNar: string) {
    this.service.otkaziNarudzbinu(idNar).subscribe({
      next: (res: any) => {
        this.service.getNarudzbineKor(this.user._id).subscribe(r => {
          this.narudzbine = r;
        });
      },
      error: (err) => {
        alert(err.error?.error || 'Doslo je do greske pri otkazivanju.');
      }
    });
  }

  onFileSelected(event: any) {
    if (event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
      this.generatedBlob = null;
      this.isFileConfirmed = true;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.avatarPreviewUrl = e.target.result;
      };
      reader.readAsDataURL(this.selectedFile as File);
    }
  }

  generisiAvatar() {
    this.isFileConfirmed = false;
    const currentGenId = ++this.generationId;
    const seed = Math.random().toString(36).substring(7);
    const svgUrl = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${seed}`;

    fetch(svgUrl)
      .then(res => res.text())
      .then(svgText => {
        if (currentGenId !== this.generationId) return; 

        const blob = new Blob([svgText], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const img = new Image();
        img.onload = () => {
          if (currentGenId !== this.generationId) return;

          const canvas = document.createElement('canvas');
          canvas.width = 200;
          canvas.height = 200;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, 200, 200);

            this.avatarPreviewUrl = canvas.toDataURL('image/png');

            canvas.toBlob((pngBlob) => {
              if (currentGenId !== this.generationId) return;
              if (pngBlob) {
                this.generatedBlob = pngBlob;
                this.cdr.detectChanges();
              }
            }, 'image/png');
          }
        };
        img.src = url;
      }).catch(err => console.error("Greska pri generisanju avatara: ", err));
  }

  sacuvajAvatar() {
    if (this.generatedBlob) {
      this.selectedFile = this.generatedBlob;
      this.isFileConfirmed = true;
    }
  }

  toggleSport(sportNaziv: string) {
    let idx = this.user.omiljeni_sportovi.indexOf(sportNaziv);
    if (idx > -1) {
      this.user.omiljeni_sportovi.splice(idx, 1);
    } else {
      this.user.omiljeni_sportovi.push(sportNaziv);
    }
  }

  azuriraj() {
    const formData = new FormData();
    formData.append('kor_ime', this.user.kor_ime);
    formData.append('ime', this.user.ime);
    formData.append('prezime', this.user.prezime);
    formData.append('telefon', this.user.telefon);
    formData.append('mejl', this.user.mejl);
    formData.append('omiljeni_sportovi', JSON.stringify(this.user.omiljeni_sportovi));

    if (this.selectedFile) {
      let filename = (this.selectedFile as any).name || 'avatar.png';
      formData.append('slika', this.selectedFile, filename);
    }

    this.service.updateProfile(formData).subscribe(res => {
      this.message = 'Profil je uspesno azuriran!';
      this.user = res;
      localStorage.setItem('loggedUser', JSON.stringify(res));
    }, err => {
      this.message = 'Greska pri azuriranju profila.';
    });
  }

  showPasswordForm: boolean = false;
  novaLozinka: string = "";
  potvrdaLozinke: string = "";
  passMessage: string = "";
  passSuccess: string = "";

  promeniLozinku() {
    this.passMessage = "";
    this.passSuccess = "";

    if (this.novaLozinka === "" || this.potvrdaLozinke === "") {
      this.passMessage = "Morate uneti i potvrditi novu lozinku.";
      return;
    }
    if (this.novaLozinka !== this.potvrdaLozinke) {
      this.passMessage = "Lozinke se ne poklapaju.";
      return;
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9])[a-zA-Z].{7,11}$/;
    if (!passwordRegex.test(this.novaLozinka)) {
      this.passMessage = "Lozinka mora imati 8-12 karaktera, bar jedno veliko slovo, jedan broj, jedan specijalni karakter i mora pocinjati slovom!";
      return;
    }

    this.service.changePassword(this.user.kor_ime, this.novaLozinka).subscribe(res => {
      this.passSuccess = "Lozinka je uspesno izmenjena!";
      this.novaLozinka = "";
      this.potvrdaLozinke = "";
      setTimeout(() => {
        this.showPasswordForm = false;
        this.passSuccess = "";
      }, 3000);
    }, err => {
      this.passMessage = "Greska pri promeni lozinke.";
    });
  }

  // NOVO: Dodavanje Objekta
  prikaziDodajObjekat: boolean = false;
  noviObjekat: any = {
    naziv: '',
    mesto: '',
    adresa: '',
    vrsta_sporta: [],
    radno_vreme_od: '',
    radno_vreme_do: '',
    dozvoljena_kaznena_nepojavljivanja: 3
  };
  porukaObjekat: string = '';

  toggleSportNoviObjekat(sport: string) {
    let idx = this.noviObjekat.vrsta_sporta.indexOf(sport);
    if (idx > -1) {
      this.noviObjekat.vrsta_sporta.splice(idx, 1);
    } else {
      this.noviObjekat.vrsta_sporta.push(sport);
    }
  }

  dodajObjekat() {
    this.noviObjekat.idRadnika = this.user._id;
    this.service.kreirajObjekat(this.noviObjekat).subscribe({
      next: (res: any) => {
        this.porukaObjekat = res.message;
        // Osvezi tabelu objekata
        this.service.getObjektiRadnika(this.user._id).subscribe(r => this.mojiObjekti = r);
        this.prikaziDodajObjekat = false;
        this.noviObjekat = { naziv: '', mesto: '', adresa: '', vrsta_sporta: [], radno_vreme_od: '', radno_vreme_do: '', dozvoljena_kaznena_nepojavljivanja: 3 };
      },
      error: (err) => {
        this.porukaObjekat = err.error?.error || "Greska pri dodavanju objekta.";
      }
    });
  }

  jsonFajlSadrzaj: any[] | null = null;
  onJsonFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        try {
          const content = JSON.parse(e.target.result);
          this.jsonFajlSadrzaj = Array.isArray(content) ? content : [content];
        } catch (err) {
          this.porukaObjekat = "Greska pri parsiranju JSON fajla.";
          this.jsonFajlSadrzaj = null;
        }
      };
      reader.readAsText(file);
    }
  }

  dodajIzJsona() {
    if (!this.jsonFajlSadrzaj) return;
    
    // Validacija
    for (let obj of this.jsonFajlSadrzaj) {
      if (!obj.naziv || !obj.adresa || !obj.mesto || obj.lat == null || obj.lng == null) {
        this.porukaObjekat = `Objekat ${obj.naziv || 'nepoznat'} nema sva obavezna polja (naziv, adresa, mesto, lat, lng).`;
        return;
      }
      if (!obj.pib || !/^[1-9][0-9]{8}$/.test(obj.pib.toString())) {
        this.porukaObjekat = `Objekat ${obj.naziv} ima neispravan PIB (mora imati tacno 9 cifara i ne sme poceti nulom).`;
        return;
      }
      if (obj.radnici && obj.radnici.length > 2) {
        this.porukaObjekat = `Objekat ${obj.naziv} ne moze imati vise od 2 radnika.`;
        return;
      }
      if (obj.tereni && Array.isArray(obj.tereni)) {
        for (let t of obj.tereni) {
          if (t.opis_opreme && t.opis_opreme.length > 300) {
            this.porukaObjekat = `Teren ${t.naziv} u objektu ${obj.naziv} ima opis opreme duzi od 300 karaktera.`;
            return;
          }
        }
      }
    }

    // Dodela trenutnog radnika objektima (ako nemaju radnika ili zelimo da ga vezemo za njega)
    // Mozemo dodati idRadnika u radnike svakom objektu, da bi se prikazivali
    this.jsonFajlSadrzaj.forEach(obj => {
      if (!obj.radnici) obj.radnici = [];
      if (!obj.radnici.includes(this.user._id) && obj.radnici.length < 2) {
         obj.radnici.push(this.user._id);
         obj.broj_radnika = obj.radnici.length;
      }
    });

    this.service.dodajObjekteIzJsona(this.jsonFajlSadrzaj).subscribe({
      next: (res: any) => {
        this.porukaObjekat = res.message;
        this.service.getObjektiRadnika(this.user._id).subscribe(r => this.mojiObjekti = r);
        this.jsonFajlSadrzaj = null;
      },
      error: (err) => {
        this.porukaObjekat = err.error?.error || "Greska pri upisu objekata iz JSON-a.";
      }
    });
  }

  // NOVO: Dodavanje Terena
  prikaziDodajTeren: boolean = false;
  noviTeren: any = {
    idObjekta: '',
    naziv: '',
    tip_terena: 'otvoren', // default ili prazno
    kapacitet: 1,
    opis_opreme: '',
    cena: 0
  };
  porukaTeren: string = '';

  dodajNoviTeren() {
    if (!this.noviTeren.idObjekta) {
      this.porukaTeren = "Morate izabrati objekat.";
      return;
    }
    if (this.noviTeren.opis_opreme && this.noviTeren.opis_opreme.length > 300) {
      this.porukaTeren = "Opis opreme moze imati maksimalno 300 karaktera.";
      return;
    }
    this.service.dodajTeren(this.noviTeren).subscribe({
      next: (res: any) => {
        this.porukaTeren = res.message;
        this.service.getObjektiRadnika(this.user._id).subscribe(r => this.mojiObjekti = r);
        this.prikaziDodajTeren = false;
        this.noviTeren = { idObjekta: '', naziv: '', tip_terena: 'otvoren', kapacitet: 1, opis_opreme: '', cena: 0 };
      },
      error: (err) => {
        this.porukaTeren = err.error?.error || "Greska pri dodavanju terena.";
      }
    });
  }
}
