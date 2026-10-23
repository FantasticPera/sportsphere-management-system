import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangepassformComponent } from './changepassform-component';

describe('ChangepassformComponent', () => {
  let component: ChangepassformComponent;
  let fixture: ComponentFixture<ChangepassformComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChangepassformComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChangepassformComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
