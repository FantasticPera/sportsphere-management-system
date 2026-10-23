import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Zahtevi } from './zahtevi';

describe('Zahtevi', () => {
  let component: Zahtevi;
  let fixture: ComponentFixture<Zahtevi>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Zahtevi]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Zahtevi);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
