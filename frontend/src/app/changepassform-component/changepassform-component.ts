import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Service } from '../services/service';

@Component({
  selector: 'app-changepassform-component',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './changepassform-component.html',
  styleUrl: './changepassform-component.css'
})
export class ChangepassformComponent implements OnInit {
  token: string = "";
  newPassword: string = "";
  confirmPassword: string = "";
  message: string = "";
  successMessage: string = "";

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(Service);

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      let urlToken = params['token'] || "";
      if (urlToken) {
        this.service.checkToken(urlToken).subscribe(res => {
          if (res.valid) {
            this.token = urlToken;
          } else {
            this.token = ""; // Nevazeci token skriva formu
          }
        });
      }
    });
  }

  resetPassword() {
    this.message = "";
    this.successMessage = "";
    if (this.newPassword === "" || this.confirmPassword === "") {
      this.message = "Unesite lozinku u oba polja!";
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.message = "Lozinke se ne poklapaju!";
      return;
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9])[a-zA-Z].{7,11}$/;
    if (!passwordRegex.test(this.newPassword)) {
      this.message = "Lozinka mora imati 8-12 karaktera, bar jedno veliko slovo, jedan broj, jedan specijalni karakter i mora pocinjati slovom!";
      return;
    }

    this.service.resetPassword(this.token, this.newPassword).subscribe(res => {
      if (res.message.toLowerCase().includes("uspesno")) {
        this.successMessage = res.message;
        this.message = "";
      } else {
        this.message = res.message;
        this.successMessage = "";
      }
    });
  }

  goBack() {
    if (this.token) {
      this.service.clearToken(this.token).subscribe(() => {
        this.router.navigate(['/login']);
      });
    } else {
      this.router.navigate(['/login']);
    }
  }
}
