import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Service } from '../services/service';

@Component({
  selector: 'app-changepass-component',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './changepass-component.html',
  styleUrl: './changepass-component.css'
})
export class ChangepassComponent {
  identifier: string = "";
  message: string = "";
  token: string = "";
  
  private service = inject(Service);

  generateLink() {
    this.message = "";
    this.token = "";
    
    if (this.identifier === "") {
      this.message = "Unesite korisnicko ime ili e-mail!";
      return;
    }

    this.service.generateResetToken(this.identifier).subscribe(res => {
      if (res.token) {
        this.token = res.token;
        this.message = "Uspesno generisan link za promenu lozinke:";
      } else if (res.message) {
        this.message = res.message;
      }
    });
  }
}
