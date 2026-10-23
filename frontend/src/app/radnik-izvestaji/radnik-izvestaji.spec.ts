import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RadnikIzvestaji } from './radnik-izvestaji';

describe('RadnikIzvestaji', () => {
  let component: RadnikIzvestaji;
  let fixture: ComponentFixture<RadnikIzvestaji>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RadnikIzvestaji]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RadnikIzvestaji);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
