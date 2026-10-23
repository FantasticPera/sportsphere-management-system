import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-header-component',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header-component.html',
  styleUrl: './header-component.css'
})
export class HeaderComponent implements OnInit {
  loggedUser: any = null;
  private router = inject(Router);

  ngOnInit() {
    this.checkUser();
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.checkUser();
      }
    });
  }

  checkUser() {
    let u = localStorage.getItem('loggedUser');
    if (u) {
      this.loggedUser = JSON.parse(u);
    } else {
      this.loggedUser = null;
    }
  }

  logout() {
    localStorage.removeItem('loggedUser');
    this.loggedUser = null;
    this.router.navigate(['/login']);
  }
}
