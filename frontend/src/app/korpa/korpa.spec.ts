import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Korpa } from './korpa';

describe('Korpa', () => {
  let component: Korpa;
  let fixture: ComponentFixture<Korpa>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Korpa]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Korpa);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
