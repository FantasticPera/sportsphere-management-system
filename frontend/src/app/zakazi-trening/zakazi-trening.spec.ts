import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ZakaziTrening } from './zakazi-trening';

describe('ZakaziTrening', () => {
  let component: ZakaziTrening;
  let fixture: ComponentFixture<ZakaziTrening>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ZakaziTrening]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ZakaziTrening);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
