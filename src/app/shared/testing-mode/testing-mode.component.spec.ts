import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestingModeComponent } from './testing-mode.component';

describe('TestingModeComponent', () => {
  let component: TestingModeComponent;
  let fixture: ComponentFixture<TestingModeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestingModeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestingModeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
