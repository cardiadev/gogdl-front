import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParkingCardComponent } from './parking-card.component';

describe('ParkingCardComponent', () => {
  let component: ParkingCardComponent;
  let fixture: ComponentFixture<ParkingCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParkingCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ParkingCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
