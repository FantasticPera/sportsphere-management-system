import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Service } from '../services/service';
import { Sport } from '../models/sport';

@Component({
  selector: 'app-register-component',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './register-component.html',
  styleUrl: './register-component.css'
})
export class RegisterComponent implements OnInit {
  kor_ime: string = "";
  lozinka: string = "";
  ime: string = "";
  prezime: string = "";
  telefon: string = "";
  mejl: string = "";
  tip: string = "sportista";

  selectedVrste: string[] = [];
  sportoviList: Sport[] = [];
  message: string = "";
  successMessage: string = "";

  nazivObjekta: string = "";
  adresaObjekta: string = "";
  maticniBroj: string = "";
  pib: string = "";

  selectedFile: File | Blob | null = null;
  avatarPreviewUrl: string | null = null;
  generatedBlob: Blob | null = null;
  isFileConfirmed: boolean = false;

  private service = inject(Service);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.service.getAllSports().subscribe(sports => {
      this.sportoviList = sports.map(s => {
        let sport = new Sport();
        sport._id = s._id;
        sport.vrsta = s.vrsta;
        sport.selected = false;
        return sport;
      });
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

  private generationId: number = 0;

  generisiAvatar() {
    this.isFileConfirmed = false;
    const currentGenId = ++this.generationId; // Inkrenmentiramo ID za svaki novi zahtev
    const seed = Math.random().toString(36).substring(7);
    const svgUrl = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${seed}`;

    fetch(svgUrl)
      .then(res => res.text())
      .then(svgText => {
        if (currentGenId !== this.generationId) return; // Ignorisi ako je korisnik u medjuvremenu kliknuo ponovo

        const blob = new Blob([svgText], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const img = new Image();
        img.onload = () => {
          if (currentGenId !== this.generationId) return; // Ignorisi ako je zapoceta nova generacija

          const canvas = document.createElement('canvas');
          canvas.width = 200;
          canvas.height = 200;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, 200, 200);

            // Odmah azuriramo URL kako bi korisnik iste sekunde video sliku
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

  onSportChange() {
    this.sportoviList.forEach(s => {
      s.selected = this.selectedVrste.includes(s.vrsta);
    });

    let selectedCount = this.sportoviList.filter(s => s.selected).length;
    if (selectedCount > 5) {
      this.message = "Mozete izabrati najvise 5 sportova!";
    } else {
      this.message = "";
    }
  }

  register() {
    this.message = "";
    this.successMessage = "";

    if (this.kor_ime === "" || this.lozinka === "" || this.ime === "" ||
      this.prezime === "" || this.telefon === "" || this.mejl === "") {
      this.message = "Morate popuniti sva osnovna polja (osim slike)!";
      return;
    }

    if (this.tip === "radnik") {
      if (this.nazivObjekta === "" || this.adresaObjekta === "" || this.maticniBroj === "" || this.pib === "") {
        this.message = "Zaposleni moraju popuniti sve podatke o objektu!";
        return;
      }
      if (!/^\d{8}$/.test(this.maticniBroj)) {
        this.message = "Maticni broj mora imati tacno 8 cifara!";
        return;
      }
      if (!/^[1-9]\d{8}$/.test(this.pib)) {
        this.message = "PIB mora imati tacno 9 cifara i ne sme pocinjati nulom!";
        return;
      }
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9])[a-zA-Z].{7,11}$/;
    if (!passwordRegex.test(this.lozinka)) {
      this.message = "Lozinka mora imati 8-12 karaktera, bar jedno veliko slovo, jedan broj, jedan specijalni karakter i mora pocinjati slovom!";
      return;
    }

    let odabraniSportovi = this.sportoviList.filter(s => s.selected).map(s => s.vrsta);

    if (odabraniSportovi.length > 5) {
      this.message = "Mozete izabrati najvise 5 sportova!";
      return;
    }

    const formData = new FormData();
    formData.append('kor_ime', this.kor_ime);
    formData.append('lozinka', this.lozinka);
    formData.append('ime', this.ime);
    formData.append('prezime', this.prezime);
    formData.append('telefon', this.telefon);
    formData.append('mejl', this.mejl);
    formData.append('tip', this.tip);
    formData.append('omiljeni_sportovi', JSON.stringify(odabraniSportovi));

    if (this.tip === 'radnik') {
      formData.append('maticni_broj', this.maticniBroj);
      formData.append('nazivObjekta', this.nazivObjekta);
      formData.append('adresaObjekta', this.adresaObjekta);
      formData.append('pib', this.pib);
    }

    if (this.selectedFile) {
      let filename = (this.selectedFile as any).name || 'avatar.png';
      formData.append('slika', this.selectedFile, filename);
    }

    this.service.register(formData).subscribe(res => {
      if (res.message === "Uspesna registracija!") {
        this.successMessage = res.message;
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      } else {
        this.message = res.message;
      }
    });
  }
}
