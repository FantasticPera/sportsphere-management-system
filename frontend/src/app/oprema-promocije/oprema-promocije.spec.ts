import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpremaPromocije } from './oprema-promocije';

describe('OpremaPromocije', () => {
  let component: OpremaPromocije;
  let fixture: ComponentFixture<OpremaPromocije>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OpremaPromocije]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OpremaPromocije);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
