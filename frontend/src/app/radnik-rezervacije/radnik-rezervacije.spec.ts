import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RadnikRezervacije } from './radnik-rezervacije';

describe('RadnikRezervacije', () => {
  let component: RadnikRezervacije;
  let fixture: ComponentFixture<RadnikRezervacije>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RadnikRezervacije]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RadnikRezervacije);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
