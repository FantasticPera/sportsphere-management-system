import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './header-component/header-component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit{

  private router = inject(Router)
  ngOnInit(): void {
    // Uklonjeno prisilno vracanje na login, prepustamo Angular ruteru
  }
  
}
