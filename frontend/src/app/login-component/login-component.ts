import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Service } from '../services/service';

@Component({
  selector: 'app-login-component',
  imports: [FormsModule, RouterLink],
  templateUrl: './login-component.html',
  styleUrl: './login-component.css',
})
export class LoginComponent {
  private router = inject(Router)
  private service = inject(Service)

  username: string = "";
  password: string = "";
  error: string = "";
  // admin: boolean = false;

  login() {
    if (this.username == "" || this.password == "") {
      this.error = "Niste uneli sve podatke!";
      return;
    }
    this.error = "";
    this.service.login(this.username, this.password).subscribe(k => {
      if (k) {
        if (k.tip === 'admin') {
          this.error = "Admin se mora prijaviti preko posebne stranice!";
          return;
        }
        if (k.status === 'neodobren') {
          this.error = "Vas nalog jos uvek nije odobren od strane administratora!";
          return;
        }
        localStorage.setItem("loggedUser", JSON.stringify(k));
        this.router.navigate(['/']);
      } else {
        this.error = "Losi podaci!";
        return;
      }
    })

  }
}
