import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Oglasi } from './oglasi';

describe('Oglasi', () => {
  let component: Oglasi;
  let fixture: ComponentFixture<Oglasi>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Oglasi]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Oglasi);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
