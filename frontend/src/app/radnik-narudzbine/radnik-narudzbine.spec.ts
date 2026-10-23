import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RadnikNarudzbine } from './radnik-narudzbine';

describe('RadnikNarudzbine', () => {
  let component: RadnikNarudzbine;
  let fixture: ComponentFixture<RadnikNarudzbine>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RadnikNarudzbine]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RadnikNarudzbine);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
