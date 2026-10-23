import { Component, Input, OnInit, OnChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Service } from '../services/service';

@Component({
  selector: 'app-kalendar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './kalendar-component.html',
  styleUrl: './kalendar-component.css'
})
export class KalendarComponent implements OnInit, OnChanges {
  @Input() objekat: any;

  private service = inject(Service);

  currentWeekStart: Date = new Date();
  weekDays: Date[] = [];
  hours: number[] = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22];
  satiOd: string[] = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'];
  satiDo: string[] = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'];

  currentTerenIndex: number = 0;
  currentTeren: any = null;

  rezervacije: any[] = [];
  treninzi: any[] = [];

  ngOnInit() {
    let day = this.currentWeekStart.getDay(),
        diff = this.currentWeekStart.getDate() - day + (day == 0 ? -6 : 1);
    this.currentWeekStart = new Date(this.currentWeekStart.setDate(diff));
    this.currentWeekStart.setHours(0, 0, 0, 0);

    this.calculateWeekDays();
  }

  ngOnChanges() {
    if (this.objekat && this.objekat.tereni && this.objekat.tereni.length > 0) {
      this.currentTeren = this.objekat.tereni[this.currentTerenIndex];
      this.fetchData();
    }
  }

  calculateWeekDays() {
    this.weekDays = [];
    for (let i = 0; i < 7; i++) {
      let d = new Date(this.currentWeekStart);
      d.setDate(d.getDate() + i);
      this.weekDays.push(d);
    }
    this.fetchData();
  }

  get isPrevWeekDisabled(): boolean {
    let today = new Date();
    let todayDay = today.getDay();
    let todayWeekStart = new Date(today.setDate(today.getDate() - todayDay + (todayDay == 0 ? -6 : 1)));
    todayWeekStart.setHours(0, 0, 0, 0);

    return this.currentWeekStart <= todayWeekStart;
  }

  prevWeek() {
    if (this.isPrevWeekDisabled) return;
    this.currentWeekStart.setDate(this.currentWeekStart.getDate() - 7);
    this.calculateWeekDays();
  }

  nextWeek() {
    this.currentWeekStart.setDate(this.currentWeekStart.getDate() + 7);
    this.calculateWeekDays();
  }

  prevTeren() {
    if (!this.objekat || !this.objekat.tereni) return;
    this.currentTerenIndex = (this.currentTerenIndex - 1 + this.objekat.tereni.length) % this.objekat.tereni.length;
    this.currentTeren = this.objekat.tereni[this.currentTerenIndex];
  }

  nextTeren() {
    if (!this.objekat || !this.objekat.tereni) return;
    this.currentTerenIndex = (this.currentTerenIndex + 1) % this.objekat.tereni.length;
    this.currentTeren = this.objekat.tereni[this.currentTerenIndex];
  }

  getLocalDateStr(date: Date): string {
    return date.getFullYear() + '-' + 
           String(date.getMonth() + 1).padStart(2, '0') + '-' + 
           String(date.getDate()).padStart(2, '0');
  }

  fetchData() {
    if (!this.objekat || this.weekDays.length === 0) return;

    let datumOd = this.getLocalDateStr(this.weekDays[0]);
    let datumDo = this.getLocalDateStr(this.weekDays[6]);

    this.service.getKalendarZauzeca(this.objekat._id, datumOd, datumDo).subscribe(res => {
      this.rezervacije = res.rezervacije;
      this.treninzi = res.treninzi;
    });
  }

  getCellState(day: Date, hour: number): { type: string, text: string } {
    if (!this.objekat || !this.currentTeren) return { type: 'siva', text: '' };

    let radnoOd = this.objekat.radno_vreme_od ? parseInt(this.objekat.radno_vreme_od.split(':')[0]) : 8;
    let radnoDo = this.objekat.radno_vreme_do ? parseInt(this.objekat.radno_vreme_do.split(':')[0]) : 22;

    if (hour < radnoOd || hour >= radnoDo) {
      return { type: 'siva', text: '' };
    }

    let dayStr = this.getLocalDateStr(day);
    
    // Check treninzi
    let tr = this.treninzi.find(t => {
      if (t.datum !== dayStr) return false;
      let odH = parseInt(t.od.split(':')[0]);
      let doH = parseInt(t.do.split(':')[0]);
      return hour >= odH && hour < doH;
    });
    if (tr) {
      return { type: 'crvena', text: 'Zauzeto (Trening)' };
    }

    // Check rezervacije (must match teren id)
    let rez = this.rezervacije.find(r => {
      if (r.datum !== dayStr) return false;
      if (r.idTeren && r.idTeren.toString() !== this.currentTeren._id?.toString()) return false;
      let odH = parseInt(r.od.split(':')[0]);
      let doH = parseInt(r.do.split(':')[0]);
      return hour >= odH && hour < doH;
    });
    if (rez) {
      return { type: 'crvena', text: 'Zauzeto (Rezervacija)' };
    }

    return { type: 'zelena', text: 'Slobodno' };
  }
}
