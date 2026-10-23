import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Service } from '../services/service';

@Component({
  selector: 'app-loginadmin-component',
  imports: [FormsModule],
  templateUrl: './loginadmin-component.html',
  styleUrl: './loginadmin-component.css',
})
export class LoginadminComponent {
  private router = inject(Router)
  private service = inject(Service)

  username: string = "";
  password: string = "";
  error: string = "";

  login() {
    if (this.username == "" || this.password == "") {
      this.error = "Niste uneli sve podatke!";
      return;
    }
    this.error = "";
    this.service.login(this.username, this.password).subscribe(k => {
      if (k) {
        if (k.tip != 'admin') {
          this.error = "Pristup je dozvoljen samo administratorima!";
          return;
        }
        localStorage.setItem("loggedUser", JSON.stringify(k))
        this.router.navigate(['/'])
        console.log(k)
      } else {
        this.error = "Losi podaci!";
        return;
      }
    })

  }
}
