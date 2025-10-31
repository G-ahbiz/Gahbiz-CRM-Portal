import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrdersCrm } from './orders-crm';

describe('OrdersCrm', () => {
  let component: OrdersCrm;
  let fixture: ComponentFixture<OrdersCrm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrdersCrm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrdersCrm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
