import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TruckOpsFormComponent } from './truck-ops-form.component';

describe('TruckOpsFormComponent', () => {
  let component: TruckOpsFormComponent;
  let fixture: ComponentFixture<TruckOpsFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TruckOpsFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TruckOpsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
